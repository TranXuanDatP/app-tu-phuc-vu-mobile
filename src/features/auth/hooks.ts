"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";

export interface PhoneLoginState {
  step: "phone" | "otp";
  phoneNumber: string;
  isSending: boolean;
  isVerifying: boolean;
}

/**
 * Two-step phone/OTP login backed by better-auth's phoneNumber plugin
 * (matches backend otpLength:6, expiresIn:300s).
 */
export function usePhoneLogin() {
  const router = useRouter();
  const [state, setState] = useState<PhoneLoginState>({
    step: "phone",
    phoneNumber: "",
    isSending: false,
    isVerifying: false,
  });

  const sendOtp = useCallback(async (phoneNumber: string) => {
    setState((s) => ({ ...s, isSending: true }));
    try {
      // better-auth phoneNumber plugin: send OTP to the phone number.
      const { error } = await authClient.phoneNumber.sendOtp({ phoneNumber });
      if (error) throw error;
      setState((s) => ({ ...s, step: "otp", phoneNumber, isSending: false }));
      toast.success("Đã gửi mã OTP đến số điện thoại của bạn.");
    } catch (err) {
      setState((s) => ({ ...s, isSending: false }));
      const message =
        (err as { message?: string })?.message ?? "Không gửi được OTP. Vui lòng thử lại.";
      toast.error(message);
    }
  }, []);

  const verifyOtp = useCallback(
    async (code: string) => {
      setState((s) => ({ ...s, isVerifying: true }));
      try {
        const { error } = await authClient.phoneNumber.verify({
          phoneNumber: state.phoneNumber,
          code,
        });
        if (error) throw error;
        toast.success("Đăng nhập thành công.");
        router.replace("/dashboard");
      } catch (err) {
        setState((s) => ({ ...s, isVerifying: false }));
        const message =
          (err as { message?: string })?.message ?? "Mã OTP không đúng hoặc đã hết hạn.";
        toast.error(message);
      }
    },
    [state.phoneNumber, router],
  );

  const reset = useCallback(() => {
    setState({ step: "phone", phoneNumber: "", isSending: false, isVerifying: false });
  }, []);

  return { ...state, sendOtp, verifyOtp, reset };
}

export function useSignOut() {
  const router = useRouter();
  return useCallback(async () => {
    await authClient.signOut({ fetchOptions: { onSuccess: () => router.replace("/login") } });
  }, [router]);
}
