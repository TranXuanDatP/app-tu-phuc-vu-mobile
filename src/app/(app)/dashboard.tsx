import { Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import Svg, { Circle } from "react-native-svg";
import { LinearGradient } from "expo-linear-gradient";
import {
  AlertTriangle,
  Bell,
  ChevronRight,
  CreditCard,
  FileText,
  MessageSquare,
  PhoneCall,
  ShieldCheck,
  Siren,
  type LucideIcon,
} from "lucide-react-native";
import { Skeleton } from "@/components/ui";
import { useCustomerProfile } from "@/features/customers/queries";
import { useInvoices } from "@/features/invoices/queries";
import { useConsumption } from "@/features/meters/queries";
import { useCutoffSchedule } from "@/features/water-cutoff/queries";
import { useProfileStatus } from "@/features/auth/hooks";
import { formatCurrency, formatDate, formatNumber } from "@/lib/utils";
import { toast } from "@/lib/toast";
import { colors } from "@/theme/colors";

export default function DashboardScreen() {
  const profile = useCustomerProfile();
  const invoices = useInvoices({ status: "unpaid", limit: 1 });
  const consumption = useConsumption();
  const cutoff = useCutoffSchedule("CP-DMA-1");
  // Binding status — drives the limited-mode banner. poll=true so a `linked` flip (after
  // a successful bind on the bind screen) is picked up live and the banner updates. Bounded
  // + paused on background (see useProfileStatus).
  const me = useProfileStatus({ poll: true });
  const profileComplete = me.data?.linked === true;
  const bill = invoices.data?.invoices[0];
  const outage = cutoff.data?.schedules[0];
  const insets = useSafeAreaInsets();

  const readings = (consumption.data?.readings ?? [])
    .slice()
    .sort((a, b) => a.month.localeCompare(b.month));
  const current = readings.at(-1)?.volume ?? 0;
  const forecast = Math.round(current * 1.5);
  const pct = forecast > 0 ? Math.min(100, Math.round((current / forecast) * 100)) : 0;

  return (
    <ScrollView className="flex-1 bg-background" contentContainerStyle={{ paddingBottom: 16 }}>
      {/* Hero */}
      <LinearGradient
        colors={[colors.deep, "#0d7391", colors.aqua]}
        style={{ paddingHorizontal: 20, paddingBottom: 80, paddingTop: insets.top + 16 }}
      >
        <View className="absolute right-4 top-4 rounded-xl bg-white/15 px-2.5 py-1.5">
          <Text className="text-[13px] font-extrabold tracking-wide text-white">QUAWACO</Text>
        </View>
        <Text className="text-[13px] font-medium text-white/90">Chào buổi sáng,</Text>
        {profileComplete ? (
          profile.isLoading ? (
            <Skeleton className="mt-1 h-6 w-40 bg-white/25" />
          ) : (
            <Text className="text-xl font-extrabold text-white">
              {profile.data?.fullName ?? "Khách hàng"}
            </Text>
          )
        ) : null}
        {profileComplete ? (
          <Text className="mt-0.5 max-w-[80%] text-xs text-white/85">
            {profile.data?.address?.fullAddress ?? ""}
          </Text>
        ) : null}

        {/* Bill card — hidden in limited mode (don't leak fixture billing data) */}
        {profileComplete && (
        <View className="mt-5 rounded-[18px] border border-white/25 bg-white/15 p-4">
          {invoices.isLoading ? (
            <Skeleton className="h-20 w-full bg-white/25" />
          ) : bill ? (
            <View>
              <Text className="text-xs text-white/90">Hóa đơn kỳ {bill.period} · cần thanh toán</Text>
              <Text className="mt-0.5 text-[30px] font-extrabold leading-none text-white">
                {formatCurrency(bill.totalAmount)}
              </Text>
              <Text className="mt-1.5 text-xs text-white/90">
                {bill.dueDate ? `Hạn thanh toán ${formatDate(bill.dueDate)}` : ""}
              </Text>
              <Pressable
                onPress={() => bill && router.push(`/payments/${bill.invoiceId}`)}
                className="mt-3 w-full rounded-xl bg-white py-3 active:opacity-80"
              >
                <Text className="text-center text-[15px] font-extrabold text-deep">Thanh toán ngay</Text>
              </Pressable>
            </View>
          ) : (
            <Text className="text-sm text-white/90">Không có hóa đơn chờ thanh toán 🎉</Text>
          )}
        </View>
        )}
      </LinearGradient>

      {/* Quick actions — hidden in limited mode */}
      {profileComplete && (
      <View className="-mt-10 flex-row gap-2.5 px-4">
        <QuickAction
          icon={CreditCard}
          label="Thanh toán"
          onPress={() => (bill ? router.push(`/payments/${bill.invoiceId}`) : router.push("/invoices"))}
        />
        <QuickAction icon={FileText} label="Hợp đồng" onPress={() => router.push("/contracts")} />
        <QuickAction icon={Bell} label="Thông báo" onPress={() => router.push("/notifications")} />
        <QuickAction icon={Siren} label="Báo sự cố" onPress={() => router.push("/incidents")} />
      </View>
      )}

      {/* Limited-mode banner — until the customer binding is verified */}
      {!profileComplete && me.data ? (
        <View className="px-4 pt-4">
          <LinearGradient colors={[colors.deep, colors.aqua]} style={{ borderRadius: 18, padding: 16 }}>
            <View className="flex-row items-center gap-2">
              <ShieldCheck size={18} color="white" />
              <Text className="flex-1 text-[15px] font-bold text-white">
                Liên kết tài khoản để dùng đầy đủ tính năng
              </Text>
            </View>
            <Text className="mt-1 text-[12.5px] leading-snug text-white/90">
              Một số tính năng bị giới hạn cho đến khi bạn liên kết tài khoản với hồ sơ khách hàng.
            </Text>
            <Pressable
              onPress={() => router.push("/bind")}
              className="mt-3 items-center rounded-xl bg-white py-2.5 active:opacity-80"
            >
              <Text className="text-[14px] font-extrabold text-deep">Liên kết tài khoản</Text>
            </Pressable>
          </LinearGradient>
        </View>
      ) : null}

      {/* Consumption — hidden in limited mode */}
      {profileComplete && (
      <View className="px-4 pt-4">
        <Pressable
          onPress={() => router.push("/meters")}
          className="flex-row items-center gap-3.5 rounded-[18px] border border-line bg-card p-4 active:opacity-80"
        >
          <Ring pct={pct} value={`${formatNumber(current)}m³`} />
          <View className="min-w-0 flex-1">
            <Text className="text-[15px] font-extrabold text-foreground">Tiêu thụ tháng này</Text>
            <Text className="text-[12.5px] text-muted-foreground">
              {bill ? `Dự báo hóa đơn ~${formatCurrency(bill.totalAmount)}` : "Đang tải…"}
            </Text>
          </View>
          <ChevronRight size={20} color={colors.mutedForeground} />
        </Pressable>
      </View>
      )}

      {/* Alerts */}
      <View className="gap-3 px-4 pt-5">
        <Text className="px-1 text-sm font-bold text-foreground">Cảnh báo & thông báo</Text>
        {outage ? (
          <Alert
            title={`Bảo trì đường ống khu vực ${cutoff.data?.areaId}`}
            desc={`${formatDate(outage.from)} · ${outage.reason}`}
            tone="info"
          />
        ) : cutoff.isLoading ? (
          <Skeleton className="h-16 w-full" />
        ) : null}
        <Alert
          title="Kiểm tra tiêu thụ định kỳ"
          desc="Nếu hóa đơn tăng bất thường, hãy kiểm tra đồng hồ khi không dùng nước — có thể rò rỉ."
          tone="warn"
        />

        <Text className="px-1 pt-1 text-sm font-bold text-foreground">Cần hỗ trợ?</Text>
        <LinearGradient
          colors={[colors.deep, colors.aqua]}
          style={{ borderRadius: 18, padding: 16 }}
        >
          <Text className="text-[15px] font-bold text-white">Chúng tôi luôn sẵn sàng hỗ trợ bạn</Text>
          <Text className="mt-0.5 text-[12.5px] leading-snug text-white/90">
            Chat với nhân viên hoặc gọi tổng đài 24/7 để được giải đáp thắc mắc, khiếu nại.
          </Text>
          <View className="mt-3 flex-row gap-2.5">
            <Pressable
              onPress={() => router.push("/chat")}
              className="flex-1 flex-row items-center justify-center gap-1.5 rounded-xl bg-white py-2.5 active:opacity-80"
            >
              <MessageSquare size={16} color={colors.deep} />
              <Text className="text-[13px] font-bold text-deep">Chat nhân viên</Text>
            </Pressable>
            <Pressable
              onPress={() => toast.info("Tổng đài — sắp có")}
              className="flex-1 flex-row items-center justify-center gap-1.5 rounded-xl bg-white/20 py-2.5 active:opacity-80"
            >
              <PhoneCall size={16} color={colors.white} />
              <Text className="text-[13px] font-bold text-white">Tổng đài</Text>
            </Pressable>
          </View>
        </LinearGradient>
      </View>
    </ScrollView>
  );
}

function QuickAction({
  icon: Icon,
  label,
  onPress,
}: {
  icon: LucideIcon;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-1 items-center gap-1.5 rounded-2xl border border-line bg-card p-3 active:opacity-80"
    >
      <View className="h-11 w-11 items-center justify-center rounded-2xl bg-aqua-soft">
        <Icon size={20} color={colors.deep} />
      </View>
      <Text className="text-[11.5px] font-semibold leading-tight text-foreground">{label}</Text>
    </Pressable>
  );
}

function Alert({ title, desc, tone }: { title: string; desc: string; tone: "info" | "warn" | "ok" }) {
  const tones = {
    info: "bg-aqua-soft/60 border-line",
    warn: "bg-amber-soft border-[#f1dcbb]",
    ok: "bg-mint-soft border-[#cbe9dc]",
  } as const;
  const ic = {
    info: "bg-aqua-soft",
    warn: "bg-[#f6d9ae]",
    ok: "bg-[#c4e7d8]",
  } as const;
  const icColor = { info: colors.deep, warn: "#8a5410", ok: "#0f6b4c" } as const;
  return (
    <View className={`flex-row items-start gap-3 rounded-[18px] border p-3.5 ${tones[tone]}`}>
      <View className={`h-9 w-9 shrink-0 items-center justify-center rounded-xl ${ic[tone]}`}>
        <AlertTriangle size={16} color={icColor[tone]} />
      </View>
      <View className="min-w-0 flex-1">
        <Text className="text-sm font-bold text-foreground">{title}</Text>
        <Text className="mt-0.5 text-[12.5px] leading-snug text-muted-foreground">{desc}</Text>
      </View>
    </View>
  );
}

/** Circular progress ring (replaces web's conic-gradient — unsupported on RN). */
function Ring({ pct, value }: { pct: number; value: string }) {
  const size = 52;
  const stroke = 6;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const dash = (pct / 100) * c;
  return (
    <View style={{ width: size, height: size, justifyContent: "center", alignItems: "center" }}>
      <Svg width={size} height={size}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={colors.foam} strokeWidth={stroke} fill="none" />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={colors.aqua}
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={`${dash} ${c - dash}`}
          strokeLinecap="round"
          rotation={-90}
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      <Text className="absolute text-[12px] font-extrabold text-deep">{value}</Text>
    </View>
  );
}
