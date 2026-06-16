"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Droplets } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { usePhoneLogin } from "@/features/auth/hooks";
import { useSession } from "@/lib/auth-client";

// Vietnamese phone number: optional +84/0 prefix + 9-10 digits.
const phoneSchema = z.object({
  phoneNumber: z
    .string()
    .min(1, "Vui lòng nhập số điện thoại")
    .regex(/^(0|\+84)(\d{9,10})$/, "Số điện thoại không hợp lệ (vd: 0987654321)"),
});

type PhoneForm = z.infer<typeof phoneSchema>;

export default function LoginPage() {
  const { data: session, isPending } = useSession();
  const login = usePhoneLogin();
  const [otp, setOtp] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(0);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<PhoneForm>({
    resolver: zodResolver(phoneSchema),
    defaultValues: { phoneNumber: "" },
  });

  // Already logged in → go to dashboard.
  useEffect(() => {
    if (session) window.location.replace("/dashboard");
  }, [session]);

  // Resend-OTP countdown (OTP expires in 300s per backend config).
  useEffect(() => {
    if (login.step !== "otp") return;
    setSecondsLeft(300);
    const id = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(id);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [login.step]);

  if (isPending) return null;

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Droplets className="h-6 w-6" />
          </div>
          <CardTitle className="text-2xl">Cổng Khách hàng IOC</CardTitle>
          <CardDescription>
            {login.step === "phone"
              ? "Đăng nhập bằng số điện thoại để tiếp tục"
              : `Nhập mã OTP gửi đến ${login.phoneNumber}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {login.step === "phone" ? (
            <form
              onSubmit={handleSubmit(({ phoneNumber }) => login.sendOtp(phoneNumber))}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Số điện thoại</Label>
                <Input
                  id="phoneNumber"
                  type="tel"
                  inputMode="numeric"
                  placeholder="0987654321"
                  {...register("phoneNumber")}
                />
                {errors.phoneNumber && (
                  <p className="text-sm text-destructive">{errors.phoneNumber.message}</p>
                )}
              </div>
              <Button type="submit" className="w-full" disabled={login.isSending}>
                {login.isSending ? "Đang gửi OTP..." : "Gửi mã OTP"}
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                Mã OTP sẽ được ghi trong log server ở môi trường phát triển.
              </p>
            </form>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (otp.length === 6) login.verifyOtp(otp);
              }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label>Mã OTP (6 chữ số)</Label>
                <div className="flex justify-center">
                  <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={login.isVerifying || otp.length !== 6}>
                {login.isVerifying ? "Đang xác thực..." : "Xác thực"}
              </Button>
              <div className="flex items-center justify-between text-sm">
                <Button
                  type="button"
                  variant="link"
                  className="h-auto p-0"
                  onClick={() => login.reset()}
                >
                  Đổi số điện thoại
                </Button>
                <Button
                  type="button"
                  variant="link"
                  className="h-auto p-0"
                  disabled={secondsLeft > 0}
                  onClick={() => login.sendOtp(getValues("phoneNumber"))}
                >
                  {secondsLeft > 0
                    ? `Gửi lại sau ${secondsLeft}s`
                    : "Gửi lại OTP"}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
