import { useState } from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronRight } from "lucide-react-native";
import { router } from "expo-router";
import { useInvoices } from "@/features/invoices/queries";
import { Badge, type BadgeVariant } from "@/components/ui/badge";
import { SkeletonList, EmptyState, ErrorRetry } from "@/components/ui";
import { formatCurrency, formatDate } from "@/lib/utils";
import { colors } from "@/theme/colors";
import type { InvoiceListItem, InvoiceStatusFilter } from "@/lib/types/entities";

const FILTERS: { label: string; value: InvoiceStatusFilter | undefined }[] = [
  { label: "Tất cả", value: undefined },
  { label: "Chưa trả", value: "unpaid" },
  { label: "Quá hạn", value: "overdue" },
  { label: "Đã trả", value: "paid" },
];

const STATUS_BADGE: Record<string, { variant: BadgeVariant; label: string }> = {
  paid: { variant: "success", label: "Đã trả" },
  unpaid: { variant: "warning", label: "Chưa trả" },
  overdue: { variant: "destructive", label: "Quá hạn" },
  cancelled: { variant: "outline", label: "Đã hủy" },
};

export default function InvoicesScreen() {
  const [status, setStatus] = useState<InvoiceStatusFilter | undefined>(undefined);
  const { data, isLoading, isError, refetch, isRefetching } = useInvoices({ status, limit: 20 });

  const invoices = data?.invoices ?? [];

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-background">
      <View className="px-5 pb-2 pt-3">
        <Text className="text-2xl font-extrabold text-foreground">Hóa đơn</Text>
        <Text className="mt-0.5 text-sm text-muted-foreground">Theo dõi hóa đơn tiền nước</Text>
      </View>

      {/* Status filter */}
      <View className="flex-row gap-2 px-5 py-3">
        {FILTERS.map((f) => {
          const active = status === f.value;
          return (
            <Pressable
              key={f.label}
              onPress={() => setStatus(f.value)}
              className={`rounded-full px-3.5 py-1.5 ${active ? "bg-deep" : "bg-card border border-line"}`}
            >
              <Text className={`text-[13px] font-semibold ${active ? "text-white" : "text-muted-foreground"}`}>
                {f.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <FlatList
        data={invoices}
        keyExtractor={(item: InvoiceListItem) => item.invoiceId}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32, paddingTop: 4, gap: 12 }}
        onRefresh={() => refetch()}
        refreshing={isRefetching}
        renderItem={({ item }) => {
          const sb = STATUS_BADGE[item.paymentStatus] ?? STATUS_BADGE.unpaid;
          return (
            <Pressable
              onPress={() => router.push(`/invoices/${item.invoiceId}`)}
              className="flex-row items-center gap-3 rounded-2xl border border-line bg-card p-4 active:opacity-80"
            >
              <View className="h-11 w-11 items-center justify-center rounded-xl bg-aqua-soft">
                <Text className="text-[11px] font-bold text-deep">{item.period.slice(5)}</Text>
              </View>
              <View className="flex-1">
                <View className="flex-row items-center gap-2">
                  <Text className="text-[15px] font-bold text-foreground">
                    {formatCurrency(item.totalAmount)}
                  </Text>
                  <Badge variant={sb.variant}>{sb.label}</Badge>
                </View>
                <Text className="mt-0.5 text-xs text-muted-foreground">
                  Kỳ {item.period}
                  {item.dueDate ? ` · Hạn ${formatDate(item.dueDate)}` : ""}
                </Text>
              </View>
              <ChevronRight size={18} color={colors.mutedForeground} />
            </Pressable>
          );
        }}
        ListEmptyComponent={
          isError ? (
            <ErrorRetry onRetry={() => refetch()} />
          ) : isLoading ? (
            <SkeletonList count={3} height={64} />
          ) : (
            <EmptyState text="Không có hóa đơn 🎉" />
          )
        }
      />
    </SafeAreaView>
  );
}
