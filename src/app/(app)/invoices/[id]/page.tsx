"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  BadgeCheck,
  Download,
  CreditCard,
} from "lucide-react";
import {
  Badge,
  Button,
  Card,
  CardContent,
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
import { ErrorState } from "@/components/state";
import { useInvoice, useInvoicePdf } from "@/features/invoices/queries";
import { useTariffBreakdown } from "@/features/billing/queries";
import { PaymentDialog } from "@/features/payments/payment-dialog";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { PaymentStatus } from "@/lib/types/entities";

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
  return <Badge variant={map[status].variant}>{map[status].label}</Badge>;
}

export default function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { data: invoice, isLoading, isError, refetch } = useInvoice(id);
  const breakdown = useTariffBreakdown(invoice?.contractId ?? "", invoice?.invoiceId ?? "");
  const [payOpen, setPayOpen] = useState(false);

  const canPay =
    invoice &&
    (invoice.paymentStatus === "unpaid" || invoice.paymentStatus === "overdue");

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" onClick={() => router.back()} className="gap-1">
        <ArrowLeft className="h-4 w-4" /> Quay lại
      </Button>

      {isLoading ? (
        <Skeleton className="h-96 w-full" />
      ) : isError ? (
        <Card>
          <CardContent>
            <ErrorState onRetry={() => refetch()} />
          </CardContent>
        </Card>
      ) : !invoice ? null : (
        <>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-semibold tracking-tight">
                  Hóa đơn {invoice.invoiceId}
                </h1>
                {statusBadge(invoice.paymentStatus)}
              </div>
              <p className="text-sm text-muted-foreground">
                Kỳ {invoice.period} · Hợp đồng {invoice.contractId}
              </p>
            </div>
            <div className="flex gap-2">
              <DownloadPdfButton invoiceId={invoice.invoiceId} />
              {canPay && (
                <Button onClick={() => setPayOpen(true)} className="gap-1">
                  <CreditCard className="h-4 w-4" /> Thanh toán
                </Button>
              )}
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-base">Chi tiết sử dụng</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Mô tả</TableHead>
                      <TableHead className="text-right">Khối lượng (m³)</TableHead>
                      <TableHead className="text-right">Đơn giá</TableHead>
                      <TableHead className="text-right">Thành tiền</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoice.lineItems.map((item, i) => (
                      <TableRow key={i}>
                        <TableCell>{item.description}</TableCell>
                        <TableCell className="text-right">{item.volume}</TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(item.unitPrice)}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(item.amount)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <div className="mt-4 space-y-2 border-t pt-4">
                  <Row label="Tạm tính" value={formatCurrency(invoice.subtotal)} />
                  {invoice.fees.map((fee, i) => (
                    <Row
                      key={i}
                      label={fee.feeName}
                      value={formatCurrency(fee.amount)}
                    />
                  ))}
                  <div className="flex justify-between border-t pt-2 text-base font-semibold">
                    <span>Tổng cộng</span>
                    <span>{formatCurrency(invoice.totalAmount)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Thông tin hóa đơn</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <InfoRow label="Ngày phát hành" value={formatDate(invoice.issueDate)} />
                <InfoRow
                  label="Hạn thanh toán"
                  value={invoice.dueDate ? formatDate(invoice.dueDate) : "—"}
                />
                <InfoRow
                  label="Mã CQT"
                  value={
                    invoice.cqtCode ? (
                      <span className="inline-flex items-center gap-1">
                        <BadgeCheck className="h-4 w-4 text-primary" /> {invoice.cqtCode}
                      </span>
                    ) : (
                      "—"
                    )
                  }
                />
                <InfoRow label="Mã tra cứu" value={invoice.lookupCode ?? "—"} />
              </CardContent>
            </Card>
          </div>

          {/* Tariff breakdown — how the consumption maps to tiered pricing */}
          <TariffBreakdownCard
            contractId={invoice.contractId}
            invoiceId={invoice.invoiceId}
            query={breakdown}
          />
        </>
      )}

      {invoice && (
        <PaymentDialog
          open={payOpen}
          onOpenChange={setPayOpen}
          invoiceIds={[invoice.invoiceId]}
          total={invoice.totalAmount}
        />
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span>{value}</span>
    </div>
  );
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}

/** Fetches the signed PDF URL on demand and opens it. */
function DownloadPdfButton({ invoiceId }: { invoiceId: string }) {
  const pdfQuery = useInvoicePdf(invoiceId);

  function handleDownload() {
    pdfQuery.refetch().then((res) => {
      if (res.data?.pdfUrl) window.open(res.data.pdfUrl, "_blank");
    });
  }

  return (
    <Button variant="outline" onClick={handleDownload} disabled={pdfQuery.isFetching} asChild={false}>
      <Download className="h-4 w-4" />
      {pdfQuery.isFetching ? "Đang tải..." : "Tải PDF"}
    </Button>
  );
}

/** Tier-by-tier breakdown of how the invoice consumption was priced. */
function TariffBreakdownCard({
  query,
}: {
  contractId: string;
  invoiceId: string;
  query: ReturnType<typeof useTariffBreakdown>;
}) {
  if (query.isLoading)
    return (
      <Card>
        <CardHeader><CardTitle className="text-base">Chiết tính theo bậc</CardTitle></CardHeader>
        <CardContent><Skeleton className="h-32 w-full" /></CardContent>
      </Card>
    );
  if (query.isError || !query.data) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Chiết tính theo bậc thang</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Bậc</TableHead>
              <TableHead className="text-right">KL (m³)</TableHead>
              <TableHead className="text-right">Đơn giá</TableHead>
              <TableHead className="text-right">Thành tiền</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {query.data.tiers.map((t) => (
              <TableRow key={t.tier}>
                <TableCell>
                  Bậc {t.tier}
                  <span className="ml-1 text-xs text-muted-foreground">
                    ({t.fromVolume}
                    {t.toVolume == null ? "+" : `–${t.toVolume}`} m³)
                  </span>
                </TableCell>
                <TableCell className="text-right">{t.volume}</TableCell>
                <TableCell className="text-right">{formatCurrency(t.pricePerM3)}</TableCell>
                <TableCell className="text-right font-medium">{formatCurrency(t.subtotal)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="mt-3 flex justify-between border-t pt-3 text-sm">
          <span className="text-muted-foreground">Tổng trước phí</span>
          <span className="font-semibold">{formatCurrency(query.data.totalBeforeFees)}</span>
        </div>
      </CardContent>
    </Card>
  );
}
