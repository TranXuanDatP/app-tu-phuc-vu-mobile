import { Image, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import { useReportDetail } from "@/features/incidents/queries";
import { AppBar } from "@/components/layout/app-bar";
import { Badge, type BadgeVariant } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui";
import { formatDateTime } from "@/lib/utils";

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

export default function ReportDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: report, isLoading } = useReportDetail(id);

  if (isLoading || !report) {
    return (
      <SafeAreaView edges={["top"]} className="flex-1 bg-background">
        <AppBar title="Chi tiết báo cáo" />
        <View className="gap-3 p-5">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-40 w-full" />
        </View>
      </SafeAreaView>
    );
  }

  const sb = STATUS_BADGE[report.status] ?? { variant: "outline" as BadgeVariant, label: report.status };
  const summary = report.incidentSummary;

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-background">
      <AppBar title="Chi tiết báo cáo" subtitle={report.reportId} />
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40, gap: 16 }}>
        {/* Header */}
        <View className="gap-2 rounded-2xl border border-line bg-card p-4">
          <View className="flex-row items-center justify-between">
            <Text className="text-lg font-extrabold text-foreground">
              {TYPE_LABEL[report.type] ?? report.type}
            </Text>
            <Badge variant={sb.variant}>{sb.label}</Badge>
          </View>
          <Text className="text-[13px] leading-snug text-muted-foreground">{report.description}</Text>
          <Text className="mt-1 text-xs text-muted-foreground">
            Gửi lúc {formatDateTime(report.createdAt)}
          </Text>
        </View>

        {/* Location */}
        {report.location.address ? (
          <View className="gap-1 rounded-xl border border-line bg-card p-4">
            <Text className="text-xs font-bold text-foreground">Địa điểm</Text>
            <Text className="text-[13px] text-muted-foreground">{report.location.address}</Text>
            {report.location.area ? (
              <Text className="text-xs text-muted-foreground">Khu vực: {report.location.area}</Text>
            ) : null}
          </View>
        ) : null}

        {/* Photos */}
        {report.photoUrls.length > 0 ? (
          <View className="gap-2">
            <Text className="text-sm font-bold text-foreground">Ảnh đính kèm</Text>
            <View className="flex-row flex-wrap gap-2">
              {report.photoUrls.map((uri, i) => (
                <Image key={i} source={{ uri }} className="h-24 w-24 rounded-xl" />
              ))}
            </View>
          </View>
        ) : null}

        {/* Linked incident */}
        {summary ? (
          <View className="gap-2 rounded-2xl bg-deep p-4">
            <Text className="text-sm font-bold text-white">Sự cố liên quan</Text>
            <Text className="text-xs text-white/80">Mã: {summary.incidentId}</Text>
            <View className="flex-row flex-wrap gap-2">
              <Pill label={`Mức độ: ${summary.severity}`} />
              <Pill label={`Th ảnh hưởng: ${summary.affectedCustomers}`} />
            </View>
            {summary.assignedTeam ? (
              <Text className="text-xs text-white/80">Đội xử lý: {summary.assignedTeam}</Text>
            ) : null}
          </View>
        ) : report.incidentId ? (
          <View className="rounded-xl border border-line bg-card p-4">
            <Text className="text-xs text-muted-foreground">
              Đã tiếp nhận thành sự cố {report.incidentId} — đang xử lý.
            </Text>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function Pill({ label }: { label: string }) {
  return (
    <View className="rounded-full bg-white/15 px-2.5 py-1">
      <Text className="text-[11px] font-semibold text-white">{label}</Text>
    </View>
  );
}
