"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Droplets } from "lucide-react";
import { cn } from "@/lib/utils";
import { navItems } from "./nav";

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 border-r bg-card md:flex md:flex-col">
      <div className="flex h-16 items-center gap-2 border-b px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Droplets className="h-5 w-5" />
        </div>
        <div className="leading-tight">
          <p className="text-sm font-semibold">IOC CSKH</p>
          <p className="text-xs text-muted-foreground">Cổng Khách hàng</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {navItems.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          const content = (
            <span
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                !item.enabled && "cursor-not-allowed opacity-50 hover:bg-transparent",
              )}
            >
              <Icon className="h-4 w-4" />
              {item.title}
            </span>
          );
          return item.enabled ? (
            <Link key={item.href} href={item.href}>
              {content}
            </Link>
          ) : (
            <div key={item.href} title="Sắp ra mắt" aria-disabled>
              {content}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
