"use client";

import {
  Badge,
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
import { useDebtHistory } from "./queries";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { AgingBucket } from "@/lib/types/entities";

const statusLabel: Record<string, string> = {
  outstanding: "Đang nợ",
  paid: "Đã thanh toán",
  written_off: "Đã xoá nợ",
};

const statusVariant: Record<string, "warning" | "success" | "secondary"> = {
  outstanding: "warning",
  paid: "success",
  written_off: "secondary",
};

const agingLabel: Record<AgingBucket, string> = {
  current: "Dưới hạn",
  "31-60": "31–60 ngày",
  "61-90": "61–90 ngày",
  ">90": "Trên 90 ngày",
};

export function DebtHistory() {
  const { data, isLoading, isError, refetch } = useDebtHistory();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Lịch sử công nợ</CardTitle>
        <CardDescription>
          Lịch sử các khoản nợ đã thanh toán hoặc xoá sổ
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-48 w-full" />
        ) : isError ? (
          <ErrorState onRetry={() => refetch()} message="Không tải được lịch sử công nợ." />
        ) : !data?.entries.length ? (
          <EmptyState title="Chưa có lịch sử công nợ" />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Hóa đơn</TableHead>
                <TableHead className="text-right">Số tiền</TableHead>
                <TableHead>Hạn</TableHead>
                <TableHead>Ngày thanh toán</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Nhóm tuổi khi trả</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.entries.map((e, i) => (
                <TableRow key={`${e.invoiceRef}-${i}`}>
                  <TableCell className="font-medium">{e.invoiceRef}</TableCell>
                  <TableCell className="text-right">{formatCurrency(e.amount)}</TableCell>
                  <TableCell>{formatDate(e.dueDate)}</TableCell>
                  <TableCell>{e.paidDate ? formatDate(e.paidDate) : "—"}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariant[e.status] ?? "secondary"}>
                      {statusLabel[e.status] ?? e.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {e.agingAtPayment ? agingLabel[e.agingAtPayment] ?? e.agingAtPayment : "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
