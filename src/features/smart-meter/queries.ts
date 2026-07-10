"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { RealtimeConsumption, SmartMeterStatus } from "@/lib/types/entities";

export const smartMeterKeys = {
  all: ["smart-meter"] as const,
  realtime: () => ["smart-meter", "realtime"] as const,
  status: (meterId: string) => ["smart-meter", "status", meterId] as const,
};

export function useRealtimeConsumption() {
  return useQuery({
    queryKey: smartMeterKeys.realtime(),
    queryFn: () => apiClient.get<RealtimeConsumption>("/smart-meter/consumption"),
  });
}

export function useMeterStatus(meterId: string) {
  return useQuery({
    queryKey: smartMeterKeys.status(meterId),
    queryFn: () =>
      apiClient.get<SmartMeterStatus>(`/smart-meter/${meterId}/status`),
    enabled: Boolean(meterId),
  });
}
