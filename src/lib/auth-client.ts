"use client";

import { createAuthClient } from "better-auth/react";
import { phoneNumberClient } from "better-auth/client/plugins";

/**
 * better-auth React client.
 *
 * baseURL MUST be absolute (better-auth rejects relative URLs server-side
 * during prerender). It points same-origin to /api/auth, which next.config.ts
 * rewrites proxy to the backend — so the HttpOnly session cookie flows
 * automatically and no CORS config is needed on the backend.
 *
 * Mirrors the backend better-auth setup (better-auth ^1.6.14, phoneNumber plugin).
 */
const AUTH_BASE_URL =
  process.env.NEXT_PUBLIC_APP_ORIGIN?.replace(/\/$/, "") ??
  "http://localhost:3001";

export const authClient = createAuthClient({
  baseURL: `${AUTH_BASE_URL}/api/auth`,
  fetchOptions: {
    credentials: "include",
  },
  plugins: [phoneNumberClient()],
});

// Convenience re-exports for hooks/components.
export const {
  useSession,
  signIn,
  signOut,
} = authClient;
