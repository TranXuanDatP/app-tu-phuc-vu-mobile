"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type {
  ComparisonReport,
  ComparisonType,
  ConsumptionReport,
} from "@/lib/types/entities";

export const reportKeys = {
  all: ["reports"] as const,
  consumption: (period: string) => ["reports", "consumption", period] as const,
  comparison: (type: ComparisonType) => ["reports", "comparison", type] as const,
};

export function useConsumptionReport(period: string) {
  return useQuery({
    queryKey: reportKeys.consumption(period),
    queryFn: () =>
      apiClient.get<ConsumptionReport>("/reports/consumption", { period }),
    enabled: Boolean(period),
  });
}

export function useComparisonReport(type: ComparisonType) {
  return useQuery({
    queryKey: reportKeys.comparison(type),
    queryFn: () => apiClient.get<ComparisonReport>("/reports/comparison", { type }),
  });
}
