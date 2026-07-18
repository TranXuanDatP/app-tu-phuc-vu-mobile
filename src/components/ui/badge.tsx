import { Text } from "react-native";
import { cn } from "@/lib/utils";

const VARIANTS = {
  default: "bg-secondary text-deep",
  success: "bg-mint-soft text-success",
  warning: "bg-amber-soft text-warning",
  destructive: "bg-coral-soft text-destructive",
  outline: "border border-line text-muted-foreground",
} as const;

export type BadgeVariant = keyof typeof VARIANTS;

/** Status pill (mirrors web FE badge). Text-with-bg keeps it a single inline node. */
export function Badge({
  variant = "default",
  children,
  className,
}: {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Text
      className={cn("self-start rounded-md px-2.5 py-0.5 text-xs font-semibold", VARIANTS[variant], className)}
    >
      {children}
    </Text>
  );
}
