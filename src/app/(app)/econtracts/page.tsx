"use client";

import { AppBar } from "@/components/layout/app-bar";
import { Button, Skeleton } from "@/components/ui";
import { EmptyState, ErrorState } from "@/components/state";
import { useEcontract, useSignContract } from "@/features/econtract/queries";
import { cn, formatDate } from "@/lib/utils";
import { Download, FileSignature } from "lucide-react";
import type { EcontractStatus } from "@/lib/types/entities";

const STATUS: Record<EcontractStatus, { label: string; cls: string }> = {
  draft: { label: "Bản nháp", cls: "bg-muted text-muted-foreground" },
  pending_signature: { label: "Chờ ký", cls: "bg-amber-soft text-[#8a5410]" },
  signed: { label: "Đã ký", cls: "bg-mint-soft text-[#0f6b4c]" },
  expired: { label: "Hết hạn", cls: "bg-coral-soft text-[#b0331f]" },
};

const DOSSIER_ID = "DOS-2026-0042";

export default function EcontractPage() {
  const { data: contract, isLoading, isError, refetch } = useEcontract(DOSSIER_ID);
  const sign = useSignContract();
  const c = contract;

  return (
    <div className="pb-4">
      <AppBar title="Hợp đồng điện tử" sub="Ký số hợp đồng cấp nước" back />
      <div className="space-y-4 p-4">
        {isLoading ? (
          <Skeleton className="h-48 w-full" />
        ) : isError ? (
          <ErrorState onRetry={() => refetch()} />
        ) : c ? (
          <>
            <div className="rounded-[18px] border border-line bg-card p-4 shadow-[0_6px_22px_rgba(10,42,56,.10)]">
              <div className="mb-2 flex items-center justify-between">
                <b className="text-[15px]">Hồ sơ {c.dossierId}</b>
                <span className={cn("rounded-full px-2.5 py-1 text-[11px] font-bold", STATUS[c.status].cls)}>
                  {STATUS[c.status].label}
                </span>
              </div>
              <div className="space-y-1.5 text-[13px]">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Mã KH</span>
                  <b>{c.customerId}</b>
                </div>
                {c.signedAt ? (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Ngày ký</span>
                    <b>{formatDate(c.signedAt)}</b>
                  </div>
                ) : null}
              </div>
            </div>
            {c.downloadUrl ? (
              <a
                href={c.downloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-[52px] items-center justify-center gap-2 rounded-[14px] border-[1.5px] border-line font-extrabold text-deep"
              >
                <Download className="h-4 w-4" /> Tải hợp đồng PDF
              </a>
            ) : null}
            {c.status === "pending_signature" ? (
              <Button
                type="button"
                disabled={sign.isPending}
                onClick={() => sign.mutate({ dossierId: DOSSIER_ID, signatureRef: "customer-otp" })}
                className="h-[52px] w-full gap-2 rounded-[14px] bg-deep text-[15.5px] font-extrabold"
              >
                <FileSignature className="h-4 w-4" /> {sign.isPending ? "Đang ký..." : "Ký hợp đồng"}
              </Button>
            ) : null}
          </>
        ) : (
          <EmptyState />
        )}
      </div>
    </div>
  );
}
