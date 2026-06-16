import { z } from "zod";

/**
 * Server-side env (only BACKEND_BASE_URL is needed — the rest is same-origin proxy).
 * Kept minimal; expand if more env vars are introduced.
 */
const envSchema = z.object({
  BACKEND_BASE_URL: z.string().url().default("http://localhost:3000"),
});

export const env = envSchema.parse({
  BACKEND_BASE_URL: process.env.BACKEND_BASE_URL,
});
