import type { NextConfig } from "next";

/**
 * Proxy to the NestJS backend (Fastify, no global prefix → routes at root).
 *
 * Same-origin from the browser → HttpOnly session cookie flows automatically, no CORS.
 *
 * ⚠️ WHY A DEDICATED `/api/bff` PREFIX?
 * The backend exposes routes at root (`/meters`, `/contracts`, `/tickets`, ...).
 * Next.js App Router pages live at the SAME paths (`/meters`, `/contracts`, ...),
 * and dynamic pages like `/meters/[meterId]` even swallow sub-paths
 * (e.g. `/meters/consumption` matches with meterId="consumption").
 * Page routes take precedence over rewrites, so a bare-path API call would fetch
 * the React page HTML instead of the API JSON. Routing ALL data calls through
 * `/api/bff/*` — which has no page routes — guarantees rewrites always fire.
 * The browser calls `/api/bff/meters`; we strip the prefix and proxy to backend `/meters`.
 *
 * better-auth keeps its own `/api/auth/*` mount (separate rewrite, untouched).
 */
const BACKEND_BASE_URL = process.env.BACKEND_BASE_URL ?? "http://localhost:3000";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      // BFF data API — strip `/api/bff`, proxy the rest to backend root.
      { source: "/api/bff/:path*", destination: `${BACKEND_BASE_URL}/:path*` },
      // better-auth (phone/OTP, session, sign-out) — mounted at /api/auth on backend.
      { source: "/api/auth/:path*", destination: `${BACKEND_BASE_URL}/api/auth/:path*` },
    ];
  },
};

export default nextConfig;
