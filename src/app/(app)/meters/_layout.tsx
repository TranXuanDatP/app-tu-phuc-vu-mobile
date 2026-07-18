import { Stack } from "expo-router";

/** Usage/meters tab — Stack so `history` pushes within the tab (not a separate tab). */
export default function MetersLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
