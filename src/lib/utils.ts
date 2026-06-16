import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Tailwind class merger (shadcn/ui convention). */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format VND currency. */
export function formatCurrency(amount: number | string | undefined | null): string {
  const value = typeof amount === "string" ? Number(amount) : amount;
  if (value === undefined || value === null || Number.isNaN(value)) return "—";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);
}

/** Format a plain number with vi-VN grouping. */
export function formatNumber(value: number | string | undefined | null): string {
  const n = typeof value === "string" ? Number(value) : value;
  if (n === undefined || n === null || Number.isNaN(n)) return "—";
  return new Intl.NumberFormat("vi-VN").format(n);
}

/** Format ISO date string to vi-VN date. */
export function formatDate(
  value: string | Date | undefined | null,
  opts: Intl.DateTimeFormatOptions = { dateStyle: "medium" },
): string {
  if (!value) return "—";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("vi-VN", opts).format(date);
}

/** Format a date+time (medium date + short time). */
export function formatDateTime(value: string | Date | undefined | null): string {
  return formatDate(value, { dateStyle: "medium", timeStyle: "short" });
}
