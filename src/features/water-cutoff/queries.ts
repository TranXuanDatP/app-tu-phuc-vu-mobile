"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { CutoffSchedule, CutoffStatus } from "@/lib/types/entities";

export const cutoffKeys = {
  all: ["water-cutoff"] as const,
  status: () => ["water-cutoff", "status"] as const,
  schedule: (areaId: string) => ["water-cutoff", "schedule", areaId] as const,
};

export function useCutoffStatus() {
  return useQuery({
    queryKey: cutoffKeys.status(),
    queryFn: () => apiClient.get<CutoffStatus>("/water-cutoff/status"),
  });
}

export function useCutoffSchedule(areaId: string) {
  return useQuery({
    queryKey: cutoffKeys.schedule(areaId),
    queryFn: () =>
      apiClient.get<CutoffSchedule>(`/water-cutoff/schedule/${areaId}`),
    enabled: Boolean(areaId),
  });
}
