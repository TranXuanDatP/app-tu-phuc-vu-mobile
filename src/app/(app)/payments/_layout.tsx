import { Stack } from "expo-router";

/** Payments flow — pushed (hidden tab). Stack so [invoiceId] is the pay screen. */
export default function PaymentsLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
