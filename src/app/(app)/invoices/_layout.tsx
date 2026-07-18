import { Stack } from "expo-router";

/** Invoices tab — Stack so [id] detail pushes within the tab (not a separate tab). */
export default function InvoicesLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
