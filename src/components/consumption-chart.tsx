"use client";

import { formatNumber } from "@/lib/utils";
import type { ConsumptionReading } from "@/lib/types/entities";

/**
 * Lightweight SVG bar chart for 12-month consumption — no chart dependency.
 */
export function ConsumptionChart({ data }: { data: ConsumptionReading[] }) {
  if (!data.length) return null;
  const max = Math.max(...data.map((d) => d.volume), 1);
  const sorted = [...data].sort((a, b) => a.month.localeCompare(b.month));

  return (
    <div className="flex h-56 items-end gap-1.5">
      {sorted.map((d) => {
        const heightPct = Math.max(4, (d.volume / max) * 100);
        return (
          <div key={d.month} className="group flex flex-1 flex-col items-center gap-1">
            <div className="relative flex w-full flex-1 items-end">
              <div
                className="w-full rounded-t bg-primary/80 transition-colors group-hover:bg-primary"
                style={{ height: `${heightPct}%` }}
                title={`${d.month}: ${formatNumber(d.volume)} m³`}
              />
            </div>
            <span className="text-[10px] text-muted-foreground">
              {d.month.slice(5)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
