import { BottomNav } from "@/components/layout/bottom-nav";

/**
 * Mobile-first app shell — a centered phone-width column with a fixed bottom
 * navigation (5 tabs). Replaces the old desktop sidebar+header chrome.
 * Pages render their own sticky appbar (see Home/Bills/etc).
 */
export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative mx-auto flex min-h-screen w-full max-w-md flex-col bg-background shadow-xl">
      <main className="flex-1 pb-28">{children}</main>
      <BottomNav />
    </div>
  );
}
