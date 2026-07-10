"use client";

import { useId } from "react";
import { cn } from "@/lib/utils";

/**
 * Inline SVG sparkline with gradient fill — tiny inline trend indicator.
 * Theme-aware via `var(--color-primary)`. No chart dependency.
 */
export function Sparkline({
  data,
  width = 120,
  height = 36,
  className,
}: {
  data: number[];
  width?: number;
  height?: number;
  className?: string;
}) {
  const raw = useId();
  const id = raw.replace(/:/g, "");
  if (data.length < 2) return null;

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const stepX = width / (data.length - 1);
  const pts = data.map(
    (v, i) =>
      [i * stepX, height - ((v - min) / range) * (height - 4) - 2] as const,
  );
  const line = pts
    .map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(1)},${p[1].toFixed(1)}`)
    .join(" ");
  const area = `${line} L${width.toFixed(1)},${height} L0,${height} Z`;
  const last = pts[pts.length - 1];

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      className={cn("overflow-visible", className)}
      preserveAspectRatio="none"
      aria-hidden
    >
      <defs>
        <linearGradient id={`sp-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.35" />
          <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#sp-${id})`} />
      <path
        d={line}
        fill="none"
        stroke="var(--color-primary)"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={last[0]} cy={last[1]} r={2.5} fill="var(--color-primary)" />
    </svg>
  );
}
