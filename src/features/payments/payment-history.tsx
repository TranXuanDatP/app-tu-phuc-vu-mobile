"use client";

import {
  Badge,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui";
import { EmptyState, ErrorState } from "@/components/state";
import { usePaymentHistory } from "./queries";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { PaymentHistoryItem } from "@/lib/types/entities";

const statusMap: Record<
  PaymentHistoryItem["status"],
  { label: string; variant: "success" | "warning" | "destructive" | "secondary" }
> = {
  completed: { label: "Hoàn tất", variant: "success" },
  pending: { label: "Đang xử lý", variant: "warning" },
  failed: { label: "Thất bại", variant: "destructive" },
  refunded: { label: "Hoàn tiền", variant: "secondary" },
};

const methodLabel: Record<string, string> = {
  qr_code: "Mã QR",
  payment_link: "Liên kết",
  bank_transfer: "Chuyển khoản",
};

export function PaymentHistory({ limit }: { limit?: number }) {
  const { data, isLoading, isError, refetch } = usePaymentHistory({ limit });

  if (isLoading) return <Skeleton className="h-48 w-full" />;
  if (isError) return <ErrorState onRetry={() => refetch()} />;
  if (!data?.payments.length)
    return <EmptyState title="Chưa có giao dịch nào" />;

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Mã giao dịch</TableHead>
          <TableHead>Hóa đơn</TableHead>
          <TableHead className="text-right">Số tiền</TableHead>
          <TableHead>Phương thức</TableHead>
          <TableHead>Ngày</TableHead>
          <TableHead>Trạng thái</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.payments.map((p) => (
          <TableRow key={p.paymentId}>
            <TableCell className="font-medium">{p.paymentId}</TableCell>
            <TableCell className="max-w-[200px] truncate" title={p.invoiceIds.join(", ")}>
              {p.invoiceIds.length > 1
                ? `${p.invoiceIds.length} hóa đơn`
                : p.invoiceIds[0]}
            </TableCell>
            <TableCell className="text-right font-medium">
              {formatCurrency(p.amount)}
            </TableCell>
            <TableCell>{methodLabel[p.method] ?? p.method}</TableCell>
            <TableCell>{formatDate(p.createdAt)}</TableCell>
            <TableCell>
              <Badge variant={statusMap[p.status].variant}>
                {statusMap[p.status].label}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
