import { Redirect, Tabs } from "expo-router";
import { useSession } from "@/lib/auth-client";
import { BottomTabBar } from "@/components/layout/bottom-nav";

/**
 * Mobile-first app shell — 5 bottom tabs (mirrors web FE BottomNav) behind a
 * session guard. No session → redirect to /login.
 */
export default function AppLayout() {
  const { data: session, isPending } = useSession();
  if (!isPending && !session) return <Redirect href="/login" />;

  return (
    <Tabs screenOptions={{ headerShown: false }} tabBar={(props) => <BottomTabBar {...props} />}>
      <Tabs.Screen name="dashboard" />
      <Tabs.Screen name="invoices" />
      <Tabs.Screen name="meters" />
      <Tabs.Screen name="incidents" />
      <Tabs.Screen name="profile" />
      {/* Pushed flows (hidden from tab bar) */}
      <Tabs.Screen name="payments" options={{ href: null }} />
      <Tabs.Screen name="contracts" options={{ href: null }} />
      <Tabs.Screen name="notifications" options={{ href: null }} />
    </Tabs>
  );
}
