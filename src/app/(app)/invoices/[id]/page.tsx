"use client";

import { use, useState } from "react";
import { Download, Mail } from "lucide-react";
import { AppBar } from "@/components/layout/app-bar";
import { Button, Skeleton } from "@/components/ui";
import { ErrorState } from "@/components/state";
import { useInvoice, useInvoicePdf } from "@/features/invoices/queries";
import { PaymentDialog } from "@/features/payments/payment-dialog";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import type { PaymentStatus } from "@/lib/types/entities";
import { toast } from "sonner";

const STATUS_LABEL: Record<PaymentStatus, string> = {
  paid: "Đã trả",
  unpaid: "Chưa trả",
  overdue: "Quá hạn",
  cancelled: "Đã hủy",
};
const STATUS_BADGE: Record<PaymentStatus, string> = {
  paid: "bg-mint-soft text-[#0f6b4c]",
  unpaid: "bg-amber-soft text-[#8a5410]",
  overdue: "bg-coral-soft text-[#b0331f]",
  cancelled: "bg-muted text-muted-foreground",
};

export default function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: invoice, isLoading, isError, refetch } = useInvoice(id);
  const [payOpen, setPayOpen] = useState(false);
  const canPay =
    !!invoice && (invoice.paymentStatus === "unpaid" || invoice.paymentStatus === "overdue");

  return (
    <div className="pb-4">
      <AppBar
        title={invoice ? `Hóa đơn kỳ ${invoice.period}` : "Hóa đơn"}
        sub="Hóa đơn điện tử · có mã CQT"
        back
      />

      {isLoading ? (
        <div className="p-4">
          <Skeleton className="h-80 w-full" />
        </div>
      ) : isError ? (
        <div className="p-4">
          <ErrorState onRetry={() => refetch()} />
        </div>
      ) : !invoice ? null : (
        <div className="space-y-4 p-4">
          <span
            className={cn(
              "inline-block rounded-full px-2.5 py-1 text-[11px] font-bold",
              STATUS_BADGE[invoice.paymentStatus],
            )}
          >
            {STATUS_LABEL[invoice.paymentStatus]}
          </span>

          {/* Info */}
          <div className="rounded-[18px] border border-line bg-card p-4 shadow-[0_6px_22px_rgba(10,42,56,.10)]">
            <Kv label="Kỳ" value={invoice.period} />
            <Kv label="Hợp đồng" value={invoice.contractId} />
            <Kv label="Ngày phát hành" value={formatDate(invoice.issueDate)} />
            <Kv label="Hạn thanh toán" value={invoice.dueDate ? formatDate(invoice.dueDate) : "—"} />
            <Kv label="Mã CQT" value={invoice.cqtCode ?? "—"} last />
          </div>

          {/* Tier breakdown */}
          <h2 className="px-1 text-sm font-bold">Chi tiết bậc thang giá</h2>
          <div className="rounded-[18px] border border-line bg-card p-4 shadow-[0_6px_22px_rgba(10,42,56,.10)]">
            {invoice.lineItems.map((it, i) => (
              <div
                key={i}
                className="flex justify-between border-b border-dashed border-line py-2.5 text-[13px] last:border-0"
              >
                <span className="text-muted-foreground">{it.description}</span>
                <b className="tabular-nums">{formatCurrency(it.amount)}</b>
              </div>
            ))}
            {invoice.fees.map((f, i) => (
              <div
                key={i}
                className="flex justify-between border-b border-dashed border-line py-2.5 text-[13px] last:border-0"
              >
                <span className="text-muted-foreground">{f.feeName}</span>
                <b className="tabular-nums">{formatCurrency(f.amount)}</b>
              </div>
            ))}
            <div className="mt-3 flex items-center justify-between border-t-2 border-line pt-3">
              <span className="font-bold">Tổng cộng</span>
              <span className="text-[24px] font-extrabold tabular-nums text-deep">
                {formatCurrency(invoice.totalAmount)}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2.5">
            <PdfButton invoiceId={invoice.invoiceId} />
            <Button
              type="button"
              variant="outline"
              className="h-[52px] flex-1 gap-2 rounded-[14px] border-[1.5px] font-extrabold text-deep"
              onClick={() => toast("Đã gửi hóa đơn tới email")}
            >
              <Mail className="h-4 w-4" /> Gửi email
            </Button>
          </div>

          {canPay ? (
            <Button
              type="button"
              onClick={() => setPayOpen(true)}
              className="h-[52px] w-full rounded-[14px] bg-deep text-[15.5px] font-extrabold"
            >
              Thanh toán {formatCurrency(invoice.totalAmount)}
            </Button>
          ) : null}

          <PaymentDialog
            open={payOpen}
            onOpenChange={setPayOpen}
            invoiceIds={[invoice.invoiceId]}
            total={invoice.totalAmount}
          />
        </div>
      )}
    </div>
  );
}

function Kv({
  label,
  value,
  last,
}: {
  label: string;
  value: string;
  last?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex justify-between border-b border-dashed border-line py-2.5 text-[13.5px]",
        last && "border-0",
      )}
    >
      <span className="text-muted-foreground">{label}</span>
      <b className="text-right tabular-nums">{value}</b>
    </div>
  );
}

function PdfButton({ invoiceId }: { invoiceId: string }) {
  const pdf = useInvoicePdf(invoiceId);
  return (
    <Button
      type="button"
      variant="outline"
      className="h-[52px] flex-1 gap-2 rounded-[14px] border-[1.5px] font-extrabold text-deep"
      disabled={pdf.isFetching}
      onClick={() =>
        pdf.refetch().then((r) => r.data?.pdfUrl && window.open(r.data.pdfUrl, "_blank"))
      }
    >
      <Download className="h-4 w-4" /> {pdf.isFetching ? "Đang tải..." : "Tải PDF"}
    </Button>
  );
}
