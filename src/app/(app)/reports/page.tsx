"use client";

import { useState } from "react";
import {
  BarChart3,
  Droplet,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Skeleton,
} from "@/components/ui";
import { EmptyState, ErrorState } from "@/components/state";
import { MiniBars } from "@/components/charts";
import { StatusBadge, type StatusTone } from "@/components/status-badge";
import {
  useComparisonReport,
  useConsumptionReport,
} from "@/features/reporting/queries";
import { comparisonTypeLabel } from "@/features/reporting/labels";
import { cn, formatCurrency, formatNumber } from "@/lib/utils";
import type { ComparisonType } from "@/lib/types/entities";

const PERIODS = ["2026-06", "2026-05", "2026-04", "2026-03", "2026-02"];
const TYPES: ComparisonType[] = [
  "previous_period",
  "same_period_last_year",
  "area_average",
];

export default function ReportsPage() {
  const [period, setPeriod] = useState("2026-06");
  const [type, setType] = useState<ComparisonType>("previous_period");
  const consumption = useConsumptionReport(period);
  const comparison = useComparisonReport(type);

  return (
    <div className="space-y-6">
      <div className="fade-in-up">
        <h1 className="text-2xl font-semibold tracking-tight">Báo cáo tiêu thụ</h1>
        <p className="text-sm text-muted-foreground">
          Tổng hợp và so sánh lượng nước tiêu thụ theo kỳ
        </p>
      </div>

      {/* Consumption summary */}
      <section className="fade-in-up space-y-3" style={{ animationDelay: "60ms" }}>
        <div className="flex items-center justify-between">
          <h2 className="text-base font-medium">Kỳ báo cáo</h2>
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PERIODS.map((p) => (
                <SelectItem key={p} value={p}>
                  {p}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <StatTile
            icon={Droplet}
            tint="from-blue-500/20"
            label="Khối lượng"
            value={`${formatNumber(consumption.data?.totalM3)} m³`}
            loading={consumption.isLoading}
            error={consumption.isError}
            onRetry={() => consumption.refetch()}
          />
          <StatTile
            icon={Wallet}
            tint="from-emerald-500/20"
            label="Tổng tiền"
            value={formatCurrency(consumption.data?.amount)}
            loading={consumption.isLoading}
            error={consumption.isError}
            onRetry={() => consumption.refetch()}
          />
          <StatTile
            icon={BarChart3}
            tint="from-violet-500/20"
            label="Thay đổi vs kỳ trước"
            value={formatPct(consumption.data?.comparisonPercent)}
            loading={consumption.isLoading}
            error={consumption.isError}
            onRetry={() => consumption.refetch()}
            tone={changeTone(consumption.data?.comparisonPercent)}
          />
        </div>
      </section>

      {/* Comparison */}
      <Card className="fade-in-up" style={{ animationDelay: "120ms" }}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="text-base">So sánh tiêu thụ</CardTitle>
            <CardDescription>{comparisonTypeLabel[type]}</CardDescription>
          </div>
          <Select value={type} onValueChange={(v) => setType(v as ComparisonType)}>
            <SelectTrigger className="w-56">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TYPES.map((t) => (
                <SelectItem key={t} value={t}>
                  {comparisonTypeLabel[t]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          {comparison.isLoading ? (
            <Skeleton className="h-40 w-full" />
          ) : comparison.isError ? (
            <ErrorState onRetry={() => comparison.refetch()} />
          ) : !comparison.data ? (
            <EmptyState />
          ) : (
            <div className="space-y-4">
              <MiniBars
                unit=" m³"
                data={[
                  { label: "Hiện tại", value: comparison.data.current },
                  { label: "So sánh", value: comparison.data.previous },
                ]}
              />
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Thay đổi:</span>
                <StatusBadge
                  tone={changeTone(comparison.data.changePercent)}
                  label={formatPct(comparison.data.changePercent)}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function formatPct(v: number | null | undefined): string {
  if (v === undefined || v === null || Number.isNaN(v)) return "—";
  return `${v > 0 ? "+" : ""}${v}%`;
}

function changeTone(v: number | null | undefined): StatusTone {
  if (v === undefined || v === null) return "neutral";
  if (v < 0) return "success"; // less consumption = good
  if (v > 0) return "warning";
  return "neutral";
}

function StatTile({
  icon: Icon,
  tint,
  label,
  value,
  loading,
  error,
  onRetry,
  tone,
}: {
  icon: LucideIcon;
  tint: string;
  label: string;
  value: string;
  loading: boolean;
  error: boolean;
  onRetry: () => void;
  tone?: StatusTone;
}) {
  return (
    <div className="glass fade-in-up relative overflow-hidden rounded-2xl border border-white/10 p-5 shadow-lg shadow-primary/5">
      <div
        className={cn(
          "pointer-events-none absolute inset-0 bg-gradient-to-br to-transparent",
          tint,
        )}
      />
      <div className="relative flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <div className="relative mt-3">
        {loading ? (
          <Skeleton className="h-7 w-28" />
        ) : error ? (
          <button
            onClick={onRetry}
            className="text-sm font-medium text-destructive"
          >
            Lỗi tải — thử lại
          </button>
        ) : (
          <p className="text-xl font-bold tabular-nums">
            {value}
            {tone && tone !== "neutral" ? (
              <span className="ml-2 align-middle">
                <StatusBadge tone={tone} label={tone === "success" ? "Giảm" : "Tăng"} />
              </span>
            ) : null}
          </p>
        )}
      </div>
    </div>
  );
}
