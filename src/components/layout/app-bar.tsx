"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";

/**
 * Mobile sticky app bar (per the UI spec): title + optional subtitle +
 * optional back button. Used at the top of sub-pages (Bills, Usage, Report…).
 */
export function AppBar({
  title,
  sub,
  back,
  children,
}: {
  title: string;
  sub?: string;
  back?: boolean;
  children?: React.ReactNode;
}) {
  const router = useRouter();
  return (
    <div className="sticky top-0 z-30 flex items-center gap-3 border-b border-line bg-card/95 px-4 pb-3 pt-3.5 backdrop-blur">
      {back ? (
        <button
          type="button"
          aria-label="Quay lại"
          onClick={() => router.back()}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-line text-deep active:scale-95"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
      ) : null}
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-[18px] font-extrabold tracking-tight">{title}</h1>
        {sub ? <p className="truncate text-xs text-muted-foreground">{sub}</p> : null}
      </div>
      {children}
    </div>
  );
}
