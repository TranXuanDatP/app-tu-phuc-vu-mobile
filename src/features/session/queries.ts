"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { SessionDetailResponse, SessionEventsResponse } from "@/lib/types/entities";

export const sessionKeys = {
  all: ["session"] as const,
  detail: () => ["session", "detail"] as const,
  events: (params: Record<string, unknown>) => ["session", "events", params] as const,
};

export function useSessionDetail() {
  return useQuery({
    queryKey: sessionKeys.detail(),
    queryFn: () => apiClient.get<SessionDetailResponse>("/sessions/me"),
  });
}

export function useSessionEvents(params: Record<string, unknown> = {}) {
  return useQuery({
    queryKey: sessionKeys.events(params),
    queryFn: () => apiClient.get<SessionEventsResponse>("/sessions/me/events", params),
  });
}
