import { FlatList, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { ChevronRight, FileText } from "lucide-react-native";
import { AppBar } from "@/components/layout/app-bar";
import { Badge, type BadgeVariant } from "@/components/ui/badge";
import { SkeletonList, EmptyState, ErrorRetry } from "@/components/ui";
import { useContracts } from "@/features/contracts/queries";
import { colors } from "@/theme/colors";
import type { ContractListItem } from "@/lib/types/entities";

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

export default function ContractsScreen() {
  const { data, isLoading, isError, refetch, isRefetching } = useContracts();
  const contracts = data?.contracts ?? [];

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-background">
      <AppBar title="Hợp đồng nước" />
      <FlatList
        data={contracts}
        keyExtractor={(item: ContractListItem) => item.contractId}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32, paddingTop: 12, gap: 12 }}
        onRefresh={() => refetch()}
        refreshing={isRefetching}
        renderItem={({ item }) => {
          const sb = STATUS[item.status] ?? { variant: "outline" as BadgeVariant, label: item.status };
          return (
            <Pressable
              onPress={() => router.push(`/contracts/${item.contractId}`)}
              className="gap-2 rounded-2xl border border-line bg-card p-4 active:opacity-80"
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-2">
                  <View className="h-9 w-9 items-center justify-center rounded-lg bg-aqua-soft">
                    <FileText size={16} color={colors.deep} />
                  </View>
                  <Text className="text-[14px] font-bold text-foreground">{item.contractId}</Text>
                </View>
                <Badge variant={sb.variant}>{sb.label}</Badge>
              </View>
              <Text className="text-[13px] text-muted-foreground" numberOfLines={2}>
                {item.address}
              </Text>
              <View className="flex-row items-center justify-between">
                <Text className="text-xs text-muted-foreground">
                  {SUB_TYPE[item.subscriptionType] ?? item.subscriptionType}
                  {item.meterId ? ` · ${item.meterId}` : ""}
                </Text>
                <ChevronRight size={16} color={colors.mutedForeground} />
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
            <EmptyState text="Chưa có hợp đồng." />
          )
        }
      />
    </SafeAreaView>
  );
}
