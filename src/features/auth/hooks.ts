import { useCallback, useState } from "react";
import { useRouter } from "expo-router";
import { toast } from "@/lib/toast";
import { authClient } from "@/lib/auth-client";
import { linkedKh } from "@/lib/linked-kh";

export interface PhoneLoginState {
  step: "phone" | "otp";
  phoneNumber: string;
  isSending: boolean;
  isVerifying: boolean;
}

/**
 * Two-step phone/OTP login backed by better-auth's phoneNumber plugin
 * (matches backend otpLength:6, expiresIn:300s).
 *
 * Difference from web: on verify success the hook does NOT navigate — it returns
 * true. The login screen's session effect then runs the phone→link-customer
 * auto-match and routes to /(app)/dashboard or /(auth)/link-kh. (Web had two
 * competing redirects; consolidated here.)
 */
export function usePhoneLogin() {
  const [state, setState] = useState<PhoneLoginState>({
    step: "phone",
    phoneNumber: "",
    isSending: false,
    isVerifying: false,
  });

  const sendOtp = useCallback(async (phoneNumber: string) => {
    setState((s) => ({ ...s, isSending: true }));
    try {
      const { error } = await authClient.phoneNumber.sendOtp({ phoneNumber });
      if (error) throw error;
      setState((s) => ({ ...s, step: "otp", phoneNumber, isSending: false }));
      toast.success("Đã gửi mã OTP đến số điện thoại của bạn.");
    } catch (err) {
      setState((s) => ({ ...s, isSending: false }));
      toast.error((err as { message?: string })?.message ?? "Không gửi được OTP. Vui lòng thử lại.");
    }
  }, []);

  const verifyOtp = useCallback(async (code: string): Promise<boolean> => {
    setState((s) => ({ ...s, isVerifying: true }));
    try {
      const { error } = await authClient.phoneNumber.verify({
        phoneNumber: state.phoneNumber,
        code,
      });
      if (error) throw error;
      setState((s) => ({ ...s, isVerifying: false }));
      toast.success("Đăng nhập thành công.");
      return true; // session established — screen effect handles routing
    } catch (err) {
      setState((s) => ({ ...s, isVerifying: false }));
      toast.error((err as { message?: string })?.message ?? "Mã OTP không đúng hoặc đã hết hạn.");
      return false;
    }
  }, [state.phoneNumber]);

  const reset = useCallback(() => {
    setState({ step: "phone", phoneNumber: "", isSending: false, isVerifying: false });
  }, []);

  return { ...state, sendOtp, verifyOtp, reset };
}

export function useSignOut() {
  const router = useRouter();
  return useCallback(async () => {
    await authClient.signOut({});
    await linkedKh.remove();
    router.replace("/login");
  }, [router]);
}
