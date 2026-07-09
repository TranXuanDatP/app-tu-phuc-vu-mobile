"use client";

import { AppBar } from "@/components/layout/app-bar";
import { Skeleton } from "@/components/ui";
import { EmptyState, ErrorState } from "@/components/state";
import { useQualityAlerts, useQualityAtLocation } from "@/features/water-quality/queries";
import { cn, formatDate } from "@/lib/utils";
import type { QualityStatus } from "@/lib/types/entities";

const STATUS: Record<QualityStatus, { label: string; cls: string }> = {
  safe: { label: "Đạt chuẩn", cls: "bg-mint-soft text-[#0f6b4c]" },
  advisory: { label: "Lưu ý", cls: "bg-amber-soft text-[#8a5410]" },
  unsafe: { label: "Không an toàn", cls: "bg-coral-soft text-[#b0331f]" },
};

export default function WaterQualityPage() {
  const quality = useQualityAtLocation("Cẩm Phả");
  const alerts = useQualityAlerts();
  const q = quality.data;

  return (
    <div className="pb-4">
      <AppBar title="Chất lượng nước" sub="Thông số + cảnh báo khu vực" />

      <div className="space-y-4 p-4">
        <div className="rounded-[18px] border border-line bg-card p-4 shadow-[0_6px_22px_rgba(10,42,56,.10)]">
          <div className="mb-2 flex items-center justify-between">
            <b className="text-[15px]">Khu vực {q?.location ?? "..."}</b>
            {q ? (
              <span className={cn("rounded-full px-2.5 py-1 text-[11px] font-bold", STATUS[q.status].cls)}>
                {STATUS[q.status].label}
              </span>
            ) : null}
          </div>
          {quality.isLoading ? (
            <Skeleton className="h-20 w-full" />
          ) : quality.isError ? (
            <ErrorState onRetry={() => quality.refetch()} />
          ) : q ? (
            <div className="grid grid-cols-3 gap-2">
              <Metric label="pH" value={q.ph.toFixed(1)} />
              <Metric label="Độ đục (NTU)" value={q.turbidity.toFixed(2)} />
              <Metric label="Clo (mg/L)" value={q.chlorine.toFixed(2)} />
            </div>
          ) : null}
          {q ? (
            <p className="mt-2 text-[12px] text-muted-foreground">Lấy mẫu {formatDate(q.testedAt)}</p>
          ) : null}
        </div>

        <h2 className="px-1 text-sm font-bold">Cảnh báo chất lượng</h2>
        <div className="space-y-2.5">
          {alerts.isLoading ? (
            <Skeleton className="h-16 w-full" />
          ) : alerts.isError ? (
            <ErrorState onRetry={() => alerts.refetch()} />
          ) : !alerts.data?.alerts.length ? (
            <EmptyState title="Không có cảnh báo" />
          ) : (
            alerts.data.alerts.map((a) => (
              <div
                key={a.alertId}
                className="rounded-[14px] border border-line bg-card p-3.5 shadow-[0_6px_22px_rgba(10,42,56,.10)]"
              >
                <div className="flex items-center justify-between">
                  <b className="text-[14px]">{a.area} · {a.parameter}</b>
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[11px] font-bold",
                      a.status === "active" ? "bg-coral-soft text-[#b0331f]" : "bg-muted text-muted-foreground",
                    )}
                  >
                    {a.status === "active" ? "Đang" : "Đã xử lý"}
                  </span>
                </div>
                <p className="mt-1 text-[12.5px] text-muted-foreground">
                  Giá trị {a.value} (giới hạn {a.limit}) · {formatDate(a.issuedAt)}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[14px] bg-foam p-2.5 text-center">
      <b className="block text-[18px] font-extrabold tabular-nums text-deep">{value}</b>
      <span className="text-[10px] font-semibold text-muted-foreground">{label}</span>
    </div>
  );
}
