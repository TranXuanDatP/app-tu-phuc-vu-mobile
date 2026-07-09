"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { Eligibility, SegmentsResponse } from "@/lib/types/entities";

export const segmentKeys = {
  all: ["segments"] as const,
  list: () => ["segments", "list"] as const,
  eligibility: (campaignId: string) =>
    ["segments", "eligibility", campaignId] as const,
};

export function useSegments() {
  return useQuery({
    queryKey: segmentKeys.list(),
    queryFn: () => apiClient.get<SegmentsResponse>("/segments"),
  });
}

export function useCheckEligibility(campaignId: string) {
  return useQuery({
    queryKey: segmentKeys.eligibility(campaignId),
    queryFn: () =>
      apiClient.get<Eligibility>(
        `/segments/eligibility/${encodeURIComponent(campaignId)}`,
      ),
    enabled: Boolean(campaignId),
  });
}
