import { getSessionCookie } from "better-auth/cookies";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Edge route protection (Next.js 16 "proxy" convention, formerly "middleware").
 *
 * Reads the better-auth session cookie WITHOUT a network call (fast path).
 * - Protected routes without a session → /login
 * - /login with a valid session → /dashboard
 *
 * Note: cookie presence ≠ validity. A tampered/expired cookie still reaches the
 * (app) layout, where data queries hit the BFF and 401 → redirect to /login.
 */
const protectedPaths = [
  "/dashboard",
  "/invoices",
  "/payments",
  "/profile",
  "/meters",
  "/contracts",
  "/tickets",
  "/notifications",
  "/sessions",
  "/reports",
  "/water-cutoff",
  "/smart-meter",
  "/segments",
  "/contact",
  "/chat",
  "/water-quality",
  "/meter-anomalies",
  "/leakage-alerts",
  "/campaigns",
  "/econtracts",
  "/onboarding",
  "/gis",
  "/call-center",
  "/site-surveys",
  "/field-team",
  "/chatbot",
];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = protectedPaths.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
  const isAuthPage = pathname === "/login" || pathname.startsWith("/login/");

  const hasSession = Boolean(getSessionCookie(request));

  if (isProtected && !hasSession) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  if (isAuthPage && hasSession) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  // Match navigable routes; skip Next internals, static assets, and the proxied BFF paths.
  matcher: [
    "/((?!_next|_vercel|api/auth|customers|billing|payments|health|.*\\..*).*)",
  ],
};
