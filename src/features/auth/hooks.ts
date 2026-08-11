import { useCallback, useRef, useState } from "react";
import { useRouter } from "expo-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/lib/toast";
import { authClient, useSession } from "@/lib/auth-client";
import { apiClient } from "@/lib/api-client";
import { linkedKh } from "@/lib/linked-kh";
import { useAppActive } from "@/lib/use-app-active";
import type {
  AuthMeResponse,
  RegisterPayload,
  ResolveResult,
  BindPayload,
  BindResponse,
} from "@/lib/types/entities";

/** Shared query key for the current user's identity profile (GET /auth/me). */
export const AUTH_ME_KEY = ["auth", "me"] as const;

// Poll cadence: every 1.5s while the profile is non-terminal, for at most ~10s.
// Built for the async RabbitMQ identity path; in the current manual-only BFF
// the status never flips on its own, so the poll simply times out and stops —
// the dashboard banner + gate then surface manual entry.
const POLL_INTERVAL_MS = 1500;
const POLL_DURATION_MS = 10_000;

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
 * true. The login screen's session effect then routes to the dashboard, which
 * owns identity UX (banner + poll); the ProfileGate enforces limited mode.
 * (Web had two competing redirects; consolidated here.)
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

/**
 * Current user's identity profile (GET /auth/me) — the SINGLE source of truth
 * for `profile_status`. Both the limited-mode gate (poll=false, consumer) and
 * the dashboard banner (poll=true, producer) read this key, so a status flip
 * from the dashboard's poll instantly re-renders the gate.
 *
 * Polling (opts.poll=true, dashboard only):
 *  - runs only while status is non-terminal (`incomplete`; future `processing`);
 *  - stops on terminal (`complete` / `no_match`);
 *  - bounded to POLL_DURATION_MS from first mount (no infinite polling);
 *  - paused when the app is backgrounded (RN keeps setInterval alive — see
 *    use-app-active.ts).
 *
 * Enabled only when a session exists (the endpoint requires auth → 401 otherwise).
 */
export function useProfileStatus(opts?: { poll?: boolean; pollDurationMs?: number }) {
  const { data: session } = useSession();
  const appActive = useAppActive();
  const pollDurationMs = opts?.pollDurationMs ?? POLL_DURATION_MS;

  // Lazy-init the poll window start (Date.now is fine in app runtime; the
  // restriction only applies to Workflow scripts). Resets when the dashboard
  // unmounts/remounts — acceptable: the window is "from when the user lands".
  const startedAtRef = useRef<number | null>(null);
  if (opts?.poll && startedAtRef.current === null) {
    startedAtRef.current = Date.now();
  }

  return useQuery<AuthMeResponse>({
    queryKey: AUTH_ME_KEY,
    queryFn: () => apiClient.get<AuthMeResponse>("/auth/me"),
    enabled: !!session,
    refetchInterval: opts?.poll
      ? (query) => {
          if (!appActive) return false;
          const me = query.state.data as AuthMeResponse | undefined;
          // Terminal once the user has a verified binding (gate opens), or once identity
          // resolution is a dead-end (no_match → needs manual register; polling won't help).
          if (me?.linked || me?.profileStatus === "no_match") return false;
          if (startedAtRef.current !== null && Date.now() - startedAtRef.current > pollDurationMs) {
            return false; // bounded — stop wasting requests
          }
          return POLL_INTERVAL_MS;
        }
      : false,
    refetchIntervalInBackground: false,
  });
}

/**
 * POST /auth/register — the NEW-CUSTOMER branch of the unified bind flow (resolve-gated).
 * The BFF creates a Customer 360 record + inserts a VERIFIED binding (creation = proof),
 * returning {bound, customerId} (no `linked` field). On success we invalidate /auth/me so
 * the next read flips `linked` true from the freshly-written binding row → gate opens.
 *
 * Two 409 reject points (BE) both throw code CUSTOMER_EXISTS_USE_BIND — the screen reroutes
 * to /bind (the challenge branch) instead of treating it as a generic error.
 */
export function useRegister() {
  const queryClient = useQueryClient();

  return useMutation<BindResponse, Error, RegisterPayload>({
    mutationFn: (payload) => apiClient.post<BindResponse>("/auth/register", payload),
    onSuccess: (data) => {
      if (data.bound) {
        queryClient.invalidateQueries({ queryKey: AUTH_ME_KEY });
      }
    },
  });
}

export function useSignOut() {
  const router = useRouter();
  const queryClient = useQueryClient();
  return useCallback(async () => {
    await authClient.signOut({});
    await linkedKh.remove();
    // Session changed → the cached profile status belongs to the previous user.
    queryClient.removeQueries({ queryKey: AUTH_ME_KEY });
    router.replace("/login");
  }, [router, queryClient]);
}

/**
 * POST /auth/bind-init — resolve the OTP-verified session phone server-side (the mobile
 * never sends phone). Returns candidates the UI branches on:
 *  one → challenge; many (≤3) → pick then challenge; many+capped → hotline; none → register.
 */
export function useBindInit() {
  return useMutation<ResolveResult, Error, void>({
    mutationFn: () => apiClient.post<ResolveResult>("/auth/bind-init"),
  });
}

/**
 * POST /auth/bind — verify a bill-secret against a session-scoped customerRef (the ref
 * comes from bind-init, never user-typed). On success, invalidate the auth/me cache so
 * the next read flips `linked` true → gate opens. Lockout (429 BINDING_LOCKED) surfaces
 * as an ApiError the screen reads `.details.{reason, retryAfterSec}` from.
 */
export function useBind() {
  const queryClient = useQueryClient();
  return useMutation<BindResponse, Error, BindPayload>({
    mutationFn: (payload) => apiClient.post<BindResponse>("/auth/bind", payload),
    onSuccess: (data) => {
      if (data.bound) {
        queryClient.invalidateQueries({ queryKey: AUTH_ME_KEY });
      }
    },
  });
}
