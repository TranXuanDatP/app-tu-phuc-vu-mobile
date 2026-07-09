"use client";

import { useState } from "react";
import { CalendarClock } from "lucide-react";
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
import { StatusBadge, type StatusTone } from "@/components/status-badge";
import { useCutoffSchedule, useCutoffStatus } from "@/features/water-cutoff/queries";
import { cutoffAreas } from "@/features/water-cutoff/labels";
import { cn, formatDateTime } from "@/lib/utils";

export default function WaterCutoffPage() {
  const [areaId, setAreaId] = useState("CP-DMA-1");
  const status = useCutoffStatus();
  const schedule = useCutoffSchedule(areaId);

  const active = !!status.data?.hasActiveCutoff;
  const scheduled = !!status.data?.scheduledAt;
  const tone: StatusTone = active ? "danger" : scheduled ? "warning" : "success";
  const label = active
    ? "Đang cắt nước"
    : scheduled
      ? "Dự kiến cắt nước"
      : "Cấp nước bình thường";
  const heroTint = active
    ? "from-red-500/25"
    : scheduled
      ? "from-amber-500/25"
      : "from-emerald-500/20";

  return (
    <div className="space-y-6">
      <div className="fade-in-up">
        <h1 className="text-2xl font-semibold tracking-tight">Cắt nước / Gián đoạn</h1>
        <p className="text-sm text-muted-foreground">
          Tình trạng cấp nước và lịch cắt nước theo khu vực
        </p>
      </div>

      {/* Status hero */}
      <div
        className="glass fade-in-up relative overflow-hidden rounded-2xl border border-white/10 p-6 shadow-lg shadow-primary/5"
        style={{ animationDelay: "60ms" }}
      >
        <div
          className={cn(
            "pointer-events-none absolute inset-0 bg-gradient-to-br to-transparent",
            heroTint,
          )}
        />
        <div className="relative space-y-2">
          {status.isLoading ? (
            <Skeleton className="h-8 w-48" />
          ) : status.isError ? (
            <ErrorState onRetry={() => status.refetch()} />
          ) : (
            <>
              <StatusBadge tone={tone} label={label} pulse={active} />
              {status.data?.reason ? (
                <p className="text-sm text-muted-foreground">
                  Lý do: {status.data.reason}
                </p>
              ) : null}
              <div className="text-sm text-muted-foreground">
                {active && status.data?.scheduledAt
                  ? `Từ ${formatDateTime(status.data.scheduledAt)}`
                  : null}
                {status.data?.resolvedAt
                  ? ` · Đã khôi phục: ${formatDateTime(status.data.resolvedAt)}`
                  : null}
                {!active && !scheduled ? "Khu vực của bạn không bị ảnh hưởng." : null}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Schedule */}
      <Card className="fade-in-up" style={{ animationDelay: "120ms" }}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="text-base">Lịch cắt nước theo khu vực</CardTitle>
            <CardDescription>Các đợt bảo trì / cắt nước dự kiến</CardDescription>
          </div>
          <Select value={areaId} onValueChange={setAreaId}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {cutoffAreas.map((a) => (
                <SelectItem key={a} value={a}>
                  {a}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          {schedule.isLoading ? (
            <Skeleton className="h-24 w-full" />
          ) : schedule.isError ? (
            <ErrorState onRetry={() => schedule.refetch()} />
          ) : !schedule.data?.schedules.length ? (
            <EmptyState title="Không có lịch cắt nước" />
          ) : (
            <ul className="space-y-3">
              {schedule.data.schedules.map((s, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 rounded-lg border p-3"
                >
                  <CalendarClock className="mt-0.5 h-4 w-4 text-primary" />
                  <div className="text-sm">
                    <p className="font-medium">
                      {formatDateTime(s.from)} → {formatDateTime(s.to)}
                    </p>
                    <p className="text-muted-foreground">{s.reason}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
