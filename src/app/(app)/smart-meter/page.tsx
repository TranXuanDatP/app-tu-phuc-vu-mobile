"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Skeleton,
} from "@/components/ui";
import { EmptyState, ErrorState } from "@/components/state";
import { Gauge } from "@/components/charts";
import { StatusBadge } from "@/components/status-badge";
import {
  useMeterStatus,
  useRealtimeConsumption,
} from "@/features/smart-meter/queries";
import { smartMeterOnlineLabel } from "@/features/smart-meter/labels";
import { formatDateTime, formatNumber } from "@/lib/utils";

export default function SmartMeterPage() {
  const realtime = useRealtimeConsumption();
  const meterId = realtime.data?.meterId ?? "";
  const status = useMeterStatus(meterId);
  const online = status.data?.online ?? false;

  return (
    <div className="space-y-6">
      <div className="fade-in-up">
        <h1 className="text-2xl font-semibold tracking-tight">Đồng hồ thông minh</h1>
        <p className="text-sm text-muted-foreground">
          Tiêu thụ theo thời gian thực và tình trạng thiết bị
        </p>
      </div>

      {realtime.isLoading ? (
        <Skeleton className="h-48 w-full" />
      ) : realtime.isError ? (
        <ErrorState onRetry={() => realtime.refetch()} />
      ) : !realtime.data ? (
        <EmptyState title="Chưa có đồng hồ thông minh" />
      ) : (
        <div className="grid gap-4 lg:grid-cols-3">
          {/* Flow + live status hero */}
          <Card
            className="glass fade-in-up relative col-span-1 overflow-hidden lg:col-span-2"
            style={{ animationDelay: "60ms" }}
          >
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-blue-500/15 to-transparent" />
            <CardHeader className="relative flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-base">Lưu lượng tức thời</CardTitle>
                <CardDescription>Đồng hồ {realtime.data.meterId}</CardDescription>
              </div>
              <StatusBadge
                tone={online ? "success" : "danger"}
                label={smartMeterOnlineLabel(online)}
                pulse={online}
              />
            </CardHeader>
            <CardContent className="relative">
              <p className="text-4xl font-bold tabular-nums">
                {formatNumber(realtime.data.currentFlowM3h)}
                <span className="ml-1 text-base font-medium text-muted-foreground">
                  m³/h
                </span>
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Hôm nay: {formatNumber(realtime.data.todayM3)} m³ · Cập nhật{" "}
                {formatDateTime(realtime.data.lastReadingAt)}
              </p>
            </CardContent>
          </Card>

          {/* Battery gauge */}
          <Card
            className="glass fade-in-up flex flex-col items-center justify-center"
            style={{ animationDelay: "120ms" }}
          >
            <CardContent className="flex flex-col items-center pt-6">
              {status.isLoading ? (
                <Skeleton className="h-32 w-32 rounded-full" />
              ) : status.isError ? (
                <ErrorState onRetry={() => status.refetch()} />
              ) : status.data ? (
                <>
                  <Gauge
                    value={status.data.batteryLevel}
                    max={100}
                    unit="%"
                    label="Pin thiết bị"
                    tone={
                      status.data.batteryLevel < 20
                        ? "danger"
                        : status.data.batteryLevel < 50
                          ? "warning"
                          : "success"
                    }
                  />
                  <p className="mt-2 text-xs text-muted-foreground">
                    Hoạt động cuối: {formatDateTime(status.data.lastSeenAt)}
                  </p>
                </>
              ) : null}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
