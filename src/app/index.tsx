import { Redirect } from "expo-router";
import { View } from "react-native";
import { useSession } from "@/lib/auth-client";

/** Entry redirect: pending → splash; session → dashboard; else → login. */
export default function Index() {
  const { data: session, isPending } = useSession();
  if (isPending) return <View className="flex-1 bg-background" />;
  return <Redirect href={session ? "/dashboard" : "/login"} />;
}
