"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { QualityAtLocation, QualityAlertsResponse } from "@/lib/types/entities";

export const waterQualityKeys = {
  all: ["water-quality"] as const,
  location: (l: string) => ["water-quality", "location", l] as const,
  alerts: () => ["water-quality", "alerts"] as const,
};

export function useQualityAtLocation(location: string) {
  return useQuery({
    queryKey: waterQualityKeys.location(location),
    queryFn: () =>
      apiClient.get<QualityAtLocation>("/water-quality/location", { location }),
    enabled: Boolean(location),
  });
}

export function useQualityAlerts() {
  return useQuery({
    queryKey: waterQualityKeys.alerts(),
    queryFn: () => apiClient.get<QualityAlertsResponse>("/water-quality/alerts"),
  });
}
