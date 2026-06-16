"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { DebtHistory, OutstandingDebt, PaymentHistoryResponse } from "@/lib/types/entities";

export const paymentKeys = {
  all: ["payments"] as const,
  history: (params: { page?: number; limit?: number; status?: string }) =>
    ["payments", "history", params] as const,
  debt: () => ["payments", "debt"] as const,
  debtHistory: () => ["payments", "debt", "history"] as const,
};

export interface PaymentHistoryParams {
  page?: number;
  limit?: number;
  status?: "completed" | "pending" | "failed";
}

export function usePaymentHistory(params: PaymentHistoryParams = {}) {
  return useQuery({
    queryKey: paymentKeys.history(params),
    queryFn: () => apiClient.get<PaymentHistoryResponse>("/payments/history", params),
  });
}

export function useOutstandingDebt() {
  return useQuery({
    queryKey: paymentKeys.debt(),
    queryFn: () => apiClient.get<OutstandingDebt>("/payments/debt"),
  });
}

export function useDebtHistory() {
  return useQuery({
    queryKey: paymentKeys.debtHistory(),
    queryFn: () => apiClient.get<DebtHistory>("/payments/debt/history"),
  });
}
