import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Glassmorphism surface — translucent + backdrop-blur card for the data-rich
 * dashboard. Pass a `gradient` className (e.g. "from-primary/10") for a tinted
 * overlay. Otherwise behaves like a div (use children freely).
 */
const GlassCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "glass relative overflow-hidden rounded-2xl border border-white/10 shadow-lg shadow-primary/5",
      className,
    )}
    {...props}
  />
));
GlassCard.displayName = "GlassCard";

export { GlassCard };
