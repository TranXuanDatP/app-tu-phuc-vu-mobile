import { useEffect, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { router } from "expo-router";
import { Droplet, ShieldCheck } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Input } from "@/components/ui/input";
import { usePhoneLogin } from "@/features/auth/hooks";
import { useSession } from "@/lib/auth-client";
import { colors } from "@/theme/colors";

// Local VN mobile digits WITHOUT the leading 0 — the +84 prefix is fixed in the UI.
const LOCAL_PHONE_RE = /^\d{9,10}$/;

export default function LoginScreen() {
  const { data: session, isPending } = useSession();
  const login = usePhoneLogin();
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [otp, setOtp] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(0);

  // Post-OTP routing → bind flow. /bind re-resolves via bind-init and branches:
  // already-linked → dashboard; one/many≤3 → challenge; many-capped → hotline;
  // none → register. Replaces the legacy check-registration branch (bind-init is
  // the single resolve path now — check-registration is skipped to avoid a second
  // resolve and the legacy users.customerId auto-link).
  useEffect(() => {
    if (!session) return;
    router.replace("/bind");
  }, [session]);

  // 30s resend countdown while on the OTP step (button enables at 0).
  useEffect(() => {
    if (login.step !== "otp") return;
    setSecondsLeft(30);
    const id = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(id);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [login.step]);

  if (isPending) return <View className="flex-1 bg-background" />;

  function handleSendOtp() {
    const local = phone.trim().replace(/\D/g, "").replace(/^0+/, "");
    if (!LOCAL_PHONE_RE.test(local)) {
      setPhoneError("Nhập 9–10 chữ số, bỏ số 0 ở đầu (vd: 912 345 678)");
      return;
    }
    setPhoneError(null);
    login.sendOtp(`+84${local}`);
  }

  return (
    <View className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <LinearGradient colors={[colors.deep, colors.aqua]} style={{ paddingHorizontal: 24, paddingBottom: 36, paddingTop: 64 }}>
          <View className="mb-4 h-[70px] w-[70px] items-center justify-center self-center rounded-[22px] bg-white/20">
            <Droplet color="white" size={32} />
          </View>
          <Text className="text-center text-2xl font-extrabold text-white">My QUAWACO</Text>
          <Text className="mt-1.5 text-center text-[13.5px] text-white/90">
            Nước sạch trong tầm tay — mọi lúc, mọi nơi
          </Text>
        </LinearGradient>

        <View className="flex-1 px-5 py-6">
          {login.step === "phone" ? (
            <View className="gap-4">
              <View className="gap-1.5">
                <Text className="text-[12.5px] font-semibold text-muted-foreground">Số điện thoại</Text>
                <View className="flex-row items-center gap-2.5 rounded-[13px] border-[1.5px] border-line bg-card px-3.5 py-3">
                  {/* text-base matches the TextInput font — keeps "+84" on the same
                      baseline as the typed digits (default Text size is smaller). */}
                  <Text className="text-base font-bold text-muted-foreground">+84</Text>
                  <Input
                    keyboardType="phone-pad"
                    placeholder="912 345 678"
                    value={phone}
                    onChangeText={(v) => {
                      setPhone(v.replace(/\D/g, "").replace(/^0+/, ""));
                      if (phoneError) setPhoneError(null);
                    }}
                    className="h-8 flex-1 border-0 bg-transparent p-0 text-base leading-none"
                  />
                </View>
                {phoneError ? <Text className="text-sm text-destructive">{phoneError}</Text> : null}
              </View>
              <Pressable
                onPress={handleSendOtp}
                disabled={login.isSending}
                className="w-full rounded-[14px] bg-deep py-[15px] active:opacity-80 disabled:opacity-60"
              >
                <Text className="text-center text-[15.5px] font-extrabold text-white">
                  {login.isSending ? "Đang gửi..." : "Gửi mã OTP"}
                </Text>
              </Pressable>
              <Text className="text-center text-xs leading-relaxed text-muted-foreground">
                Bằng việc tiếp tục, bạn đồng ý với Điều khoản & Chính sách bảo mật.
              </Text>
            </View>
          ) : (
            <View className="gap-4">
              <View className="gap-1.5">
                <Text className="text-[12.5px] font-semibold text-muted-foreground">
                  Mã OTP gửi đến {login.phoneNumber}
                </Text>
                <Input
                  keyboardType="number-pad"
                  maxLength={6}
                  placeholder="• • • • • •"
                  value={otp}
                  onChangeText={(v) => setOtp(v.replace(/\D/g, "").slice(0, 6))}
                  className="h-14 rounded-[13px] border-[1.5px] border-line text-center text-2xl font-extrabold text-deep"
                />
              </View>
              <Pressable
                onPress={() => {
                  if (otp.length === 6) login.verifyOtp(otp);
                }}
                disabled={login.isVerifying || otp.length !== 6}
                className="w-full rounded-[14px] bg-deep py-[15px] disabled:opacity-60"
              >
                <Text className="text-center text-[15.5px] font-extrabold text-white">
                  {login.isVerifying ? "Đang xác thực..." : "Xác thực"}
                </Text>
              </Pressable>
              <View className="flex-row items-center justify-between">
                <Pressable onPress={() => login.reset()}>
                  <Text className="text-sm font-semibold text-aqua">Đổi số</Text>
                </Pressable>
                <Pressable disabled={secondsLeft > 0} onPress={() => login.sendOtp(login.phoneNumber)}>
                  <Text className="text-sm font-semibold text-aqua">
                    {secondsLeft > 0 ? `Gửi lại sau ${secondsLeft}s` : "Gửi lại OTP"}
                  </Text>
                </Pressable>
              </View>
              <Text className="text-center text-xs text-muted-foreground">
                Mã có hiệu lực 5 phút. Môi trường dev: OTP in trong log BFF.
              </Text>
            </View>
          )}

          <View className="mt-7 flex-row items-center justify-center gap-2">
            <ShieldCheck size={16} color={colors.mutedForeground} />
            <Text className="text-[11.5px] text-muted-foreground">Xác thực bảo mật bởi better-auth</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
