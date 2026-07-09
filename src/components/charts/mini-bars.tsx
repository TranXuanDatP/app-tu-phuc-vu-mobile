"use client";

import { cn } from "@/lib/utils";

/**
 * Compact bar chart with primary gradient bars — comparison / mini trend.
 * Div-based (hover brightness). Theme-aware.
 */
export function MiniBars({
  data,
  unit,
  className,
}: {
  data: { label: string; value: number }[];
  unit?: string;
  className?: string;
}) {
  if (!data.length) return null;
  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className={cn("flex h-40 items-end gap-1.5", className)}>
      {data.map((d, i) => {
        const h = Math.max(4, (d.value / max) * 100);
        return (
          <div
            key={i}
            className="group flex flex-1 flex-col items-center gap-1.5"
          >
            <div className="relative flex w-full flex-1 items-end">
              <div
                className="w-full rounded-t-md transition-all duration-300 group-hover:brightness-110"
                style={{
                  height: `${h}%`,
                  background:
                    "linear-gradient(to top, var(--color-primary), color-mix(in oklab, var(--color-primary) 55%, white))",
                }}
                title={`${d.label}: ${d.value}${unit ?? ""}`}
              />
            </div>
            <span className="text-[10px] text-muted-foreground">{d.label}</span>
          </div>
        );
      })}
    </div>
  );
}
