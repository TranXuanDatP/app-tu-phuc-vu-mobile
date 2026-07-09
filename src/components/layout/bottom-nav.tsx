"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Droplet, Home, ReceiptText, Siren, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/dashboard", label: "Trang chủ", icon: Home, match: ["/dashboard", "/"] },
  { href: "/invoices", label: "Hóa đơn", icon: ReceiptText, match: ["/invoices"] },
  { href: "/meters", label: "Tiêu thụ", icon: Droplet, match: ["/meters"] },
  { href: "/tickets", label: "Sự cố", icon: Siren, match: ["/tickets"] },
  { href: "/profile", label: "Tài khoản", icon: UserRound, match: ["/profile"] },
] as const;

export function BottomNav() {
  const pathname = usePathname();
  // Full-screen chat hides the bottom nav (input sits at the bottom instead).
  if (pathname === "/chat" || pathname.startsWith("/chat/")) return null;
  return (
    <nav className="fixed bottom-0 left-1/2 z-40 flex w-full max-w-md -translate-x-1/2 border-t border-line bg-card/92 px-1.5 pb-[max(env(safe-area-inset-bottom),14px)] pt-2 backdrop-blur-md">
      {items.map((it) => {
        const active = it.match.some((m) =>
          m === "/" ? pathname === "/" : pathname === m || pathname.startsWith(`${m}/`),
        );
        const Icon = it.icon;
        return (
          <Link
            key={it.href}
            href={it.href}
            className={cn(
              "flex flex-1 flex-col items-center gap-1 rounded-xl py-1 text-[10.5px] font-semibold transition-colors",
              active ? "text-deep" : "text-muted-foreground",
            )}
          >
            <span
              className={cn(
                "flex h-8 w-11 items-center justify-center rounded-xl transition-colors",
                active && "bg-aqua-soft",
              )}
            >
              <Icon className="h-5 w-5" />
            </span>
            {it.label}
          </Link>
        );
      })}
    </nav>
  );
}
