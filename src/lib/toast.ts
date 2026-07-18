import Toast from "react-native-toast-message";

/**
 * RN toast wrapper exposing a sonner-like API (toast.success/error/info) so feature
 * code ports from the web FE with minimal change. Styled by the <Toaster> config
 * mounted once in the root layout (src/components/toaster.tsx).
 */
export const toast = {
  success: (msg: string) => Toast.show({ type: "success", text1: "Thành công", text2: msg }),
  error: (msg: string) => Toast.show({ type: "error", text1: "Lỗi", text2: msg }),
  info: (msg: string) => Toast.show({ type: "info", text1: "Thông báo", text2: msg }),
};
