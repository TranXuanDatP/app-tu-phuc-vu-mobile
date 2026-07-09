"use client";

import Link from "next/link";
import { useState } from "react";
import { AlertTriangle, Clock, Droplet, Gauge } from "lucide-react";
import { AppBar } from "@/components/layout/app-bar";
import { Skeleton } from "@/components/ui";
import { EmptyState, ErrorState } from "@/components/state";
import { useConsumption, useMeters } from "@/features/meters/queries";
import { meterStatusLabel, meterTypeLabel } from "@/features/meters/labels";
import { cn, formatCurrency, formatNumber } from "@/lib/utils";
import { toast } from "sonner";
import { useInvoices } from "@/features/invoices/queries";

export default function MetersPage() {
  const consumption = useConsumption();
  const meters = useMeters();
  const invoices = useInvoices({ status: "unpaid", limit: 1 });
  const [period, setPeriod] = useState<"Tháng" | "Quý" | "Năm">("Tháng");

  const readings = (consumption.data?.readings ?? []).slice().sort((a, b) => a.month.localeCompare(b.month));
  const last6 = readings.slice(-6);
  const current = readings.at(-1)?.volume ?? 0;
  const prev = readings.at(-2)?.volume ?? 0;
  const change = prev ? Math.round(((current - prev) / prev) * 100) : null;
  const max = Math.max(...last6.map((r) => r.volume), 1);
  const avg = readings.length ? Math.round(readings.reduce((s, r) => s + r.volume, 0) / readings.length) : 0;
  const forecast = Math.round(current * 1.5);
  const forecastPct = forecast > 0 ? Math.min(100, Math.round((current / forecast) * 100)) : 0;
  const perDay = (current / 30).toFixed(1).replace(".", ",");
  const billAmount = invoices.data?.invoices[0]?.totalAmount ?? current * 8000;

  // Tier (VN water tiers): B1 0-10, B2 11-20, B3 21+
  const tierIdx = current <= 10 ? 0 : current <= 20 ? 1 : 2;
  const tiers = [
    { code: "B1", range: "0–10 m³", next: 11 },
    { code: "B2", range: "11–20 m³", next: 21 },
    { code: "B3", range: "21+ m³", next: null },
  ] as const;

  return (
    <div className="pb-4">
      <AppBar title="Tiêu thụ nước" sub="Đồng hồ số · cập nhật hằng ngày" />

      {/* Water-meter card */}
      <div className="px-4 pt-4">
        {consumption.isLoading ? (
          <Skeleton className="h-[150px] w-full rounded-[18px]" />
        ) : consumption.isError ? (
          <ErrorState onRetry={() => consumption.refetch()} />
        ) : current ? (
          <div className="relative h-[150px] overflow-hidden rounded-[18px] border border-white/10 bg-[#08384a] text-white">
            <div className="absolute inset-x-0 bottom-0 h-[70%] overflow-hidden">
              <div className="flex h-full w-[200%] animate-[drift_3.2s_linear_infinite]">
                {[0, 1].map((i) => (
                  <svg key={i} viewBox="0 0 400 120" preserveAspectRatio="none" className="h-full w-1/2">
                    <path d="M0 40 Q100 10 200 40 T400 40 V120 H0 Z" fill="rgba(22,166,194,.55)" />
                  </svg>
                ))}
              </div>
              <div className="absolute inset-0 flex h-full w-[200%] animate-[drift_5s_linear_infinite] opacity-60">
                {[0, 1].map((i) => (
                  <svg key={i} viewBox="0 0 400 120" preserveAspectRatio="none" className="h-full w-1/2">
                    <path d="M0 50 Q100 80 200 50 T400 50 V120 H0 Z" fill="rgba(22,166,194,.35)" />
                  </svg>
                ))}
              </div>
            </div>
            <div className="absolute left-[18px] top-3.5 z-10 text-xs font-medium opacity-90">
              Tháng này {readings.at(-1)?.month ?? ""}
            </div>
            {change !== null ? (
              <div className="absolute right-3 top-3 z-10 rounded-[9px] bg-white/15 px-2 py-1 text-[11px] font-bold">
                {change > 0 ? `+${change}% ▲` : `${change}% ▼`}
              </div>
            ) : null}
            <div className="absolute bottom-3.5 left-[18px] z-10">
              <b className="text-[40px] font-extrabold leading-none tabular-nums">{formatNumber(current)}</b>
              <span className="ml-1 text-[15px] font-semibold opacity-90">m³</span>
            </div>
          </div>
        ) : (
          <EmptyState title="Chưa có dữ liệu tiêu thụ" />
        )}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2.5 px-4 pt-3.5">
        <Stat value={perDay} label="m³ / ngày" />
        <Stat value={`~${forecast}`} label="m³ dự kiến cả kỳ" />
        <Stat value={change !== null ? `${change > 0 ? "+" : ""}${change}%` : "—"} label="vs tháng trước" />
      </div>

      {/* Forecast */}
      <Section title={`Dự báo hóa đơn ${readings.at(-1)?.month ?? ""}`}>
        <div className="rounded-[18px] border border-line bg-card p-4 shadow-[0_6px_22px_rgba(10,42,56,.10)]">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Ước tính đến nay</p>
              <p className="mt-0.5 text-[26px] font-extrabold tabular-nums text-deep">
                {formatCurrency(billAmount)}
              </p>
            </div>
            <span className="rounded-full bg-mint-soft px-2.5 py-1 text-[11px] font-bold text-[#0f6b4c]">
              {change !== null && change > 20 ? "Tăng cao" : "Đúng dự kiến"}
            </span>
          </div>
          <div className="mt-3.5 h-2 overflow-hidden rounded-full bg-foam">
            <div
              className="h-full rounded-full bg-gradient-to-r from-aqua to-[#0d7391] transition-all duration-700"
              style={{ width: `${forecastPct}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Đã dùng {formatNumber(current)}/{forecast} m³ · dự kiến kỳ này
          </p>
        </div>
      </Section>

      {/* Tier */}
      <Section title="Bậc giá hiện tại">
        <div className="rounded-[18px] border border-line bg-card p-4 shadow-[0_6px_22px_rgba(10,42,56,.10)]">
          <div className="flex gap-2">
            {tiers.map((t, i) => (
              <div
                key={t.code}
                className={cn(
                  "flex-1 rounded-xl border-[1.5px] p-2.5 text-center font-extrabold",
                  i === tierIdx
                    ? "border-aqua bg-aqua-soft text-deep"
                    : i === tierIdx + 1
                      ? "border-dashed border-amber text-amber"
                      : "border-line bg-card text-muted-foreground",
                )}
              >
                {t.code}
                <small className="mt-0.5 block text-[10px] font-semibold">{t.range}</small>
              </div>
            ))}
          </div>
          <p className="mt-3 text-[12.5px] leading-relaxed text-muted-foreground">
            Bạn đang ở <b className="text-ink">{tiers[tierIdx].code}</b>
            {tiers[tierIdx].next ? (
              <>
                {" "}— dùng thêm <b className="text-ink">{tiers[tierIdx].next! - current} m³</b> nữa sẽ sang{" "}
                <b className="text-amber">{tiers[tierIdx + 1]?.code}</b> (giá cao hơn).
              </>
            ) : null}
          </p>
        </div>
      </Section>

      {/* Chart */}
      {last6.length ? (
        <Section title="Biểu đồ tiêu thụ">
          <div className="rounded-[18px] border border-line bg-card p-4 shadow-[0_6px_22px_rgba(10,42,56,.10)]">
            <div className="flex gap-1 rounded-xl bg-foam p-1">
              {(["Tháng", "Quý", "Năm"] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => {
                    setPeriod(p);
                    if (p !== "Tháng") toast(`${p} — demo (chỉ dữ liệu tháng)`);
                  }}
                  className={cn(
                    "flex-1 rounded-lg py-1.5 text-[13px] font-semibold",
                    period === p ? "bg-card text-deep shadow" : "text-muted-foreground",
                  )}
                >
                  {p}
                </button>
              ))}
            </div>
            <div className="mt-3 flex h-[130px] items-end gap-2">
              {last6.map((r, i) => {
                const isCur = i === last6.length - 1;
                const h = Math.max(6, (r.volume / max) * 100);
                return (
                  <div key={r.month} className="flex h-full flex-1 flex-col items-center justify-end gap-1.5">
                    <b className="text-[10px] font-bold tabular-nums text-muted-foreground">{r.volume}</b>
                    <div className="flex w-full flex-1 items-end">
                      <div
                        className="w-full rounded-t-md"
                        style={{
                          height: `${h}%`,
                          background: isCur
                            ? "linear-gradient(#F0B455,#C9791A)"
                            : "linear-gradient(#16A6C2,#0d7391)",
                        }}
                      />
                    </div>
                    <small className="text-[10px] font-semibold text-muted-foreground">{r.month.slice(5)}</small>
                  </div>
                );
              })}
            </div>
            <div className="mt-3 flex justify-between border-t border-dashed border-line pt-2.5 text-[13px]">
              <span className="text-muted-foreground">Trung bình các kỳ</span>
              <b className="tabular-nums">{formatNumber(avg)} m³</b>
            </div>
          </div>
        </Section>
      ) : null}

      {/* Leak alert */}
      {change !== null && change > 20 ? (
        <div className="px-4 pt-4">
          <div className="flex items-start gap-3 rounded-[18px] border border-[#F1DCBB] bg-amber-soft p-3.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#F6D9AE] text-[#8a5410]">
              <AlertTriangle className="h-4 w-4" />
            </span>
            <div>
              <p className="text-sm font-bold">Nghi ngờ rò rỉ trong nhà</p>
              <p className="mt-0.5 text-[12.5px] leading-snug text-muted-foreground">
                Tiêu thụ tăng {change}% so với tháng trước. Hãy kiểm tra đồng hồ khi không dùng nước.
              </p>
            </div>
          </div>
        </div>
      ) : null}

      {/* Savings tips */}
      <Section title="Gợi ý tiết kiệm">
        <div className="overflow-hidden rounded-[18px] border border-line bg-card shadow-[0_6px_22px_rgba(10,42,56,.10)]">
          <TipRow icon={Clock} title="Kiểm tra rò rỉ ban đêm" desc="Đọc đồng hồ trước khi ngủ và lúc dậy — số nhảy là có rò rỉ." />
          <TipRow icon={Droplet} title="Lắp vòi tiết kiệm nước" desc="Giảm 20–30% lượng nước ở vòi rửa và vòi sen." />
          <TipRow icon={Gauge} title="Đặt ngưỡng cảnh báo" desc="Báo ngay khi vượt 22 m³ để không nhảy Bậc 3." last />
        </div>
      </Section>

      {/* Meter list */}
      <Section title="Đồng hồ của tôi">
        <div className="overflow-hidden rounded-[18px] border border-line bg-card shadow-[0_6px_22px_rgba(10,42,56,.10)]">
          {meters.isLoading ? (
            <Skeleton className="h-20 w-full" />
          ) : meters.isError ? (
            <ErrorState onRetry={() => meters.refetch()} />
          ) : !meters.data?.meters.length ? (
            <EmptyState title="Không có đồng hồ" />
          ) : (
            meters.data.meters.map((m, i) => (
              <Link
                key={m.meterId}
                href={`/meters/${m.meterId}`}
                className={cn(
                  "flex items-center gap-3 px-4 py-3.5",
                  i < meters.data!.meters.length - 1 ? "border-b border-line" : "",
                )}
              >
                <span className="flex h-[42px] w-[42px] items-center justify-center rounded-xl bg-aqua-soft text-deep">
                  <Droplet className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <b className="text-[14.5px] font-bold">{m.serialNumber}</b>
                  <p className="text-[12.5px] text-muted-foreground">
                    {meterTypeLabel[m.type]} · {meterStatusLabel[m.status]}
                  </p>
                </div>
              </Link>
            ))
          )}
        </div>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="px-4 pt-5">
      <h2 className="mb-2 px-1 text-sm font-bold">{title}</h2>
      {children}
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-[14px] border border-line bg-card p-3 text-center shadow-[0_6px_22px_rgba(10,42,56,.10)]">
      <b className="block text-[18px] font-extrabold tabular-nums text-deep">{value}</b>
      <span className="mt-0.5 block text-[10px] font-semibold leading-tight text-muted-foreground">{label}</span>
    </div>
  );
}

function TipRow({
  icon: Icon,
  title,
  desc,
  last,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  desc: string;
  last?: boolean;
}) {
  return (
    <div className={cn("flex items-start gap-3 px-4 py-3.5", !last && "border-b border-line")}>
      <span className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-xl bg-aqua-soft text-deep">
        <Icon className="h-5 w-5" />
      </span>
      <div>
        <b className="text-[14px] font-bold">{title}</b>
        <p className="mt-0.5 text-[12.5px] leading-snug text-muted-foreground">{desc}</p>
      </div>
    </div>
  );
}
