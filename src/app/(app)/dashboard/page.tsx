"use client";

import Link from "next/link";
import {
  AlertTriangle,
  ChevronRight,
  CreditCard,
  Headset,
  MessageSquare,
  PhoneCall,
  ReceiptText,
  Siren,
  type LucideIcon,
} from "lucide-react";
import { Skeleton } from "@/components/ui";
import { useCustomerProfile } from "@/features/customers/queries";
import { useInvoices } from "@/features/invoices/queries";
import { useConsumption } from "@/features/meters/queries";
import { useCutoffSchedule } from "@/features/water-cutoff/queries";
import { cn, formatCurrency, formatDate, formatNumber } from "@/lib/utils";

export default function HomePage() {
  const profile = useCustomerProfile();
  const invoices = useInvoices({ status: "unpaid", limit: 1 });
  const consumption = useConsumption();
  const cutoff = useCutoffSchedule("CP-DMA-1");
  const bill = invoices.data?.invoices[0];
  const outage = cutoff.data?.schedules[0];

  const readings = (consumption.data?.readings ?? []).slice().sort((a, b) => a.month.localeCompare(b.month));
  const current = readings.at(-1)?.volume ?? 0;
  const forecast = Math.round(current * 1.5); // ~27 m³ estimated full period
  const pct = forecast > 0 ? Math.min(100, Math.round((current / forecast) * 100)) : 0;

  return (
    <div className="pb-4">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-deep via-[#0d7391] to-aqua px-5 pb-20 pt-7 text-white">
        <div className="pointer-events-none absolute -right-10 -bottom-14 h-44 w-44 rounded-full bg-white/15 blur-[2px]" />
        <div className="absolute right-4 top-4 rounded-xl bg-white/15 px-2.5 py-1.5 text-[13px] font-extrabold tracking-wide">
          QUAWACO
        </div>
        <p className="text-[13px] font-medium opacity-90">Chào buổi sáng,</p>
        {profile.isLoading ? (
          <Skeleton className="mt-1 h-6 w-40 bg-white/25" />
        ) : (
          <h1 className="text-xl font-extrabold">{profile.data?.fullName ?? "Khách hàng"}</h1>
        )}
        <p className="mt-0.5 max-w-[80%] text-xs opacity-85">
          {profile.data?.address?.fullAddress ?? ""}
        </p>

        {/* Bill card */}
        <div className="relative z-10 mt-5 rounded-[18px] border border-white/25 bg-white/15 p-4 backdrop-blur-sm">
          {invoices.isLoading ? (
            <Skeleton className="h-20 w-full bg-white/25" />
          ) : bill ? (
            <>
              <p className="text-xs opacity-90">Hóa đơn kỳ {bill.period} · cần thanh toán</p>
              <p className="mt-0.5 text-[30px] font-extrabold leading-none tabular-nums">
                {formatCurrency(bill.totalAmount)}
              </p>
              <p className="mt-1.5 text-xs opacity-90">
                {bill.dueDate ? `Hạn thanh toán ${formatDate(bill.dueDate)}` : ""}
              </p>
              <Link
                href="/payments"
                className="mt-3 block w-full rounded-xl bg-white py-3 text-center text-[15px] font-extrabold text-deep active:scale-[0.98]"
              >
                Thanh toán ngay
              </Link>
            </>
          ) : (
            <p className="text-sm opacity-90">Không có hóa đơn chờ thanh toán 🎉</p>
          )}
        </div>
      </section>

      {/* Quick actions */}
      <div className="relative z-10 -mt-10 grid grid-cols-4 gap-2.5 px-4">
        <QuickAction href="/payments" icon={CreditCard} label="Thanh toán" />
        <QuickAction href="/tickets" icon={Siren} label="Báo sự cố" />
        <QuickAction href="/invoices" icon={ReceiptText} label="Tra hóa đơn" />
        <QuickAction href="/contact" icon={Headset} label="Hỗ trợ" />
      </div>

      {/* Snap — consumption this month */}
      <div className="px-4 pt-4">
        <Link
          href="/meters"
          className="flex items-center gap-3.5 rounded-[18px] border border-line bg-card p-4 shadow-[0_6px_22px_rgba(10,42,56,.10)] active:scale-[0.99]"
        >
          <div
            className="relative h-[52px] w-[52px] shrink-0 rounded-full"
            style={{ background: `conic-gradient(var(--aqua) ${pct}%, var(--foam) 0)` }}
          >
            <div className="absolute inset-[6px] flex items-center justify-center rounded-full bg-card text-[12px] font-extrabold text-deep">
              {formatNumber(current)}m³
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <b className="text-[15px] font-extrabold">Tiêu thụ tháng này</b>
            <p className="text-[12.5px] text-muted-foreground">
              {bill ? `Dự báo hóa đơn ~${formatCurrency(bill.totalAmount)}` : "Đang tải…"}
            </p>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        </Link>
      </div>

      {/* Alerts */}
      <section className="space-y-3 px-4 pt-5">
        <h2 className="px-1 text-sm font-bold">Cảnh báo & thông báo</h2>
        {outage ? (
          <Alert
            tone="info"
            icon={AlertTriangle}
            title={`Bảo trì đường ống khu vực ${cutoff.data?.areaId}`}
            desc={`${formatDate(outage.from)} · ${outage.reason}`}
          />
        ) : cutoff.isLoading ? (
          <Skeleton className="h-16 w-full" />
        ) : null}
        <Alert
          tone="warn"
          icon={AlertTriangle}
          title="Kiểm tra tiêu thụ định kỳ"
          desc="Nếu hóa đơn tăng bất thường, hãy kiểm tra đồng hồ khi không dùng nước — có thể rò rỉ."
        />

        {/* Support */}
        <div className="px-1 pt-1 text-sm font-bold">Cần hỗ trợ?</div>
        <div className="rounded-[18px] bg-gradient-to-br from-deep to-aqua p-4 text-white">
          <b className="text-[15px]">Chúng tôi luôn sẵn sàng hỗ trợ bạn</b>
          <p className="mt-0.5 text-[12.5px] leading-snug opacity-90">
            Chat với nhân viên hoặc gọi tổng đài 24/7 để được giải đáp thắc mắc, khiếu nại.
          </p>
          <div className="mt-3 flex gap-2.5">
            <Link
              href="/chat"
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-white py-2.5 text-[13px] font-bold text-deep active:scale-[0.98]"
            >
              <MessageSquare className="h-4 w-4" /> Chat nhân viên
            </Link>
            <Link
              href="/contact"
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-white/20 py-2.5 text-[13px] font-bold text-white active:scale-[0.98]"
            >
              <PhoneCall className="h-4 w-4" /> Tổng đài
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function QuickAction({ href, icon: Icon, label }: { href: string; icon: LucideIcon; label: string }) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center gap-1.5 rounded-2xl border border-line bg-card p-3 text-center shadow-[0_6px_22px_rgba(10,42,56,0.10)] active:translate-y-px"
    >
      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-aqua-soft text-deep">
        <Icon className="h-5 w-5" />
      </span>
      <span className="text-[11.5px] font-semibold leading-tight">{label}</span>
    </Link>
  );
}

function Alert({
  tone,
  icon: Icon,
  title,
  desc,
}: {
  tone: "info" | "warn" | "ok";
  icon: LucideIcon;
  title: string;
  desc: string;
}) {
  const tones = {
    info: "bg-aqua-soft/60 border-line",
    warn: "bg-amber-soft border-[#F1DCBB]",
    ok: "bg-mint-soft border-[#CBE9DC]",
  } as const;
  const ic = {
    info: "bg-aqua-soft text-deep",
    warn: "bg-[#F6D9AE] text-[#8a5410]",
    ok: "bg-[#C4E7D8] text-[#0f6b4c]",
  } as const;
  return (
    <div className={cn("flex items-start gap-3 rounded-[18px] border p-3.5", tones[tone])}>
      <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-xl", ic[tone])}>
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <p className="text-sm font-bold">{title}</p>
        <p className="mt-0.5 text-[12.5px] leading-snug text-muted-foreground">{desc}</p>
      </div>
    </div>
  );
}
