"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui";
import { EmptyState, ErrorState } from "@/components/state";
import { useInvoices } from "@/features/invoices/queries";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { InvoiceStatusFilter, PaymentStatus } from "@/lib/types/entities";

function statusBadge(status: PaymentStatus) {
  const map: Record<
    PaymentStatus,
    { label: string; variant: "success" | "warning" | "destructive" | "secondary" }
  > = {
    paid: { label: "Đã thanh toán", variant: "success" },
    unpaid: { label: "Chưa thanh toán", variant: "warning" },
    overdue: { label: "Quá hạn", variant: "destructive" },
    cancelled: { label: "Đã hủy", variant: "secondary" },
  };
  const s = map[status];
  return <Badge variant={s.variant}>{s.label}</Badge>;
}

const STATUS_OPTIONS: { value: InvoiceStatusFilter | "all"; label: string }[] = [
  { value: "all", label: "Tất cả" },
  { value: "unpaid", label: "Chưa thanh toán" },
  { value: "overdue", label: "Quá hạn" },
  { value: "paid", label: "Đã thanh toán" },
];

const PAGE_SIZE = 10;

export default function InvoicesPage() {
  return (
    <Suspense fallback={<div className="h-48" />}>
      <InvoicesPageContent />
    </Suspense>
  );
}

function InvoicesPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const status = (searchParams.get("status") as InvoiceStatusFilter | "all") || "all";
  const page = Number(searchParams.get("page") ?? "1");

  const { data, isLoading, isError, refetch } = useInvoices({
    status: status === "all" ? undefined : status,
    page,
    limit: PAGE_SIZE,
  });

  function updateParams(next: { status?: string; page?: number }) {
    const params = new URLSearchParams(searchParams.toString());
    if (next.status !== undefined) {
      if (next.status === "all") params.delete("status");
      else params.set("status", next.status);
      params.delete("page"); // reset pagination on filter change
    }
    if (next.page !== undefined) {
      next.page <= 1 ? params.delete("page") : params.set("page", String(next.page));
    }
    const qs = params.toString();
    router.replace(qs ? `/invoices?${qs}` : "/invoices");
  }

  const totalPages = data?.totalPages ?? 1;
  const canPrev = page > 1;
  const canNext = page < totalPages;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Hóa đơn</h1>
          <p className="text-sm text-muted-foreground">
            Quản lý và thanh toán hóa đơn dịch vụ cấp nước
          </p>
        </div>
        <Select
          value={status}
          onValueChange={(v) => updateParams({ status: v })}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Trạng thái" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Danh sách hóa đơn{" "}
            {data ? `(${data.totalCount})` : ""}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-48 w-full" />
          ) : isError ? (
            <ErrorState onRetry={() => refetch()} />
          ) : !data?.invoices.length ? (
            <EmptyState title="Không có hóa đơn" description="Thay đổi bộ lọc để xem các kỳ khác." />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mã hóa đơn</TableHead>
                  <TableHead>Kỳ</TableHead>
                  <TableHead>Ngày phát hành</TableHead>
                  <TableHead>Hạn thanh toán</TableHead>
                  <TableHead className="text-right">Số tiền</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.invoices.map((inv) => (
                  <TableRow key={inv.invoiceId}>
                    <TableCell className="font-medium">{inv.invoiceId}</TableCell>
                    <TableCell>{inv.period}</TableCell>
                    <TableCell>{formatDate(inv.issueDate)}</TableCell>
                    <TableCell>{inv.dueDate ? formatDate(inv.dueDate) : "—"}</TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(inv.totalAmount)}
                    </TableCell>
                    <TableCell>{statusBadge(inv.paymentStatus)}</TableCell>
                    <TableCell className="text-right">
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/invoices/${inv.invoiceId}`}>Chi tiết</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {/* Pagination */}
          {data && data.invoices.length > 0 && (
            <div className="flex items-center justify-between pt-4">
              <p className="text-sm text-muted-foreground">
                Trang {page} / {Math.max(totalPages, 1)}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!canPrev}
                  onClick={() => updateParams({ page: page - 1 })}
                >
                  Trước
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!canNext}
                  onClick={() => updateParams({ page: page + 1 })}
                >
                  Sau
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
