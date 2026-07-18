import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useMeters, useMeterHistory } from "@/features/meters/queries";
import { AppBar } from "@/components/layout/app-bar";
import { Badge, type BadgeVariant } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui";
import { formatDate } from "@/lib/utils";

const EVENT_BADGE: Record<string, { variant: BadgeVariant; label: string }> = {
  installation: { variant: "default", label: "Lắp đặt" },
  calibration: { variant: "warning", label: "Hiệu chuẩn" },
  replacement: { variant: "success", label: "Thay thế" },
  repair: { variant: "destructive", label: "Sửa chữa" },
};

export default function MeterHistoryScreen() {
  const { data: metersData, isLoading: metersLoading } = useMeters();
  const meters = metersData?.meters ?? [];
  const firstMeterId = meters[0]?.meterId ?? "";
  const { data: history, isLoading: historyLoading } = useMeterHistory(firstMeterId);

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-background">
      <AppBar title="Lịch sử đồng hồ" />
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40, gap: 16 }}>
        {/* Meter list */}
        <View className="gap-2">
          <Text className="text-sm font-bold text-foreground">Đồng hồ của tôi</Text>
          {metersLoading ? (
            <Skeleton className="h-20 w-full" />
          ) : meters.length === 0 ? (
            <Text className="text-sm text-muted-foreground">Chưa có đồng hồ.</Text>
          ) : (
            meters.map((m) => (
              <View key={m.meterId} className="gap-1 rounded-xl border border-line bg-card p-4">
                <View className="flex-row items-center justify-between">
                  <Text className="text-[15px] font-bold text-foreground">{m.serialNumber}</Text>
                  <Badge variant={m.status === "active" ? "success" : "outline"}>
                    {m.status === "active" ? "Đang dùng" : m.status}
                  </Badge>
                </View>
                <Text className="text-xs text-muted-foreground">
                  {m.type} · {m.diameter} · {m.accuracyClass} · {m.manufactureYear}
                </Text>
                {m.installationDate ? (
                  <Text className="text-xs text-muted-foreground">
                    Lắp {formatDate(m.installationDate)}
                  </Text>
                ) : null}
              </View>
            ))
          )}
        </View>

        {/* Event timeline (first meter) */}
        <View className="gap-2">
          <Text className="text-sm font-bold text-foreground">Sự kiện ({firstMeterId || "—"})</Text>
          {historyLoading ? (
            <Skeleton className="h-32 w-full" />
          ) : (
            (history?.entries ?? []).map((e, i) => {
              const eb = EVENT_BADGE[e.eventType] ?? { variant: "outline" as BadgeVariant, label: e.eventType };
              return (
                <View key={i} className="flex-row gap-3 rounded-xl border border-line bg-card p-4">
                  <View className="flex-1 gap-1">
                    <View className="flex-row items-center gap-2">
                      <Badge variant={eb.variant}>{eb.label}</Badge>
                      <Text className="text-xs text-muted-foreground">{formatDate(e.eventDate)}</Text>
                    </View>
                    <Text className="text-[13px] font-semibold text-foreground">{e.description}</Text>
                    {e.performedBy ? (
                      <Text className="text-xs text-muted-foreground">— {e.performedBy}</Text>
                    ) : null}
                  </View>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
