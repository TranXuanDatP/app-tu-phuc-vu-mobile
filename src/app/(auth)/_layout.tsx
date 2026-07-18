import { Stack } from "expo-router";

/** Auth group: standalone full-screen routes, no tab bar, no header. */
export default function AuthLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
