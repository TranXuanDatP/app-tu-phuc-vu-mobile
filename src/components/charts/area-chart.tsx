"use client";

import { useId } from "react";
import { cn } from "@/lib/utils";

/**
 * SVG area+line trend chart with gridlines, data points, and x-axis labels.
 * Responsive via viewBox + w-full (proportional, no distortion). Theme-aware.
 */
export function AreaChart({
  data,
  unit,
  className,
}: {
  data: { label: string; value: number }[];
  unit?: string;
  className?: string;
}) {
  const raw = useId();
  const id = raw.replace(/:/g, "");
  const W = 600;
  const H = 220;
  const pad = { l: 10, r: 10, t: 14, b: 26 };
  if (!data.length) return null;

  const max = Math.max(...data.map((d) => d.value), 1);
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;
  const stepX = data.length > 1 ? innerW / (data.length - 1) : 0;
  const x = (i: number) => pad.l + i * stepX;
  const y = (v: number) => pad.t + innerH - (v / max) * innerH;

  const pts = data.map((d, i) => [x(i), y(d.value)] as const);
  const line = pts
    .map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(1)},${p[1].toFixed(1)}`)
    .join(" ");
  const area = `${line} L${x(data.length - 1).toFixed(1)},${(pad.t + innerH).toFixed(1)} L${x(0).toFixed(1)},${(pad.t + innerH).toFixed(1)} Z`;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className={cn("h-auto w-full", className)}
      role="img"
      aria-label={`Biểu đồ${unit ? ` ${unit}` : ""}`}
    >
      <defs>
        <linearGradient id={`ac-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.32" />
          <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0, 0.25, 0.5, 0.75, 1].map((f) => (
        <line
          key={f}
          x1={pad.l}
          x2={W - pad.r}
          y1={pad.t + innerH * f}
          y2={pad.t + innerH * f}
          stroke="var(--color-border)"
          strokeWidth={1}
          strokeDasharray="3 4"
        />
      ))}
      <path d={area} fill={`url(#ac-${id})`} />
      <path
        d={line}
        fill="none"
        stroke="var(--color-primary)"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {pts.map((p, i) => (
        <circle
          key={i}
          cx={p[0]}
          cy={p[1]}
          r={3.5}
          fill="var(--color-background)"
          stroke="var(--color-primary)"
          strokeWidth={2}
        />
      ))}
      {data.map((d, i) => (
        <text
          key={i}
          x={x(i)}
          y={H - 8}
          textAnchor="middle"
          className="fill-muted-foreground"
          style={{ fontSize: 11 }}
        >
          {d.label}
        </text>
      ))}
    </svg>
  );
}
