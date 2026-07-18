import { Stack } from "expo-router";

/** Notifications flow — pushed (hidden tab). Inbox. */
export default function NotificationsLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
