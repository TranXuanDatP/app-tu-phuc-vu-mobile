"use client";

import { useState } from "react";
import { AppBar } from "@/components/layout/app-bar";
import { Button, Input, Skeleton } from "@/components/ui";
import { EmptyState, ErrorState } from "@/components/state";
import { useCoverage, useNearbyIncidents } from "@/features/gis/queries";
import { cn, formatDate } from "@/lib/utils";

export default function GisPage() {
  const [address, setAddress] = useState("");
  const [searched, setSearched] = useState("");
  const coverage = useCoverage(searched);
  const incidents = useNearbyIncidents(20.9667, 107.3167);

  return (
    <div className="pb-4">
      <AppBar title="Phạm vi cấp nước" sub="Kiểm tra vùng phủ + sự cố lân cận" />
      <div className="space-y-4 p-4">
        <div className="space-y-2">
          <Input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Nhập địa chỉ cần kiểm tra..."
          />
          <Button
            type="button"
            onClick={() => setSearched(address)}
            disabled={!address}
            className="h-[48px] w-full rounded-[14px] bg-aqua font-bold"
          >
            Kiểm tra
          </Button>
        </div>

        {searched ? (
          coverage.isLoading ? (
            <Skeleton className="h-24 w-full" />
          ) : coverage.isError ? (
            <ErrorState onRetry={() => coverage.refetch()} />
          ) : coverage.data ? (
            <div
              className={cn(
                "rounded-[18px] border p-4",
                coverage.data.covered
                  ? "border-[#CBE9DC] bg-mint-soft"
                  : "border-[#F3D2CB] bg-coral-soft",
              )}
            >
              <b className="text-[15px]">
                {coverage.data.covered ? "✅ Đã có mạng cấp nước" : "❌ Chưa có mạng cấp nước"}
              </b>
              {coverage.data.dma ? (
                <p className="mt-1 text-[12.5px] text-muted-foreground">
                  Khu vực DMA: {coverage.data.dma}
                </p>
              ) : null}
              {coverage.data.estimatedConnectionDays ? (
                <p className="text-[12.5px] text-muted-foreground">
                  Dự kiến nối: {coverage.data.estimatedConnectionDays} ngày
                </p>
              ) : null}
            </div>
          ) : null
        ) : null}

        <h2 className="px-1 text-sm font-bold">Sự cố lân cận</h2>
        <div className="space-y-2.5">
          {incidents.isLoading ? (
            <Skeleton className="h-16 w-full" />
          ) : incidents.isError ? (
            <ErrorState onRetry={() => incidents.refetch()} />
          ) : !incidents.data?.incidents.length ? (
            <EmptyState title="Không có sự cố" />
          ) : (
            incidents.data.incidents.map((inc) => (
              <div
                key={inc.id}
                className="rounded-[14px] border border-line bg-card p-3.5 shadow-[0_6px_22px_rgba(10,42,56,.10)]"
              >
                <div className="flex items-center justify-between">
                  <b className="text-[14px]">{inc.type}</b>
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[11px] font-bold capitalize",
                      inc.status === "resolved"
                        ? "bg-mint-soft text-[#0f6b4c]"
                        : "bg-amber-soft text-[#8a5410]",
                    )}
                  >
                    {inc.status}
                  </span>
                </div>
                <p className="mt-1 text-[12.5px] text-muted-foreground">
                  {inc.address} · cách {inc.distanceMeters}m · {formatDate(inc.updatedAt)}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
