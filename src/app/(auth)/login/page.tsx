"use client";

import { useEffect, useState } from "react";
import { Droplets } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePhoneLogin } from "@/features/auth/hooks";
import { useSession } from "@/lib/auth-client";

// Vietnamese phone: 0 or +84 prefix + 9–10 digits.
const PHONE_RE = /^(0|\+84)\d{9,10}$/;

export default function LoginPage() {
  const { data: session, isPending } = useSession();
  const login = usePhoneLogin();
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [otp, setOtp] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(0);

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

  function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    if (!PHONE_RE.test(phone.trim())) {
      setPhoneError("Số điện thoại không hợp lệ (vd: 0987654321)");
      return;
    }
    setPhoneError(null);
    login.sendOtp(phone.trim());
  }

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
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Số điện thoại</Label>
                <Input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel"
                  placeholder="0987654321"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    if (phoneError) setPhoneError(null);
                  }}
                />
                {phoneError && (
                  <p className="text-sm text-destructive">{phoneError}</p>
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
                <Label htmlFor="otp">Mã OTP (6 chữ số)</Label>
                <Input
                  id="otp"
                  name="otp"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  placeholder="••••••"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  className="text-center text-2xl tracking-[0.5em]"
                />
                {otp.length > 0 && otp.length < 6 && (
                  <p className="text-sm text-muted-foreground">
                    Còn thiếu {6 - otp.length} chữ số.
                  </p>
                )}
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
                  onClick={() => login.sendOtp(login.phoneNumber)}
                >
                  {secondsLeft > 0 ? `Gửi lại sau ${secondsLeft}s` : "Gửi lại OTP"}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
