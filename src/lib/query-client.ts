import { QueryClient } from "@tanstack/react-query";
import { ApiError } from "@/lib/types/api";

/** Shared QueryClient config — created once, used by the Providers + prefetch. */
export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 min — backend already caches (static 12h / dynamic 15m)
        retry: (failureCount, error) => {
          // Don't retry auth errors or client errors (other than 408/429)
          if (error instanceof ApiError) {
            if (error.statusCode === 401 || error.statusCode === 403) return false;
            if (error.statusCode >= 400 && error.statusCode < 500) return false;
          }
          return failureCount < 2;
        },
        refetchOnWindowFocus: false,
      },
      mutations: { retry: false },
    },
  });
}

let browserQueryClient: QueryClient | undefined;
/** Browser singleton; server always gets a fresh instance (per-request). */
export function getQueryClient() {
  if (typeof window === "undefined") return makeQueryClient();
  if (!browserQueryClient) browserQueryClient = makeQueryClient();
  return browserQueryClient;
}
