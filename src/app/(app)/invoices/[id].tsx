import { ScrollView, Text, View, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import { useInvoice } from "@/features/invoices/queries";
import { AppBar } from "@/components/layout/app-bar";
import { Badge, type BadgeVariant } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui";
import { toast } from "@/lib/toast";
import { formatCurrency, formatDate } from "@/lib/utils";

const STATUS_BADGE: Record<string, { variant: BadgeVariant; label: string }> = {
  paid: { variant: "success", label: "Đã trả" },
  unpaid: { variant: "warning", label: "Chưa trả" },
  overdue: { variant: "destructive", label: "Quá hạn" },
  cancelled: { variant: "outline", label: "Đã hủy" },
};

export default function InvoiceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: invoice, isLoading } = useInvoice(id);

  if (isLoading || !invoice) {
    return (
      <SafeAreaView edges={["top"]} className="flex-1 bg-background">
        <AppBar title="Chi tiết hóa đơn" />
        <View className="gap-3 p-5">
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-40 w-full" />
        </View>
      </SafeAreaView>
    );
  }

  const sb = STATUS_BADGE[invoice.paymentStatus] ?? STATUS_BADGE.unpaid;
  const feesTotal = invoice.fees.reduce((s, f) => s + f.amount, 0);

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-background">
      <AppBar title="Chi tiết hóa đơn" subtitle={`Kỳ ${invoice.period}`} />
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40, gap: 16 }}>
        {/* Total card */}
        <View className="rounded-2xl bg-deep p-5">
          <View className="flex-row items-center justify-between">
            <Text className="text-sm text-white/80">Tổng tiền</Text>
            <Badge variant={sb.variant}>{sb.label}</Badge>
          </View>
          <Text className="mt-1 text-3xl font-extrabold text-white">
            {formatCurrency(invoice.totalAmount)}
          </Text>
          <Text className="mt-1 text-xs text-white/80">
            Hạn thanh toán {invoice.dueDate ? formatDate(invoice.dueDate) : "—"}
          </Text>
          {invoice.paymentStatus === "unpaid" || invoice.paymentStatus === "overdue" ? (
            <Pressable
              onPress={() => router.push(`/payments/${invoice.invoiceId}`)}
              className="mt-4 items-center rounded-xl bg-white py-3 active:opacity-80"
            >
              <Text className="text-[15px] font-extrabold text-deep">Thanh toán ngay</Text>
            </Pressable>
          ) : null}
        </View>

        {/* Line items */}
        <View className="gap-2">
          <Text className="text-sm font-bold text-foreground">Chi tiết sử dụng</Text>
          {invoice.lineItems.map((li, i) => (
            <View key={i} className="rounded-xl border border-line bg-card p-3.5">
              <Text className="text-[13px] font-semibold text-foreground">{li.description}</Text>
              <View className="mt-1 flex-row justify-between">
                <Text className="text-xs text-muted-foreground">
                  {li.volume} m³ × {formatCurrency(li.unitPrice)}
                </Text>
                <Text className="text-xs font-bold text-foreground">{formatCurrency(li.amount)}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Summary */}
        <View className="gap-1.5 rounded-xl border border-line bg-card p-4">
          <Row label="Tiền nước (tạm tính)" value={formatCurrency(invoice.subtotal)} />
          <Row label="Phí phụ trợ" value={formatCurrency(feesTotal)} />
          <View className="my-1 h-px bg-line" />
          <Row label="Tổng cộng" value={formatCurrency(invoice.totalAmount)} bold />
        </View>

        {/* Meta */}
        <View className="gap-1.5 rounded-xl border border-line bg-card p-4">
          <MetaRow label="Mã hóa đơn" value={invoice.invoiceId} />
          <MetaRow label="Mã CQT" value={invoice.cqtCode ?? "—"} />
          <MetaRow label="Mã tra cứu" value={invoice.lookupCode ?? "—"} />
          <MetaRow label="Ngày phát hành" value={invoice.issueDate ? formatDate(invoice.issueDate) : "—"} />
        </View>

        <Pressable
          onPress={() => toast.info("Tải PDF — xây ở phase sau")}
          className="items-center rounded-xl border border-line bg-card py-3 active:opacity-80"
        >
          <Text className="text-sm font-semibold text-deep">Tải hóa đơn PDF</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <View className="flex-row justify-between">
      <Text className={`text-sm ${bold ? "font-bold text-foreground" : "text-muted-foreground"}`}>{label}</Text>
      <Text className={`text-sm ${bold ? "font-extrabold text-deep" : "font-semibold text-foreground"}`}>{value}</Text>
    </View>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row justify-between gap-3">
      <Text className="text-xs text-muted-foreground">{label}</Text>
      <Text className="flex-1 text-right text-xs font-semibold text-foreground">{value}</Text>
    </View>
  );
}
