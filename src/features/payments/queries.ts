import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/lib/toast";
import { apiClient } from "@/lib/api-client";
import { getErrorMessage } from "@/lib/types/api";
import type {
  CreatePaymentResponse,
  DebtHistory,
  OutstandingDebt,
  PaymentHistoryResponse,
  PaymentMethod,
} from "@/lib/types/entities";

export const paymentKeys = {
  all: ["payments"] as const,
  history: (params: PaymentHistoryParams) => ["payments", "history", params] as const,
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

/** Create a payment (QR/link) for an invoice. Invalidates payment + invoice caches. */
export function useCreatePayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { invoiceId: string; method: PaymentMethod }) =>
      apiClient.post<CreatePaymentResponse>("/payments", input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: paymentKeys.all });
      qc.invalidateQueries({ queryKey: ["invoices"] });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}
