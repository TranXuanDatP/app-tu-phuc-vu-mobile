"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Gauge, TrendingDown, TrendingUp, Minus } from "lucide-react";
import {
  Badge,
  Button,
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
import { ConsumptionChart } from "@/components/consumption-chart";
import {
  useConsumption,
  useConsumptionComparison,
  useMeters,
  useReadingDetail,
} from "@/features/meters/queries";
import { meterStatusLabel, meterTypeLabel } from "@/features/meters/labels";
import { formatNumber, formatDate } from "@/lib/utils";

export default function MetersPage() {
  const meters = useMeters();
  const consumption = useConsumption();

  const periods = useMemo(
    () => consumption.data?.readings.map((r) => r.month).sort().reverse() ?? [],
    [consumption.data],
  );

  const [current, setCurrent] = useState<string>();
  const [previous, setPrevious] = useState<string>();
  const comparison = useConsumptionComparison(current, previous);

  const [detailPeriod, setDetailPeriod] = useState<string>();
  const readingDetail = useReadingDetail(detailPeriod ?? "");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Đồng hồ nước</h1>
        <p className="text-sm text-muted-foreground">
          Đồng hồ, chỉ số tiêu thụ và tình trạng hiệu chuẩn
        </p>
      </div>

      {/* Meter list */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {meters.isLoading
          ? Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-40 w-full" />
            ))
          : meters.isError
            ? <ErrorState onRetry={() => meters.refetch()} />
            : !meters.data?.meters.length
              ? <EmptyState title="Không có đồng hồ nào" />
              : meters.data.meters.map((m) => (
                  <Card key={m.meterId}>
                    <CardHeader className="flex flex-row items-start justify-between space-y-0">
                      <div className="flex items-center gap-2">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <Gauge className="h-5 w-5" />
                        </div>
                        <div>
                          <CardTitle className="text-sm">{m.serialNumber}</CardTitle>
                          <CardDescription className="text-xs">
                            {meterTypeLabel[m.type]} · {m.diameter}
                          </CardDescription>
                        </div>
                      </div>
                      <Badge
                        variant={
                          m.status === "active"
                            ? "success"
                            : m.status === "defective"
                              ? "destructive"
                              : "secondary"
                        }
                      >
                        {meterStatusLabel[m.status]}
                      </Badge>
                    </CardHeader>
                    <CardContent className="space-y-1 text-sm">
                      <Row label="Mã đồng hồ" value={m.meterId} />
                      <Row label="Cấp chính xác" value={m.accuracyClass} />
                      <Row label="Năm SX" value={String(m.manufactureYear)} />
                      <Button asChild variant="outline" size="sm" className="mt-3 w-full">
                        <Link href={`/meters/${m.meterId}`}>Chi tiết</Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
      </div>

      {/* Consumption chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Tiêu thụ 12 tháng gần nhất</CardTitle>
          <CardDescription>Khối lượng nước tiêu thụ theo tháng (m³)</CardDescription>
        </CardHeader>
        <CardContent>
          {consumption.isLoading ? (
            <Skeleton className="h-56 w-full" />
          ) : consumption.isError ? (
            <ErrorState onRetry={() => consumption.refetch()} />
          ) : !consumption.data?.readings.length ? (
            <EmptyState title="Chưa có dữ liệu tiêu thụ" />
          ) : (
            <ConsumptionChart data={consumption.data.readings} />
          )}
        </CardContent>
      </Card>

      {/* Reading detail for a selected period — previous/current index + evidence photos */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="text-base">Chi tiết chỉ số theo kỳ</CardTitle>
            <CardDescription>Chỉ số đầu/cuối, khối lượng và ảnh chụp đồng hồ</CardDescription>
          </div>
          <Select
            value={detailPeriod ?? ""}
            onValueChange={(v) => setDetailPeriod(v === "_" ? undefined : v)}
          >
            <SelectTrigger className="w-40"><SelectValue placeholder="Chọn kỳ" /></SelectTrigger>
            <SelectContent>
              {periods.map((p) => (
                <SelectItem key={p} value={p}>{p}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          {!detailPeriod ? (
            <p className="text-sm text-muted-foreground">Chọn một kỳ để xem chi tiết chỉ số.</p>
          ) : readingDetail.isLoading ? (
            <Skeleton className="h-32 w-full" />
          ) : readingDetail.isError ? (
            <ErrorState onRetry={() => readingDetail.refetch()} />
          ) : !readingDetail.data ? null : (
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-4">
                <DetailStat label="Chỉ số đầu kỳ" value={formatNumber(readingDetail.data.previousIndex)} />
                <DetailStat label="Chỉ số cuối kỳ" value={formatNumber(readingDetail.data.currentIndex)} />
                <DetailStat label="Khối lượng" value={`${formatNumber(readingDetail.data.volume)} m³`} />
                <DetailStat label="Kỳ" value={readingDetail.data.period} />
              </div>
              {readingDetail.data.evidencePhotos.length > 0 && (
                <div>
                  <p className="mb-2 text-sm font-medium">Ảnh chụp đồng hồ</p>
                  <div className="flex flex-wrap gap-3">
                    {readingDetail.data.evidencePhotos.map((photo, i) => (
                      <figure key={i} className="w-40">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={photo.url}
                          alt={photo.caption ?? `Ảnh ${i + 1}`}
                          className="h-28 w-40 rounded-md border object-cover"
                        />
                        <figcaption className="mt-1 text-xs text-muted-foreground">
                          {photo.caption ?? `Ảnh ${i + 1}`}
                          {photo.takenAt ? ` · ${formatDate(photo.takenAt)}` : ""}
                        </figcaption>
                      </figure>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Period comparison */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">So sánh tiêu thụ giữa 2 kỳ</CardTitle>
          <CardDescription>Chọn 2 kỳ (YYYY-MM) để so sánh</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Kỳ hiện tại</label>
              <Select
                value={current ?? ""}
                onValueChange={(v) => setCurrent(v === "_" ? undefined : v)}
              >
                <SelectTrigger><SelectValue placeholder="Chọn kỳ" /></SelectTrigger>
                <SelectContent>
                  {periods.map((p) => (
                    <SelectItem key={p} value={p}>{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Kỳ trước</label>
              <Select
                value={previous ?? ""}
                onValueChange={(v) => setPrevious(v === "_" ? undefined : v)}
              >
                <SelectTrigger><SelectValue placeholder="Chọn kỳ" /></SelectTrigger>
                <SelectContent>
                  {periods.map((p) => (
                    <SelectItem key={p} value={p}>{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {comparison.data && (
            <div className="grid gap-3 sm:grid-cols-3">
              <ComparisonStat
                label={`Kỳ ${comparison.data.currentPeriod}`}
                value={`${formatNumber(comparison.data.currentVolume)} m³`}
              />
              <ComparisonStat
                label={`Kỳ ${comparison.data.previousPeriod}`}
                value={`${formatNumber(comparison.data.previousVolume)} m³`}
              />
              <ComparisonStat
                label="Thay đổi"
                value={
                  comparison.data.percentageChange === null
                    ? "—"
                    : `${comparison.data.percentageChange > 0 ? "+" : ""}${comparison.data.percentageChange}%`
                }
                icon={
                  comparison.data.direction === "up" ? (
                    <TrendingUp className="h-4 w-4 text-destructive" />
                  ) : comparison.data.direction === "down" ? (
                    <TrendingDown className="h-4 w-4 text-emerald-600" />
                  ) : (
                    <Minus className="h-4 w-4 text-muted-foreground" />
                  )
                }
              />
            </div>
          )}
          {comparison.isError && (
            <p className="text-sm text-destructive">Không thể tải kết quả so sánh.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}

function ComparisonStat({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="rounded-md bg-muted px-4 py-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="flex items-center gap-1.5 text-lg font-semibold">
        {icon}
        {value}
      </p>
    </div>
  );
}

function DetailStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-muted px-4 py-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-0.5 font-medium">{value}</p>
    </div>
  );
}
