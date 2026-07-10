import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type StatusTone = "success" | "warning" | "danger" | "info" | "neutral";

const toneVariant: Record<
  StatusTone,
  "success" | "warning" | "destructive" | "default" | "secondary"
> = {
  success: "success",
  warning: "warning",
  danger: "destructive",
  info: "default",
  neutral: "secondary",
};

const toneDot: Record<StatusTone, string> = {
  success: "bg-emerald-500",
  warning: "bg-amber-500",
  danger: "bg-red-500",
  info: "bg-blue-500",
  neutral: "bg-slate-400",
};

/**
 * Status pill with a colored dot; optional soft pulse (e.g. "live" indicators).
 */
export function StatusBadge({
  tone,
  label,
  pulse,
  className,
}: {
  tone: StatusTone;
  label: string;
  pulse?: boolean;
  className?: string;
}) {
  return (
    <Badge
      variant={toneVariant[tone]}
      className={cn("gap-1.5", pulse && "animate-pulse-soft", className)}
    >
      <span
        className={cn("inline-flex h-1.5 w-1.5 rounded-full", toneDot[tone])}
      />
      {label}
    </Badge>
  );
}
