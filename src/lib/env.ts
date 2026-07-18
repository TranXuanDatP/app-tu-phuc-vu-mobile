/**
 * Mobile env. Expo exposes public vars via the `EXPO_PUBLIC_*` prefix (compile-time).
 * Web FE used `BACKEND_BASE_URL` (server-only, via next.config rewrites) — on mobile
 * there is no same-origin proxy, so this is the absolute backend root called cross-origin.
 */
export const env = {
  /** Backend root, e.g. http://localhost:3000. BFF data paths hang off here (`/customers/profile`). */
  apiUrl: process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000",
  /** better-auth base: `${apiUrl}/api/auth`. */
  authUrl: (process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000") + "/api/auth",
} as const;
