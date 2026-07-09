"use client";

import { useEffect, useState } from "react";
import { Droplet, ShieldCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { usePhoneLogin } from "@/features/auth/hooks";
import { useSession } from "@/lib/auth-client";

// Local VN mobile digits WITHOUT the leading 0 — the +84 prefix is fixed in the UI.
const LOCAL_PHONE_RE = /^\d{9,10}$/;

export default function LoginPage() {
  const { data: session, isPending } = useSession();
  const login = usePhoneLogin();
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [otp, setOtp] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(0);

  useEffect(() => {
    if (session) window.location.replace("/dashboard");
  }, [session]);

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
    const local = phone.trim().replace(/\D/g, "").replace(/^0+/, "");
    if (!LOCAL_PHONE_RE.test(local)) {
      setPhoneError("Nhập 9–10 chữ số, bỏ số 0 ở đầu (vd: 912 345 678)");
      return;
    }
    setPhoneError(null);
    login.sendOtp(`+84${local}`);
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-background">
      {/* Aqua hero */}
      <div className="relative overflow-hidden bg-gradient-to-b from-deep to-aqua px-6 pb-9 pt-16 text-center text-white">
        <div className="mx-auto mb-4 flex h-[70px] w-[70px] items-center justify-center rounded-[22px] bg-white/20">
          <Droplet className="h-8 w-8" />
        </div>
        <h1 className="text-2xl font-extrabold">My QUAWACO</h1>
        <p className="mt-1.5 text-[13.5px] opacity-90">
          Nước sạch trong tầm tay — mọi lúc, mọi nơi
        </p>
      </div>

      <div className="flex-1 px-5 py-6">
        {login.step === "phone" ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[12.5px] font-semibold text-muted-foreground">
                Số điện thoại
              </label>
              <div className="flex items-center gap-2.5 rounded-[13px] border-[1.5px] border-line bg-card px-3.5 py-3 focus-within:border-aqua">
                <span className="font-bold text-muted-foreground">+84</span>
                <Input
                  name="phoneNumber"
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel"
                  placeholder="912 345 678"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value.replace(/\D/g, "").replace(/^0+/, ""));
                    if (phoneError) setPhoneError(null);
                  }}
                  className="h-auto border-0 bg-transparent p-0 text-base shadow-none focus-visible:ring-0"
                />
              </div>
              {phoneError && <p className="text-sm text-destructive">{phoneError}</p>}
            </div>
            <button
              type="submit"
              disabled={login.isSending}
              className="block w-full rounded-[14px] bg-deep py-[15px] text-[15.5px] font-extrabold text-white active:scale-[0.99] disabled:opacity-60"
            >
              {login.isSending ? "Đang gửi..." : "Gửi mã OTP"}
            </button>
            <p className="text-center text-xs leading-relaxed text-muted-foreground">
              Bằng việc tiếp tục, bạn đồng ý với Điều khoản & Chính sách bảo mật.
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
            <div className="space-y-1.5">
              <label className="text-[12.5px] font-semibold text-muted-foreground">
                Mã OTP gửi đến {login.phoneNumber}
              </label>
              <Input
                name="otp"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                placeholder="• • • • • •"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                className="h-14 rounded-[13px] border-[1.5px] border-line text-center text-2xl font-extrabold tracking-[0.5em] text-deep focus-visible:border-aqua"
              />
            </div>
            <button
              type="submit"
              disabled={login.isVerifying || otp.length !== 6}
              className="block w-full rounded-[14px] bg-deep py-[15px] text-[15.5px] font-extrabold text-white active:scale-[0.99] disabled:opacity-60"
            >
              {login.isVerifying ? "Đang xác thực..." : "Xác thực"}
            </button>
            <div className="flex items-center justify-between text-sm">
              <button
                type="button"
                className="font-semibold text-aqua"
                onClick={() => login.reset()}
              >
                Đổi số
              </button>
              <button
                type="button"
                disabled={secondsLeft > 0}
                onClick={() => login.sendOtp(login.phoneNumber)}
                className="font-semibold text-aqua disabled:opacity-50"
              >
                {secondsLeft > 0 ? `Gửi lại sau ${secondsLeft}s` : "Gửi lại OTP"}
              </button>
            </div>
            <p className="text-center text-xs text-muted-foreground">
              Mã có hiệu lực 5 phút. Môi trường dev: OTP in trong log BFF.
            </p>
          </form>
        )}

        <div className="mt-7 flex items-center justify-center gap-2 text-[11.5px] text-muted-foreground">
          <ShieldCheck className="h-4 w-4" />
          Xác thực bảo mật bởi better-auth
        </div>
      </div>
    </main>
  );
}
