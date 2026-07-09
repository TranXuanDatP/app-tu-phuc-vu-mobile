"use client";

import { AppBar } from "@/components/layout/app-bar";
import { Skeleton } from "@/components/ui";
import { EmptyState, ErrorState } from "@/components/state";
import { useAnomalyAlerts, useReportAnomalyStatus } from "@/features/meter-anomaly/queries";
import { cn, formatDate } from "@/lib/utils";
import type { AnomalySeverity, AnomalyType } from "@/lib/types/entities";

const TYPE_LABEL: Record<AnomalyType, string> = {
  continuous_flow: "Chảy liên tục (nghi rò rỉ)",
  backflow: "Ngược dòng",
  no_flow: "Không phát hiện dòng chảy",
  tamper: "Nghi canh tác đồng hồ",
};
const SEV: Record<AnomalySeverity, string> = {
  low: "bg-aqua-soft text-deep",
  medium: "bg-amber-soft text-[#8a5410]",
  high: "bg-coral-soft text-[#b0331f]",
};

export default function MeterAnomalyPage() {
  const { data, isLoading, isError, refetch } = useAnomalyAlerts();
  const ack = useReportAnomalyStatus();

  return (
    <div className="pb-4">
      <AppBar title="Cảnh báo đồng hồ" sub="Bất thường do AI phát hiện" />

      <div className="space-y-3 p-4">
        {isLoading ? (
          <Skeleton className="h-24 w-full" />
        ) : isError ? (
          <ErrorState onRetry={() => refetch()} />
        ) : !data?.alerts.length ? (
          <EmptyState title="Không có cảnh báo nào 🎉" />
        ) : (
          data.alerts.map((a) => (
            <div
              key={a.alertId}
              className="rounded-[18px] border border-line bg-card p-4 shadow-[0_6px_22px_rgba(10,42,56,.10)]"
            >
              <div className="flex items-center justify-between">
                <b className="text-[14px]">{TYPE_LABEL[a.type]}</b>
                <span className={cn("rounded-full px-2.5 py-1 text-[11px] font-bold capitalize", SEV[a.severity])}>
                  {a.severity}
                </span>
              </div>
              <p className="mt-1 text-[12.5px] text-muted-foreground">
                Đồng hồ {a.meterId} · phát hiện {formatDate(a.detectedAt)}
              </p>
              <button
                type="button"
                onClick={() => ack.mutate({ alertId: a.alertId, status: "acknowledged" })}
                disabled={ack.isPending}
                className="mt-3 rounded-xl border-[1.5px] border-line px-3 py-2 text-[13px] font-semibold text-deep active:scale-[0.98] disabled:opacity-50"
              >
                Xác nhận đã biết
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
