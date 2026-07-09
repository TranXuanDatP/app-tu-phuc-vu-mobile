"use client";

import { useState } from "react";
import Link from "next/link";
import { BellRing, Check, CreditCard, Mail, ReceiptText } from "lucide-react";
import { AppBar } from "@/components/layout/app-bar";
import { Skeleton, Toggle } from "@/components/ui";
import { EmptyState, ErrorState } from "@/components/state";
import { useInvoices } from "@/features/invoices/queries";
import { useOutstandingDebt } from "@/features/payments/queries";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import type { PaymentStatus } from "@/lib/types/entities";

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

export default function InvoicesPage() {
  const [tab, setTab] = useState<"unpaid" | "paid">("unpaid");
  const { data, isLoading, isError, refetch } = useInvoices({ status: tab, limit: 20 });
  const debt = useOutstandingDebt();

  return (
    <div className="pb-4">
      <AppBar title="Hóa đơn" sub="Hóa đơn điện tử · có mã CQT" />

      <div className="flex gap-2 px-4 pt-4">
        {(["unpaid", "paid"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn(
              "flex-1 rounded-xl border py-2.5 text-[13px] font-semibold transition-colors",
              tab === t ? "border-deep bg-deep text-white" : "border-line bg-card text-muted-foreground",
            )}
          >
            {t === "unpaid" ? "Chưa thanh toán" : "Đã thanh toán"}
          </button>
        ))}
      </div>

      {/* Bill summary */}
      {tab === "unpaid" ? (
        <div className="px-4 pt-4">
          <div className="rounded-[18px] border border-line bg-card p-4 shadow-[0_6px_22px_rgba(10,42,56,.10)]">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Cần thanh toán</p>
                <p className="mt-0.5 text-[26px] font-extrabold tabular-nums text-deep">
                  {debt.isLoading ? "…" : formatCurrency(debt.data?.totalAmount)}
                </p>
                <p className="text-xs font-semibold text-coral">
                  {debt.data?.totalCount ?? 0} kỳ · chưa thanh toán
                </p>
              </div>
              <Link
                href="/payments"
                className="shrink-0 rounded-xl bg-aqua px-4 py-3 text-[13px] font-extrabold text-white active:scale-[0.98]"
              >
                Trả ngay
              </Link>
            </div>
            <div className="mt-3.5 flex gap-3 border-t border-line pt-3.5">
              <Stat value="6" label="kỳ đúng hạn liên tiếp" />
              <Stat value={formatCurrency(debt.data?.totalAmount ? debt.data.totalAmount * 4 : 0)} label="ước tính đã trả 2026" />
            </div>
          </div>
        </div>
      ) : null}

      {/* List */}
      <div className="px-4 pt-4">
        <div className="overflow-hidden rounded-[18px] border border-line bg-card shadow-[0_6px_22px_rgba(10,42,56,.10)]">
          {isLoading ? (
            <Skeleton className="h-24 w-full" />
          ) : isError ? (
            <ErrorState onRetry={() => refetch()} />
          ) : !data?.invoices.length ? (
            <EmptyState title={tab === "unpaid" ? "Không có hóa đơn chờ" : "Chưa có hóa đơn đã trả"} />
          ) : (
            data.invoices.map((inv, i) => {
              const paid = inv.paymentStatus === "paid";
              return (
                <Link
                  key={inv.invoiceId}
                  href={`/invoices/${inv.invoiceId}`}
                  className={cn("flex items-center gap-3 px-4 py-3.5", i < data.invoices.length - 1 && "border-b border-line")}
                >
                  <span className={cn("flex h-[42px] w-[42px] items-center justify-center rounded-xl", paid ? "bg-mint-soft text-[#0f6b4c]" : "bg-aqua-soft text-deep")}>
                    {paid ? <Check className="h-5 w-5" /> : <ReceiptText className="h-5 w-5" />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <b className="text-[14.5px] font-bold">Kỳ {inv.period}</b>
                    <p className="text-[12.5px] text-muted-foreground">
                      {inv.dueDate ? `Hạn ${formatDate(inv.dueDate)}` : formatDate(inv.issueDate)}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-[15px] font-extrabold tabular-nums">{formatCurrency(inv.totalAmount)}</div>
                    <span className={cn("mt-1 inline-block rounded-full px-2.5 py-0.5 text-[11px] font-bold", STATUS_BADGE[inv.paymentStatus])}>
                      {STATUS_LABEL[inv.paymentStatus]}
                    </span>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </div>

      {/* Auto & reminders */}
      <div className="px-4 pt-5">
        <h2 className="mb-2 px-1 text-sm font-bold">Tự động & nhắc hạn</h2>
        <div className="overflow-hidden rounded-[18px] border border-line bg-card shadow-[0_6px_22px_rgba(10,42,56,.10)]">
          <SettingRow icon={CreditCard} title="Thanh toán tự động" desc="Tự trích nợ khi có hóa đơn mới"><Toggle /></SettingRow>
          <SettingRow icon={BellRing} title="Nhắc hạn thanh toán" desc="Trước hạn 3 ngày qua thông báo"><Toggle defaultOn /></SettingRow>
          <SettingRow icon={Mail} title="Gửi hóa đơn qua email" desc="Nhận biên lai qua email" last><Toggle defaultOn /></SettingRow>
        </div>
      </div>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex-1">
      <b className="text-[16px] font-extrabold tabular-nums text-ink">{value}</b>
      <span className="mt-0.5 block text-[11px] text-muted-foreground">{label}</span>
    </div>
  );
}

function SettingRow({
  icon: Icon,
  title,
  desc,
  last,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  desc: string;
  last?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div className={cn("flex items-center gap-3 px-4 py-3.5", !last && "border-b border-line")}>
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-foam text-deep">
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <b className="text-[14px] font-semibold">{title}</b>
        <p className="text-[12px] text-muted-foreground">{desc}</p>
      </div>
      {children}
    </div>
  );
}
