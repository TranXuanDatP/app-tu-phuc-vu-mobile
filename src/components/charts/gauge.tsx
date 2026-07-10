"use client";

import { cn } from "@/lib/utils";

type GaugeTone = "primary" | "success" | "warning" | "danger";
const toneVar: Record<GaugeTone, string> = {
  primary: "var(--color-primary)",
  success: "var(--color-success)",
  warning: "var(--color-warning)",
  danger: "var(--color-destructive)",
};

/**
 * Circular progress ring gauge (Apple-style). Theme-aware.
 * Use for %, battery level, flow rate vs max, etc.
 */
export function Gauge({
  value,
  max = 100,
  label,
  unit,
  size = 132,
  stroke = 12,
  tone = "primary",
  className,
}: {
  value: number;
  max?: number;
  label?: string;
  unit?: string;
  size?: number;
  stroke?: number;
  tone?: GaugeTone;
  className?: string;
}) {
  const pct = Math.min(1, Math.max(0, max > 0 ? value / max : 0));
  const r = (size - stroke) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - pct);

  return (
    <div
      className={cn("relative inline-flex items-center justify-center", className)}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} aria-hidden>
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke="var(--color-muted)"
          strokeWidth={stroke}
        />
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={toneVar[tone]}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${cx} ${cy})`}
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold tabular-nums">
          {Math.round(value)}
          {unit ? (
            <span className="ml-0.5 text-sm font-medium text-muted-foreground">
              {unit}
            </span>
          ) : null}
        </span>
        {label ? (
          <span className="mt-0.5 max-w-[80%] text-center text-xs text-muted-foreground">
            {label}
          </span>
        ) : null}
      </div>
    </div>
  );
}
