import { Stack } from "expo-router";

/** Incidents tab — Stack so `create` + `[id]` push within the tab (not separate tabs). */
export default function IncidentsLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
