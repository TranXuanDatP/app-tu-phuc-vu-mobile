import { Stack } from "expo-router";

/** Profile tab — Stack so `edit` pushes within the tab (not a separate tab). */
export default function ProfileLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
