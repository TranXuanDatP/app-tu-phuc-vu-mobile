"use client";

import Link from "next/link";
import {
  AlertTriangle,
  Clock,
  ReceiptText,
  Wallet,
} from "lucide-react";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui";
import { EmptyState, ErrorState } from "@/components/state";
import { useCustomerProfile } from "@/features/customers/queries";
import { useInvoices } from "@/features/invoices/queries";
import { useOutstandingDebt } from "@/features/payments/queries";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { AgingBreakdown, PaymentStatus } from "@/lib/types/entities";

const classificationLabel: Record<string, string> = {
  sinh_hoat: "Sinh hoạt",
  san_xuat: "Sản xuất",
  hanh_chinh: "Hành chính",
};

const agingLabels: { key: keyof AgingBreakdown; label: string }[] = [
  { key: "current", label: "Dưới hạn" },
  { key: "31-60", label: "31–60 ngày" },
  { key: "61-90", label: "61–90 ngày" },
  { key: ">90", label: "Trên 90 ngày" },
];

function statusBadge(status: PaymentStatus) {
  const map: Record<PaymentStatus, { label: string; variant: "success" | "warning" | "destructive" | "secondary" }> = {
    paid: { label: "Đã thanh toán", variant: "success" },
    unpaid: { label: "Chưa thanh toán", variant: "warning" },
    overdue: { label: "Quá hạn", variant: "destructive" },
    cancelled: { label: "Đã hủy", variant: "secondary" },
  };
  const s = map[status];
  return <Badge variant={s.variant}>{s.label}</Badge>;
}

export default function DashboardPage() {
  const profile = useCustomerProfile();
  const debt = useOutstandingDebt();
  const invoices = useInvoices({ status: "unpaid", limit: 5 });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {profile.data
            ? `Xin chào, ${profile.data.fullName}`
            : "Tổng quan"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {profile.data
            ? `${profile.data.address.fullAddress} · ${
                classificationLabel[profile.data.classification] ?? profile.data.classification
              }`
            : "Tổng quan tài khoản dịch vụ cấp nước của bạn"}
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tổng công nợ
            </CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {debt.isLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : debt.isError ? (
              <p className="text-sm text-destructive">Lỗi tải</p>
            ) : (
              <p className="text-2xl font-bold text-destructive">
                {formatCurrency(debt.data?.totalAmount)}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              {debt.data?.totalCount ?? 0} hóa đơn chưa thanh toán
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Quá hạn
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {debt.isLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <p className="text-2xl font-bold">
                {(debt.data?.agingBreakdown["61-90"] ?? 0) +
                  (debt.data?.agingBreakdown[">90"] ?? 0) > 0
                  ? formatCurrency(
                      (debt.data?.agingBreakdown["61-90"] ?? 0) +
                        (debt.data?.agingBreakdown[">90"] ?? 0),
                    )
                  : "0 ₫"}
              </p>
            )}
            <p className="text-xs text-muted-foreground">Trên 60 ngày quá hạn</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Hóa đơn chờ thanh toán
            </CardTitle>
            <ReceiptText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {invoices.isLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <p className="text-2xl font-bold">{invoices.data?.totalCount ?? 0}</p>
            )}
            <p className="text-xs text-muted-foreground">Cần xử lý</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Aging breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="h-4 w-4" /> Phân loại công nợ theo thời hạn
            </CardTitle>
            <CardDescription>Nợ chia theo số ngày quá hạn</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {debt.isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-9 w-full" />
              ))
            ) : debt.isError ? (
              <ErrorState onRetry={() => debt.refetch()} />
            ) : (
              agingLabels.map(({ key, label }) => {
                const value = debt.data?.agingBreakdown[key] ?? 0;
                const max = debt.data?.totalAmount || 1;
                return (
                  <div key={key} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{label}</span>
                      <span className="font-medium">{formatCurrency(value)}</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${Math.min(100, (value / max) * 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        {/* Unpaid invoices */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">Hóa đơn chưa thanh toán</CardTitle>
              <CardDescription>Các hóa đơn gần nhất cần xử lý</CardDescription>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href="/invoices">Xem tất cả</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {invoices.isLoading ? (
              <Skeleton className="h-32 w-full" />
            ) : invoices.isError ? (
              <ErrorState onRetry={() => invoices.refetch()} />
            ) : !invoices.data?.invoices.length ? (
              <EmptyState title="Không có hóa đơn chưa thanh toán" />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Kỳ</TableHead>
                    <TableHead className="text-right">Số tiền</TableHead>
                    <TableHead>Trạng thái</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.data.invoices.map((inv) => (
                    <TableRow key={inv.invoiceId}>
                      <TableCell className="font-medium">
                        <Link
                          href={`/invoices/${inv.invoiceId}`}
                          className="hover:underline"
                        >
                          {inv.period}
                        </Link>
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(inv.totalAmount)}
                      </TableCell>
                      <TableCell>{statusBadge(inv.paymentStatus)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
