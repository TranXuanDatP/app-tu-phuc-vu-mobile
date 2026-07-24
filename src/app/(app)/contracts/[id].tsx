import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import { AppBar } from "@/components/layout/app-bar";
import { Badge, type BadgeVariant } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui";
import { useContract } from "@/features/contracts/queries";
import { ProfileGate } from "@/features/auth/profile-gate";
import { formatCurrency, formatDate } from "@/lib/utils";

const SUB_TYPE: Record<string, string> = {
  residential: "Sinh hoạt",
  commercial: "Sản xuất",
  administrative: "Hành chính",
};

const STATUS: Record<string, { variant: BadgeVariant; label: string }> = {
  active: { variant: "success", label: "Đang hiệu lực" },
  expired: { variant: "outline", label: "Hết hạn" },
  suspended: { variant: "warning", label: "Tạm dừng" },
  terminated: { variant: "destructive", label: "Đã chấm dứt" },
};

export default function ContractDetailScreen() {
  return (
    <ProfileGate>
      <ContractDetailContent />
    </ProfileGate>
  );
}

function ContractDetailContent() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: c, isLoading } = useContract(id);

  if (isLoading || !c) {
    return (
      <SafeAreaView edges={["top"]} className="flex-1 bg-background">
        <AppBar title="Chi tiết hợp đồng" />
        <View className="gap-3 p-5">
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-40 w-full" />
        </View>
      </SafeAreaView>
    );
  }

  const sb = STATUS[c.status] ?? { variant: "outline" as BadgeVariant, label: c.status };

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-background">
      <AppBar title="Chi tiết hợp đồng" subtitle={c.contractId} />
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40, gap: 16 }}>
        <View className="gap-2 rounded-2xl bg-deep p-5">
          <View className="flex-row items-center justify-between">
            <Text className="text-base font-bold text-white">{c.contractId}</Text>
            <Badge variant={sb.variant}>{sb.label}</Badge>
          </View>
          <Text className="text-[13px] text-white/80">{c.address}</Text>
        </View>

        <View className="gap-2 rounded-2xl border border-line bg-card p-4">
          <Text className="text-sm font-bold text-foreground">Thông tin hợp đồng</Text>
          <Row label="Loại hình" value={SUB_TYPE[c.subscriptionType] ?? c.subscriptionType} />
          <Row label="Đồng hồ" value={c.meterId ?? "—"} />
          <Row label="Định mức" value={c.waterQuota != null ? `${c.waterQuota} m³/tháng` : "Không"} />
          <Row label="Bắt đầu" value={c.startDate ? formatDate(c.startDate) : "—"} />
          <Row label="Kết thúc" value={c.endDate ? formatDate(c.endDate) : "Vô thời hạn"} />
        </View>

        {c.pricingTerms ? (
          <View className="gap-2 rounded-2xl border border-line bg-card p-4">
            <Text className="text-sm font-bold text-foreground">Điều kiện giá</Text>
            <Row label="Giá cơ bản" value={formatCurrency(c.pricingTerms.basePrice)} />
            <Row label="Đơn vị" value={c.pricingTerms.currency} />
            <Row label="Chu kỳ" value={c.pricingTerms.billingCycle === "monthly" ? "Hàng tháng" : c.pricingTerms.billingCycle} />
          </View>
        ) : null}

        {c.specialConditions && c.specialConditions.length > 0 ? (
          <View className="gap-2 rounded-2xl border border-line bg-card p-4">
            <Text className="text-sm font-bold text-foreground">Điều kiện đặc biệt</Text>
            {c.specialConditions.map((cond, i) => (
              <View key={i} className="flex-row gap-2">
                <Text className="text-xs text-aqua">•</Text>
                <Text className="flex-1 text-[13px] leading-snug text-muted-foreground">{cond}</Text>
              </View>
            ))}
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row justify-between gap-3">
      <Text className="text-[13px] text-muted-foreground">{label}</Text>
      <Text className="flex-1 text-right text-[13px] font-semibold text-foreground">{value}</Text>
    </View>
  );
}
