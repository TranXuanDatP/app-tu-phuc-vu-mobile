"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type {
  CalibrationStatus,
  ComparisonResponse,
  MeterHistoryResponse,
  MeterListResponse,
  ReadingDetail,
  ReadingsListResponse,
} from "@/lib/types/entities";

export const meterKeys = {
  all: ["meters"] as const,
  list: () => ["meters", "list"] as const,
  consumption: () => ["meters", "consumption"] as const,
  comparison: (current: string, previous: string) =>
    ["meters", "comparison", current, previous] as const,
  reading: (period: string) => ["meters", "reading", period] as const,
  calibration: (meterId: string) => ["meters", "calibration", meterId] as const,
  history: (meterId: string) => ["meters", "history", meterId] as const,
};

export function useMeters() {
  return useQuery({
    queryKey: meterKeys.list(),
    queryFn: () => apiClient.get<MeterListResponse>("/meters"),
  });
}

export function useConsumption() {
  return useQuery({
    queryKey: meterKeys.consumption(),
    queryFn: () => apiClient.get<ReadingsListResponse>("/meters/consumption"),
  });
}

export function useConsumptionComparison(
  current?: string,
  previous?: string,
) {
  return useQuery({
    queryKey: meterKeys.comparison(current ?? "", previous ?? ""),
    queryFn: () =>
      apiClient.get<ComparisonResponse>("/meters/consumption/comparison", {
        current,
        previous,
      }),
    enabled: Boolean(current && previous),
  });
}

export function useReadingDetail(period: string) {
  return useQuery({
    queryKey: meterKeys.reading(period),
    queryFn: () =>
      apiClient.get<ReadingDetail>(`/meters/consumption/${period}`),
    enabled: Boolean(period),
  });
}

export function useCalibration(meterId: string) {
  return useQuery({
    queryKey: meterKeys.calibration(meterId),
    queryFn: () =>
      apiClient.get<CalibrationStatus>(`/meters/${meterId}/calibration`),
    enabled: Boolean(meterId),
  });
}

export function useMeterHistory(meterId: string) {
  return useQuery({
    queryKey: meterKeys.history(meterId),
    queryFn: () => apiClient.get<MeterHistoryResponse>(`/meters/${meterId}/history`),
    enabled: Boolean(meterId),
  });
}
