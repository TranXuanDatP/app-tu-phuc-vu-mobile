import { FlatList, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Plus } from "lucide-react-native";
import { useMyReports } from "@/features/incidents/queries";
import { Badge, type BadgeVariant } from "@/components/ui/badge";
import { SkeletonList, ErrorRetry } from "@/components/ui";
import { formatDateTime } from "@/lib/utils";
import { colors } from "@/theme/colors";
import { ProfileGate } from "@/features/auth/profile-gate";
import type { IncidentReport } from "@/features/incidents/queries";

const TYPE_LABEL: Record<string, string> = {
  water_outage: "Mất nước",
  water_quality: "Chất lượng nước",
  low_pressure: "Yếu áp",
  meter_issue: "Lỗi đồng hồ",
  other: "Khác",
};

const STATUS_BADGE: Record<string, { variant: BadgeVariant; label: string }> = {
  pending: { variant: "warning", label: "Chờ tiếp nhận" },
  in_progress: { variant: "default", label: "Đang xử lý" },
  resolved: { variant: "success", label: "Đã xử lý" },
  cancelled: { variant: "outline", label: "Đã hủy" },
};

export default function IncidentsScreen() {
  return (
    <ProfileGate>
      <IncidentsContent />
    </ProfileGate>
  );
}

function IncidentsContent() {
  const { data, isLoading, isError, refetch, isRefetching } = useMyReports();
  const reports = data?.reports ?? [];

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-background">
      <View className="flex-row items-center justify-between px-5 pb-2 pt-3">
        <View>
          <Text className="text-2xl font-extrabold text-foreground">Phản ánh sự cố</Text>
          <Text className="mt-0.5 text-sm text-muted-foreground">Theo dõi các báo cáo của bạn</Text>
        </View>
        <Pressable
          onPress={() => router.push("/incidents/create")}
          className="h-10 w-10 items-center justify-center rounded-full bg-deep active:opacity-80"
        >
          <Plus size={22} color="white" />
        </Pressable>
      </View>

      <FlatList
        data={reports}
        keyExtractor={(item: IncidentReport) => item.reportId}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32, paddingTop: 8, gap: 12 }}
        onRefresh={() => refetch()}
        refreshing={isRefetching}
        renderItem={({ item }) => {
          const sb = STATUS_BADGE[item.status] ?? { variant: "outline" as BadgeVariant, label: item.status };
          return (
            <Pressable
              onPress={() => router.push(`/incidents/${item.reportId}`)}
              className="gap-2 rounded-2xl border border-line bg-card p-4 active:opacity-80"
            >
              <View className="flex-row items-center justify-between">
                <Text className="text-[15px] font-bold text-foreground">
                  {TYPE_LABEL[item.type] ?? item.type}
                </Text>
                <Badge variant={sb.variant}>{sb.label}</Badge>
              </View>
              <Text className="text-[13px] text-muted-foreground" numberOfLines={2}>
                {item.description}
              </Text>
              <View className="flex-row items-center justify-between">
                <Text className="text-xs text-muted-foreground">{item.reportId}</Text>
                <Text className="text-xs text-muted-foreground">
                  {formatDateTime(item.createdAt)}
                </Text>
              </View>
            </Pressable>
          );
        }}
        ListEmptyComponent={
          isError ? (
            <ErrorRetry onRetry={() => refetch()} />
          ) : isLoading ? (
            <SkeletonList count={2} height={96} />
          ) : (
            <View className="mt-16 items-center">
              <Text className="text-sm text-muted-foreground">Chưa có báo cáo nào.</Text>
              <Pressable
                onPress={() => router.push("/incidents/create")}
                className="mt-4 rounded-xl bg-deep px-5 py-2.5 active:opacity-80"
              >
                <Text className="text-sm font-bold text-white">Báo sự cố đầu tiên</Text>
              </Pressable>
            </View>
          )
        }
      />
    </SafeAreaView>
  );
}
