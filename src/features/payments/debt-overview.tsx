"use client";

import { useState } from "react";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Checkbox,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui";
import { EmptyState, ErrorState } from "@/components/state";
import { useOutstandingDebt } from "./queries";
import { PaymentDialog } from "./payment-dialog";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { AgingBreakdown } from "@/lib/types/entities";

const agingLabels: { key: keyof AgingBreakdown; label: string; tone: string }[] = [
  { key: "current", label: "Dưới hạn", tone: "bg-emerald-500" },
  { key: "31-60", label: "31–60 ngày", tone: "bg-amber-500" },
  { key: "61-90", label: "61–90 ngày", tone: "bg-orange-500" },
  { key: ">90", label: "Trên 90 ngày", tone: "bg-red-500" },
];

export function DebtOverview() {
  const debt = useOutstandingDebt();
  const [selected, setSelected] = useState<string[]>([]);
  const [payOpen, setPayOpen] = useState(false);

  function toggle(id: string) {
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  }

  const selectedTotal =
    debt.data?.debts
      .filter((d) => selected.includes(d.invoiceRef))
      .reduce((sum, d) => sum + d.amount, 0) ?? 0;

  if (debt.isLoading)
    return (
      <div className="space-y-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  if (debt.isError)
    return <ErrorState onRetry={() => debt.refetch()} message="Không tải được dữ liệu công nợ." />;
  if (!debt.data || debt.data.totalCount === 0)
    return (
      <Card>
        <CardContent>
          <EmptyState
            title="Không có công nợ"
            description="Bạn không có khoản nợ nào chưa thanh toán."
          />
        </CardContent>
      </Card>
    );

  return (
    <div className="space-y-4">
      {/* Aging summary cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="py-4">
            <p className="text-xs text-muted-foreground">Tổng công nợ</p>
            <p className="text-xl font-bold text-destructive">
              {formatCurrency(debt.data.totalAmount)}
            </p>
          </CardContent>
        </Card>
        {agingLabels.map(({ key, label, tone }) => (
          <Card key={key}>
            <CardContent className="py-4">
              <div className="flex items-center gap-2">
                <span className={`h-2.5 w-2.5 rounded-full ${tone}`} />
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
              <p className="text-lg font-semibold">
                {formatCurrency(debt.data.agingBreakdown[key])}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Debt table with selection */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="text-base">Hóa đơn nợ</CardTitle>
            <CardDescription>Chọn để thanh toán gộp nhiều hóa đơn</CardDescription>
          </div>
          <Button disabled={selected.length === 0} onClick={() => setPayOpen(true)}>
            Thanh toán ({selected.length})
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10" />
                <TableHead>Hóa đơn</TableHead>
                <TableHead>Hạn</TableHead>
                <TableHead className="text-right">Số tiền</TableHead>
                <TableHead className="text-right">Quá hạn (ngày)</TableHead>
                <TableHead>Nhóm tuổi nợ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {debt.data.debts.map((d) => (
                <TableRow key={d.invoiceRef} data-state={selected.includes(d.invoiceRef) ? "selected" : undefined}>
                  <TableCell>
                    <Checkbox
                      checked={selected.includes(d.invoiceRef)}
                      onCheckedChange={() => toggle(d.invoiceRef)}
                      aria-label={`Chọn ${d.invoiceRef}`}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{d.invoiceRef}</TableCell>
                  <TableCell>{formatDate(d.dueDate)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(d.amount)}</TableCell>
                  <TableCell className="text-right">{d.daysOverdue}</TableCell>
                  <TableCell className="capitalize">{d.agingBucket}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <PaymentDialog
        open={payOpen}
        onOpenChange={setPayOpen}
        invoiceIds={selected}
        total={selectedTotal}
      />
    </div>
  );
}
