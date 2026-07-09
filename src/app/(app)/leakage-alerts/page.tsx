"use client";

import { AppBar } from "@/components/layout/app-bar";
import { Skeleton } from "@/components/ui";
import { EmptyState, ErrorState } from "@/components/state";
import { useLeakageAlerts, useScheduleInspection } from "@/features/leakage-alert/queries";
import { cn, formatDate } from "@/lib/utils";
import type { LeakageStatus } from "@/lib/types/entities";

const STATUS: Record<LeakageStatus, { label: string; cls: string }> = {
  detected: { label: "Mới phát hiện", cls: "bg-coral-soft text-[#b0331f]" },
  investigating: { label: "Đang kiểm tra", cls: "bg-amber-soft text-[#8a5410]" },
  confirmed: { label: "Xác nhận rò rỉ", cls: "bg-coral-soft text-[#b0331f]" },
  resolved: { label: "Đã xử lý", cls: "bg-mint-soft text-[#0f6b4c]" },
};

export default function LeakageAlertPage() {
  const { data, isLoading, isError, refetch } = useLeakageAlerts();
  const schedule = useScheduleInspection();

  return (
    <div className="pb-4">
      <AppBar title="Cảnh báo rò rỉ" sub="AI phát hiện rò rỉ nước" />

      <div className="space-y-3 p-4">
        {isLoading ? (
          <Skeleton className="h-24 w-full" />
        ) : isError ? (
          <ErrorState onRetry={() => refetch()} />
        ) : !data?.alerts.length ? (
          <EmptyState title="Không phát hiện rò rỉ 🎉" />
        ) : (
          data.alerts.map((a) => (
            <div
              key={a.alertId}
              className="rounded-[18px] border border-line bg-card p-4 shadow-[0_6px_22px_rgba(10,42,56,.10)]"
            >
              <div className="flex items-center justify-between">
                <b className="text-[14px]">{a.suspectedLocation}</b>
                <span className={cn("rounded-full px-2.5 py-1 text-[11px] font-bold", STATUS[a.status].cls)}>
                  {STATUS[a.status].label}
                </span>
              </div>
              <p className="mt-1 text-[12.5px] text-muted-foreground">
                Độ tin cậy {Math.round(a.confidence * 100)}% · phát hiện {formatDate(a.detectedAt)}
              </p>
              {a.status !== "resolved" ? (
                <button
                  type="button"
                  onClick={() => schedule.mutate({ alertId: a.alertId })}
                  disabled={schedule.isPending}
                  className="mt-3 rounded-xl bg-deep px-3 py-2 text-[13px] font-bold text-white active:scale-[0.98] disabled:opacity-50"
                >
                  Lên lịch kiểm tra
                </button>
              ) : null}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
