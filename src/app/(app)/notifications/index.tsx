import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  AlertTriangle,
  Bell,
  CreditCard,
  Droplets,
  ReceiptText,
  Wrench,
  type LucideIcon,
} from "lucide-react-native";
import { AppBar } from "@/components/layout/app-bar";
import { Badge, type BadgeVariant } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui";
import { useActiveAlerts, useNotificationHistory } from "@/features/notifications/queries";
import { formatDateTime } from "@/lib/utils";
import { colors } from "@/theme/colors";

const NTF_TYPE: Record<string, { label: string; icon: LucideIcon }> = {
  payment_completed: { label: "Thanh toán", icon: CreditCard },
  payment_failed: { label: "Thanh toán", icon: CreditCard },
  alert_outage: { label: "Cắt nước", icon: AlertTriangle },
  alert_maintenance: { label: "Bảo trì", icon: Wrench },
  alert_quality: { label: "Chất lượng nước", icon: Droplets },
  ticket_status_changed: { label: "Cập nhật", icon: ReceiptText },
  debt_reminder: { label: "Nhắc nợ", icon: ReceiptText },
};

const SEVERITY: Record<string, BadgeVariant> = { high: "destructive", medium: "warning", low: "default" };

export default function NotificationsScreen() {
  const alerts = useActiveAlerts();
  const history = useNotificationHistory();

  const activeAlerts = alerts.data?.alerts ?? [];
  const notifications = history.data?.notifications ?? [];

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-background">
      <AppBar title="Thông báo" />
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40, gap: 16 }}>
        {/* Active alerts */}
        {activeAlerts.length > 0 ? (
          <View className="gap-2">
            <Text className="px-1 text-sm font-bold text-foreground">Cảnh báo đang hoạt động</Text>
            {activeAlerts.map((a) => (
              <View key={a.id} className="gap-1.5 rounded-2xl border border-coral/30 bg-coral-soft p-4">
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center gap-2">
                    <AlertTriangle size={16} color={colors.destructive} />
                    <Text className="text-[14px] font-bold text-foreground">{a.description}</Text>
                  </View>
                  {a.severity ? <Badge variant={SEVERITY[a.severity] ?? "default"}>{a.severity}</Badge> : null}
                </View>
                <Text className="text-xs text-muted-foreground">Khu vực: {a.affectedArea}</Text>
                <Text className="text-xs text-muted-foreground">
                  Dự kiến: {formatDateTime(a.expectedStartTime)} → {formatDateTime(a.expectedEndTime)}
                </Text>
              </View>
            ))}
          </View>
        ) : alerts.isLoading ? (
          <Skeleton className="h-24 w-full" />
        ) : null}

        {/* History */}
        <View className="gap-2">
          <Text className="px-1 text-sm font-bold text-foreground">Lịch sử thông báo</Text>
          {history.isLoading ? (
            <View className="gap-2">
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </View>
          ) : notifications.length === 0 ? (
            <Text className="px-1 text-sm text-muted-foreground">Chưa có thông báo.</Text>
          ) : (
            notifications.map((n) => {
              const meta = NTF_TYPE[n.type] ?? { label: "Thông báo", icon: Bell };
              const Icon = meta.icon;
              return (
                <View key={n.id} className="flex-row gap-3 rounded-xl border border-line bg-card p-3.5">
                  <View className="h-9 w-9 items-center justify-center rounded-lg bg-aqua-soft">
                    <Icon size={16} color={colors.deep} />
                  </View>
                  <View className="flex-1 gap-0.5">
                    <Text className="text-[13px] font-semibold text-foreground">{meta.label}</Text>
                    <Text className="text-[13px] leading-snug text-muted-foreground">{n.contentSummary}</Text>
                    <Text className="text-xs text-muted-foreground">
                      {formatDateTime(n.timestamp)} · {n.channel}
                    </Text>
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
