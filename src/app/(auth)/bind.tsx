import { useEffect, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { PhoneCall, ShieldCheck } from "lucide-react-native";
import { useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import {
  AUTH_ME_KEY,
  useBind,
  useBindInit,
  useProfileStatus,
} from "@/features/auth/hooks";
import { toast } from "@/lib/toast";
import { ApiError } from "@/lib/types/api";
import type { ChallengeDescriptor, ResolveCandidate } from "@/lib/types/entities";
import { colors } from "@/theme/colors";

/**
 * Bind flow entry (post-OTP). Resolves the OTP-verified session phone server-side via
 * /auth/bind-init (the mobile NEVER sends phone or a free-form customerRef), then branches:
 *   one        → challenge (echo customerRef + challenge descriptor from BE)
 *   many ≤3    → pick a candidate by address hint → challenge
 *   many+capped → "nhiều KH gắn số — tổng đài" (no enumeration surface; N>3 = shared/recycled)
 *   none       → register (new customer)
 * Already-linked users bounce to /dashboard.
 *
 * Challenge renders ONE input from the BE's descriptor (label + inputMode); the user does
 * NOT pick a factor (an attacker would pick the easiest). secretType is echoed from the
 * descriptor, never hardcoded. customerRef is echoed from bind-init, never user-typed.
 */
export default function BindScreen() {
  const me = useProfileStatus();
  const bindInit = useBindInit();
  const bind = useBind();
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<ResolveCandidate | null>(null);
  const [secret, setSecret] = useState("");
  const [lockout, setLockout] = useState<{ reason: string; untilMs: number } | null>(null);

  // Resolve on mount (once). Already-linked → bounce to dashboard.
  useEffect(() => {
    if (me.data?.linked) {
      router.replace("/dashboard");
      return;
    }
    if (me.data && !bindInit.data && !bindInit.isPending && !bindInit.isError) {
      bindInit.mutate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [me.data?.linked, me.data]);

  // Lockout countdown — clear when the window elapses.
  useEffect(() => {
    if (!lockout) return;
    const id = setInterval(() => {
      if (Date.now() >= lockout.untilMs) {
        setLockout(null);
        clearInterval(id);
      }
    }, 1000);
    return () => clearInterval(id);
  }, [lockout]);

  if (me.isLoading || bindInit.isPending) return <View className="flex-1 bg-background" />;

  const resolve = bindInit.data;

  // capped → too many matches (shared/recycled phone). No candidates → hotline.
  if (resolve?.status === "many" && resolve.capped) {
    return (
      <Center
        icon={<PhoneCall size={34} color={colors.deep} />}
        title="Có nhiều hồ sơ gắn với số này"
        desc="Vui lòng liên hệ tổng đài để được hỗ trợ liên kết tài khoản."
        cta="Liên hệ tổng đài"
        onCta={() => toast.info("Tổng đài — sắp có")}
      />
    );
  }

  // none → no Customer 360 record for this phone → register a new one.
  if (resolve?.status === "none") {
    return (
      <Center
        icon={<ShieldCheck size={34} color={colors.deep} />}
        title="Chưa có hồ sơ khách hàng"
        desc="Số điện thoại của bạn chưa có trong hệ thống. Đăng ký để tạo hồ sơ mới."
        cta="Đăng ký tài khoản"
        onCta={() => router.push("/register")}
      />
    );
  }

  // many (≤3) → pick a candidate by address hint before challenging.
  if (resolve?.status === "many" && !selected) {
    return <Picker candidates={resolve.candidates ?? []} onPick={setSelected} />;
  }

  const challenge: ChallengeDescriptor | undefined =
    selected?.challenge ?? resolve?.challenge;
  const customerRef: string | undefined = selected?.customerRef ?? resolve?.customerRef;
  const hint: string | undefined = selected?.maskedHint ?? resolve?.maskedHint;

  async function submit() {
    if (!customerRef || !challenge || !secret.trim() || lockout) return;
    try {
      const res = await bind.mutateAsync({
        customerRef,
        secretType: challenge.type,
        secretValue: secret.trim(),
      });
      if (res.bound) {
        toast.success("Liên kết tài khoản thành công!");
        await queryClient.refetchQueries({ queryKey: AUTH_ME_KEY });
        router.replace("/dashboard");
      } else {
        setSecret("");
        toast.error("Thông tin không đúng. Vui lòng kiểm tra lại.");
      }
    } catch (err) {
      if (err instanceof ApiError && err.code === "BINDING_LOCKED") {
        const d = (err.details ?? {}) as { reason?: string; retryAfterSec?: number };
        setLockout({
          reason: d.reason ?? "user_ref",
          untilMs: Date.now() + (d.retryAfterSec ?? 900) * 1000,
        });
      } else {
        toast.error(
          (err as { message?: string })?.message ?? "Không liên kết được. Vui lòng thử lại.",
        );
      }
    }
  }

  // Lockout view (overrides challenge). Distinct messages per reason — a legitimately-
  // locked customer (customer_ref tier: someone ELSE hammered their ref) must NOT be told
  // "you entered wrong", or they will re-enter the correct secret forever and fail.
  if (lockout) {
    const remaining = Math.max(0, Math.round((lockout.untilMs - Date.now()) / 1000));
    const mins = Math.floor(remaining / 60);
    const hrs = Math.floor(mins / 60);
    const left = remaining >= 3600 ? `${hrs} giờ` : `${mins} phút`;
    const msg =
      lockout.reason === "customer_ref"
        ? `Tài khoản tạm khoá do nhiều lần thử sai (có thể từ thiết bị khác). Thử lại sau ${left} hoặc liên hệ tổng đài.`
        : lockout.reason === "session"
          ? `Bạn đã thử sai quá nhiều. Vui lòng thử lại sau ${left}.`
          : `Bạn nhập sai quá 3 lần. Vui lòng thử lại sau ${left}.`;
    return (
      <Center
        icon={<ShieldCheck size={34} color={colors.deep} />}
        title="Tạm thời khoá liên kết"
        desc={msg}
      />
    );
  }

  if (!challenge || !customerRef) {
    // Should not happen (resolve shape) — recover by restarting.
    return (
      <Center
        icon={<ShieldCheck size={34} color={colors.deep} />}
        title="Không thể tiếp tục liên kết"
        desc="Phiên không hợp lệ. Vui lòng thử lại."
        cta="Thử lại"
        onCta={() => {
          setSelected(null);
          setSecret("");
          bindInit.mutate();
        }}
      />
    );
  }

  const inputMode = challenge.inputMode === "numeric" ? "numeric" : "default";

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{ flexGrow: 1 }}
      keyboardShouldPersistTaps="handled"
    >
      <LinearGradient
        colors={[colors.deep, colors.aqua]}
        style={{ paddingHorizontal: 24, paddingBottom: 28, paddingTop: 56 }}
      >
        <Text className="text-center text-2xl font-extrabold text-white">Liên kết tài khoản</Text>
        <Text className="mt-1.5 text-center text-[13px] text-white/90">
          Xác minh bạn là chủ hồ sơ khách hàng
        </Text>
      </LinearGradient>

      <View className="flex-1 gap-4 px-5 py-6">
        {hint ? (
          <View className="rounded-[14px] border border-line bg-card p-3.5">
            <Text className="text-[12px] font-semibold text-muted-foreground">Hồ sơ nhận được</Text>
            <Text className="mt-0.5 text-[14px] font-bold text-foreground">{hint}</Text>
          </View>
        ) : null}

        <View className="gap-1.5">
          <Text className="text-[12.5px] font-semibold text-muted-foreground">
            {challenge.label}
          </Text>
          <Input
            keyboardType={inputMode}
            autoCapitalize="none"
            autoCorrect={false}
            placeholder={challenge.inputMode === "numeric" ? "Nhập số" : "Nhập thông tin"}
            value={secret}
            onChangeText={setSecret}
            className="h-14 rounded-[13px] border-[1.5px] border-line text-base"
          />
        </View>

        <Pressable
          onPress={submit}
          disabled={!secret.trim() || bind.isPending}
          className="w-full rounded-[14px] bg-deep py-[15px] active:opacity-80 disabled:opacity-60"
        >
          <Text className="text-center text-[15.5px] font-extrabold text-white">
            {bind.isPending ? "Đang xác thực..." : "Xác minh"}
          </Text>
        </Pressable>

        <Text className="text-center text-xs leading-relaxed text-muted-foreground">
          Thông tin xác minh được bảo mật và chỉ dùng để liên kết tài khoản.
        </Text>
      </View>
    </ScrollView>
  );
}

/** Centered icon + title + desc, optional CTA. Used for none/capped/error/lockout. */
function Center({
  icon,
  title,
  desc,
  cta,
  onCta,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  cta?: string;
  onCta?: () => void;
}) {
  return (
    <View className="flex-1 items-center justify-center bg-background px-8">
      <View className="mb-4 h-[72px] w-[72px] items-center justify-center rounded-[22px] bg-aqua-soft">
        {icon}
      </View>
      <Text className="text-center text-xl font-extrabold text-foreground">{title}</Text>
      <Text className="mt-2 text-center text-[13px] leading-relaxed text-muted-foreground">
        {desc}
      </Text>
      {cta && onCta ? (
        <Pressable
          onPress={onCta}
          className="mt-6 h-[50px] w-full max-w-[280px] items-center justify-center rounded-[14px] bg-deep active:opacity-80"
        >
          <Text className="text-[15px] font-extrabold text-white">{cta}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

/** N≤3 candidates — pick the one that's yours by address hint. */
function Picker({
  candidates,
  onPick,
}: {
  candidates: ResolveCandidate[];
  onPick: (c: ResolveCandidate) => void;
}) {
  return (
    <ScrollView className="flex-1 bg-background" contentContainerStyle={{ flexGrow: 1 }}>
      <LinearGradient
        colors={[colors.deep, colors.aqua]}
        style={{ paddingHorizontal: 24, paddingBottom: 28, paddingTop: 56 }}
      >
        <Text className="text-center text-2xl font-extrabold text-white">Chọn hồ sơ của bạn</Text>
        <Text className="mt-1.5 text-center text-[13px] text-white/90">
          Có nhiều hồ sơ gắn với số này — chọn đúng hồ sơ của bạn
        </Text>
      </LinearGradient>
      <View className="gap-3 px-5 py-6">
        {candidates.map((c) => (
          <Pressable
            key={c.customerRef}
            onPress={() => onPick(c)}
            className="rounded-[14px] border border-line bg-card p-4 active:opacity-80"
          >
            <Text className="text-[14px] font-bold text-foreground">{c.maskedHint}</Text>
            <Text className="mt-1 text-[12px] text-aqua">Chọn hồ sơ này →</Text>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}
