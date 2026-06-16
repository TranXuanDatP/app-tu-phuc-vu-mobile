"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type {
  ApplicableFeesResponse,
  TariffBreakdown,
  TariffPlan,
} from "@/lib/types/entities";

export const billingKeys = {
  all: ["billing"] as const,
  tariffPlan: (contractId: string) => ["billing", "tariff", contractId] as const,
  tariffBreakdown: (contractId: string, invoiceId: string) =>
    ["billing", "tariff", "breakdown", contractId, invoiceId] as const,
  fees: (contractId: string) => ["billing", "fees", contractId] as const,
};

export function useTariffPlan(contractId: string) {
  return useQuery({
    queryKey: billingKeys.tariffPlan(contractId),
    queryFn: () => apiClient.get<TariffPlan>(`/billing/tariff/${contractId}`),
    enabled: Boolean(contractId),
  });
}

export function useTariffBreakdown(contractId: string, invoiceId: string) {
  return useQuery({
    queryKey: billingKeys.tariffBreakdown(contractId, invoiceId),
    queryFn: () =>
      apiClient.get<TariffBreakdown>(`/billing/tariff/${contractId}/breakdown`, {
        invoiceId,
      }),
    enabled: Boolean(contractId && invoiceId),
  });
}

export function useApplicableFees(contractId: string) {
  return useQuery({
    queryKey: billingKeys.fees(contractId),
    queryFn: () =>
      apiClient.get<ApplicableFeesResponse>(`/billing/tariff/${contractId}/fees`),
    enabled: Boolean(contractId),
  });
}
