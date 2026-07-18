import Toast, { type ToastConfig } from "react-native-toast-message";
import { View, Text } from "react-native";

/**
 * RN toast (react-native-toast-message) styled with QUAWACO tokens, mirroring the
 * web sonner Toaster. The toast() helper in src/lib/toast drives it.
 */
const toastConfig: ToastConfig = {
  success: ({ text2 }) => (
    <View className="mx-4 mt-2 rounded-xl border border-success/30 bg-success px-4 py-3 shadow-lg">
      <Text className="text-sm font-semibold text-white">{text2}</Text>
    </View>
  ),
  error: ({ text2 }) => (
    <View className="mx-4 mt-2 rounded-xl border border-destructive/30 bg-destructive px-4 py-3 shadow-lg">
      <Text className="text-sm font-semibold text-white">{text2}</Text>
    </View>
  ),
  info: ({ text2 }) => (
    <View className="mx-4 mt-2 rounded-xl border border-deep/30 bg-deep px-4 py-3 shadow-lg">
      <Text className="text-sm font-semibold text-white">{text2}</Text>
    </View>
  ),
};

export function Toaster() {
  return <Toast config={toastConfig} position="top" topOffset={50} visibilityTime={3500} />;
}
