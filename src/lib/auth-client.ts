import { createAuthClient } from "better-auth/react";
import { phoneNumberClient } from "better-auth/client/plugins";
import { expoClient, storageAdapter } from "@better-auth/expo/client";
import * as SecureStore from "expo-secure-store";
import { env } from "@/lib/env";
import { setAuthCookieGetter } from "@/lib/auth-token";

/**
 * better-auth client for Expo/React Native.
 *
 * Web FE used `better-auth/react` with `credentials: "include"` (HttpOnly cookie,
 * same-origin). RN has no cookie jar and calls cross-origin, so we use the
 * `@better-auth/expo` `expoClient` plugin:
 *  - `storage`: SecureStore-backed (sync getItem/setItem), wrapped in `storageAdapter`
 *    which chunks values past SecureStore's ~2KB per-key limit.
 *  - the plugin exposes `authClient.getCookie()` (sync) → wired to apiClient via
 *    setAuthCookieGetter, so BFF data calls carry the session cookie as a header.
 *
 * Backend dependency (see plan): Fastify CORS + `BETTER_AUTH_TRUSTED_ORIGINS` must
 * allow this app, or auth calls are rejected cross-origin. No bearer plugin needed —
 * cookie transport via header works on RN.
 */
export const authClient = createAuthClient({
  baseURL: env.authUrl,
  plugins: [
    phoneNumberClient(),
    expoClient({
      scheme: "apptuphucvumobile",
      storagePrefix: "bac",
      storage: storageAdapter({
        getItem: (key) => SecureStore.getItem(key),
        setItem: (key, value) => SecureStore.setItem(key, value),
      }),
    }),
  ],
});

// Bridge apiClient → session cookie. expoClient adds getCookie() to the client.
type AuthClientWithCookie = typeof authClient & { getCookie?: () => string };
const clientWithCookie = authClient as AuthClientWithCookie;
setAuthCookieGetter(() => clientWithCookie.getCookie?.() ?? "");

export const { useSession, signIn, signOut } = authClient;
