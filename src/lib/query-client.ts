import { QueryClient } from "@tanstack/react-query";
import { ApiError } from "@/lib/types/api";

/** Shared QueryClient config — created once, used by the root Providers. */
export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 min — backend already caches
        retry: (failureCount, error) => {
          // Don't retry auth errors or client errors (other than 408/429).
          if (error instanceof ApiError) {
            if (error.statusCode === 401 || error.statusCode === 403) return false;
            if (error.statusCode >= 400 && error.statusCode < 500) return false;
          }
          return failureCount < 2;
        },
      },
      mutations: { retry: false },
    },
  });
}

let queryClient: QueryClient | undefined;

/** App singleton. (No SSR on RN — simpler than the web getQueryClient.) */
export function getQueryClient() {
  if (!queryClient) queryClient = makeQueryClient();
  return queryClient;
}
