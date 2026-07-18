import { Stack } from "expo-router";

/** Contracts flow — pushed (hidden tab). List + detail. */
export default function ContractsLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
