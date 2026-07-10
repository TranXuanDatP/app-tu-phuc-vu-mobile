"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { CoverageResult, NearbyIncidentsResponse } from "@/lib/types/entities";

export const gisKeys = {
  all: ["gis"] as const,
  coverage: (addr: string) => ["gis", "coverage", addr] as const,
  nearby: (lat: number, lng: number) => ["gis", "nearby", lat, lng] as const,
};

export function useCoverage(address: string) {
  return useQuery({
    queryKey: gisKeys.coverage(address),
    queryFn: () => apiClient.get<CoverageResult>("/gis/coverage", { address }),
    enabled: Boolean(address),
  });
}

export function useNearbyIncidents(lat: number, lng: number) {
  return useQuery({
    queryKey: gisKeys.nearby(lat, lng),
    queryFn: () =>
      apiClient.get<NearbyIncidentsResponse>("/gis/nearby", { lat, lng, radius: 2000 }),
    enabled: Boolean(lat) && Boolean(lng),
  });
}
