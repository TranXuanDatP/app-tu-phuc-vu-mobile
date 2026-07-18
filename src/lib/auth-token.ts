/**
 * Session-cookie bridge: better-auth expoClient → apiClient.
 *
 * RN has no cookie jar. The better-auth `expoClient` plugin persists the
 * `Set-Cookie` from auth responses in expo-secure-store and exposes a sync
 * `authClient.getCookie()` returning the full "name=value" cookie string.
 * apiClient reads it here and attaches a `Cookie` header to BFF data calls —
 * RN fetch sets headers freely (no browser CORS cookie restrictions), and the
 * backend reads the session cookie from the header, so no bearer plugin is needed.
 *
 * The getter is wired in src/lib/auth-client.ts once the auth client is created.
 */
let cookieGetter: () => string = () => "";

export function setAuthCookieGetter(fn: () => string): void {
  cookieGetter = fn;
}

export function getAuthCookie(): string {
  return cookieGetter();
}
