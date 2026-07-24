import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { QrCode, Building2, Link2 } from "lucide-react-native";
import { AppBar } from "@/components/layout/app-bar";
import { Skeleton } from "@/components/ui";
import { useInvoice } from "@/features/invoices/queries";
import { useCreatePayment } from "@/features/payments/queries";
import { formatCurrency, formatDate } from "@/lib/utils";
import { colors } from "@/theme/colors";
import { ProfileGate } from "@/features/auth/profile-gate";
import type { PaymentMethod } from "@/lib/types/entities";

const METHODS: { value: PaymentMethod; label: string; icon: typeof QrCode; desc: string }[] = [
  { value: "qr_code", label: "Mã QR", icon: QrCode, desc: "Quét bởi app ngân hàng" },
  { value: "bank_transfer", label: "Chuyển khoản", icon: Building2, desc: "Theo số tài khoản" },
  { value: "payment_link", label: "Link thanh toán", icon: Link2, desc: "Mở trang web" },
];

export default function PayScreen() {
  return (
    <ProfileGate>
      <PayContent />
    </ProfileGate>
  );
}

function PayContent() {
  const { invoiceId } = useLocalSearchParams<{ invoiceId: string }>();
  const { data: invoice, isLoading } = useInvoice(invoiceId);
  const create = useCreatePayment();
  const [method, setMethod] = useState<PaymentMethod>("qr_code");
  const [result, setResult] = useState<{ qrCodeUrl: string | null; paymentLink: string | null; paymentId: string; status: string } | null>(null);

  function pay() {
    create.mutate(
      { invoiceId, method },
      {
        onSuccess: (r) =>
          setResult({ qrCodeUrl: r.qrCodeUrl ?? null, paymentLink: r.paymentLink ?? null, paymentId: r.paymentId, status: r.status }),
      },
    );
  }

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-background">
      <AppBar title="Thanh toán hóa đơn" subtitle={invoiceId} />
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40, gap: 16 }}>
        {/* Amount */}
        {isLoading || !invoice ? (
          <Skeleton className="h-28 w-full rounded-2xl" />
        ) : (
          <View className="items-center rounded-2xl bg-deep p-5">
            <Text className="text-xs text-white/80">Số tiền thanh toán</Text>
            <Text className="mt-1 text-3xl font-extrabold text-white">{formatCurrency(invoice.totalAmount)}</Text>
            <Text className="mt-1 text-xs text-white/80">
              Hóa đơn {invoice.invoiceId} · Kỳ {invoice.period}
            </Text>
            {invoice.dueDate ? (
              <Text className="text-xs text-white/70">Hạn: {formatDate(invoice.dueDate)}</Text>
            ) : null}
          </View>
        )}

        {result ? (
          <View className="gap-3 rounded-2xl border border-mint/40 bg-mint-soft p-5">
            <Text className="text-base font-bold text-foreground">Đơn thanh toán đã tạo</Text>
            <View className="gap-1">
              <Text className="text-xs text-muted-foreground">Mã: {result.paymentId}</Text>
              <Text className="text-xs text-muted-foreground">Trạng thái: {result.status}</Text>
            </View>
            {result.qrCodeUrl || result.paymentLink ? (
              <Pressable
                onPress={() => {
                  const url = result.paymentLink ?? result.qrCodeUrl;
                  if (url) WebBrowser.openBrowserAsync(url);
                }}
                className="items-center rounded-xl bg-deep py-3 active:opacity-80"
              >
                <Text className="text-sm font-bold text-white">Mở trang thanh toán</Text>
              </Pressable>
            ) : null}
          </View>
        ) : (
          <>
            {/* Method */}
            <View className="gap-2">
              <Text className="text-sm font-bold text-foreground">Phương thức</Text>
              {METHODS.map((m) => {
                const active = method === m.value;
                const Icon = m.icon;
                return (
                  <Pressable
                    key={m.value}
                    onPress={() => setMethod(m.value)}
                    className={`flex-row items-center gap-3 rounded-xl border p-4 ${active ? "border-deep bg-aqua-soft/40" : "border-line bg-card"}`}
                  >
                    <View className={`h-10 w-10 items-center justify-center rounded-xl ${active ? "bg-deep" : "bg-secondary"}`}>
                      <Icon size={18} color={active ? "white" : colors.deep} />
                    </View>
                    <View className="flex-1">
                      <Text className="text-[14px] font-bold text-foreground">{m.label}</Text>
                      <Text className="text-xs text-muted-foreground">{m.desc}</Text>
                    </View>
                    <View className={`h-5 w-5 rounded-full border-2 ${active ? "border-deep bg-deep" : "border-line"}`} />
                  </Pressable>
                );
              })}
            </View>

            <Pressable
              onPress={pay}
              disabled={create.isPending || !invoice}
              className="mt-2 items-center rounded-xl bg-deep py-3.5 active:opacity-80 disabled:opacity-60"
            >
              <Text className="text-[15px] font-extrabold text-white">
                {create.isPending ? "Đang tạo..." : `Thanh toán ${invoice ? formatCurrency(invoice.totalAmount) : ""}`}
              </Text>
            </Pressable>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
