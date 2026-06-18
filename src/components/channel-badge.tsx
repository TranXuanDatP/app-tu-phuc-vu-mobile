import { MessageCircle, Globe, Phone, Store, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SessionChannel } from "@/lib/types/entities";

/**
 * Per-channel visual identity — makes the OMNICHANNEL nature visible at a glance
 * (a Zalo message reads distinctly from a web/hotline/counter interaction).
 */
export const channelMeta: Record<
  SessionChannel,
  { label: string; icon: LucideIcon; chip: string; dot: string }
> = {
  zalo: {
    label: "Zalo",
    icon: MessageCircle,
    chip: "bg-sky-50 text-sky-700 ring-1 ring-sky-200",
    dot: "bg-sky-500",
  },
  web: {
    label: "Web",
    icon: Globe,
    chip: "bg-slate-100 text-slate-700 ring-1 ring-slate-200",
    dot: "bg-slate-400",
  },
  hotline: {
    label: "Hotline",
    icon: Phone,
    chip: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
    dot: "bg-emerald-500",
  },
  counter: {
    label: "Quầy trực tiếp",
    icon: Store,
    chip: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
    dot: "bg-amber-500",
  },
};

export function ChannelBadge({
  channel,
  className,
}: {
  channel: SessionChannel;
  className?: string;
}) {
  const meta = channelMeta[channel];
  const Icon = meta.icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
        meta.chip,
        className,
      )}
    >
      <Icon className="h-3 w-3" />
      {meta.label}
    </span>
  );
}
