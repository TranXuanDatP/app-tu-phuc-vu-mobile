"use client";

import { AppBar } from "@/components/layout/app-bar";
import { Skeleton } from "@/components/ui";
import { ErrorState } from "@/components/state";
import { useTeamEta, useTeamLocation } from "@/features/field-team/queries";
import { formatDate } from "@/lib/utils";

const TICKET_ID = "TK-2026-002";

export default function FieldTeamPage() {
  const eta = useTeamEta(TICKET_ID);
  const loc = useTeamLocation(TICKET_ID);
  const e = eta.data;

  return (
    <div className="pb-4">
      <AppBar title="Theo dõi đội kỹ thuật" sub={`Ticket ${TICKET_ID}`} back />
      <div className="space-y-4 p-4">
        {eta.isLoading ? (
          <Skeleton className="h-24 w-full" />
        ) : eta.isError ? (
          <ErrorState onRetry={() => eta.refetch()} />
        ) : e ? (
          <div className="flex items-center gap-3.5 rounded-[18px] border border-[#CBE9DC] bg-mint-soft p-4">
            <span className="text-[30px] font-extrabold tabular-nums text-[#0f6b4c]">{e.etaMinutes}'</span>
            <div>
              <b className="text-[14px]">Đội {e.teamId} đang tới</b>
              <p className="text-[12.5px] text-muted-foreground">Trạng thái: {e.status}</p>
            </div>
          </div>
        ) : null}

        {loc.isLoading ? (
          <Skeleton className="h-20 w-full" />
        ) : loc.data ? (
          <div className="rounded-[18px] border border-line bg-card p-4 shadow-[0_6px_22px_rgba(10,42,56,.10)]">
            <b className="text-[14px]">Vị trí đội (GPS)</b>
            <p className="mt-1 text-[12.5px] text-muted-foreground">
              Lat {loc.data.latitude}, Lng {loc.data.longitude}
            </p>
            <p className="text-[12.5px] text-muted-foreground">
              Cập nhật {formatDate(loc.data.updatedAt)}
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
