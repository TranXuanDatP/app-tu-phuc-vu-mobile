import { Pressable, Text, View } from "react-native";
import { router } from "expo-router";
import { ShieldCheck } from "lucide-react-native";
import { useProfileStatus } from "@/features/auth/hooks";
import { colors } from "@/theme/colors";

/**
 * Limited-mode gate. Wrap a gated screen's content: when the user's identity is
 * not yet `complete`, block the content and show a prompt to complete the
 * profile instead.
 *
 * Reads the shared `['auth','me']` cache via `useProfileStatus()` (no polling —
 * the dashboard drives updates). On a cold cache (deep-link into a gated tab)
 * `isPending` is true and we render a brief splash rather than the gated content
 * — this prevents the screen's data hooks from firing before the gate can decide.
 * In the normal flow the cache is already warm from the dashboard, so the gate
 * resolves instantly.
 *
 * Usage (split so the screen's data hooks only mount when allowed):
 *   export default function InvoicesScreen() {
 *     return <ProfileGate><InvoicesContent /></ProfileGate>;
 *   }
 */
export function ProfileGate({ children }: { children: React.ReactNode }) {
  const me = useProfileStatus();
  const status = me.data?.profileStatus;

  if (me.isPending) return <View className="flex-1 bg-background" />;
  if (status === "complete") return <>{children}</>;

  // incomplete | no_match → limited mode.
  return (
    <View className="flex-1 items-center justify-center bg-background px-8">
      <View className="mb-4 h-[72px] w-[72px] items-center justify-center rounded-[22px] bg-aqua-soft">
        <ShieldCheck size={34} color={colors.deep} />
      </View>
      <Text className="text-center text-xl font-extrabold text-foreground">
        Hoàn tất định danh để dùng tính năng này
      </Text>
      <Text className="mt-2 text-center text-[13px] leading-relaxed text-muted-foreground">
        Tính năng này cần hồ sơ khách hàng đã được xác minh. Vui lòng cập nhật định danh của bạn.
      </Text>
      <Pressable
        onPress={() => router.push("/register")}
        className="mt-6 h-[50px] w-full max-w-[280px] items-center justify-center rounded-[14px] bg-deep active:opacity-80"
      >
        <Text className="text-[15px] font-extrabold text-white">Hoàn tất định danh</Text>
      </Pressable>
    </View>
  );
}
