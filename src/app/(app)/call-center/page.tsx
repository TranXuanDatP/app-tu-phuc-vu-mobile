"use client";

import { AppBar } from "@/components/layout/app-bar";
import { Skeleton } from "@/components/ui";
import { EmptyState, ErrorState } from "@/components/state";
import { useCallHistory, useClickToCall } from "@/features/call-center/queries";
import { formatDate } from "@/lib/utils";
import { PhoneCall } from "lucide-react";

export default function CallCenterPage() {
  const { data, isLoading, isError, refetch } = useCallHistory();
  const call = useClickToCall();

  return (
    <div className="pb-4">
      <AppBar title="Tổng đài" sub="Gọi nhanh + lịch sử" back />
      <div className="space-y-4 p-4">
        <button
          type="button"
          onClick={() => call.mutate("19001234")}
          disabled={call.isPending}
          className="flex h-[52px] w-full items-center justify-center gap-2 rounded-[14px] bg-deep text-[15.5px] font-extrabold text-white active:scale-[0.98]"
        >
          <PhoneCall className="h-4 w-4" /> {call.isPending ? "Đang kết nối..." : "Gọi tổng đài 1900 1234"}
        </button>

        <h2 className="px-1 text-sm font-bold">Lịch sử cuộc gọi</h2>
        <div className="overflow-hidden rounded-[18px] border border-line bg-card shadow-[0_6px_22px_rgba(10,42,56,.10)]">
          {isLoading ? (
            <Skeleton className="h-16 w-full" />
          ) : isError ? (
            <ErrorState onRetry={() => refetch()} />
          ) : !data?.calls.length ? (
            <EmptyState title="Chưa có cuộc gọi nào" />
          ) : (
            data.calls.map((c, i) => (
              <div
                key={c.callId}
                className={`flex items-center justify-between px-4 py-3.5 ${i < data.calls.length - 1 ? "border-b border-line" : ""}`}
              >
                <div>
                  <b className="text-[14px]">{c.outcome}</b>
                  <p className="text-[12.5px] text-muted-foreground">
                    {formatDate(c.startedAt)} · {c.durationSec}s
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
