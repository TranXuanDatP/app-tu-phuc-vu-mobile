"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";
import { getErrorMessage } from "@/lib/types/api";
import type {
  CreateBatchPaymentResponse,
  CreatePaymentResponse,
  PaymentMethod,
  SetupAutoDebitResponse,
  BankAccount,
} from "@/lib/types/entities";
import { invoiceKeys } from "@/features/invoices/queries";
import { paymentKeys } from "./queries";

export function useCreatePayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { invoiceId: string; method: PaymentMethod }) =>
      apiClient.post<CreatePaymentResponse>("/payments", input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: invoiceKeys.all });
      qc.invalidateQueries({ queryKey: paymentKeys.all });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}

export function useBatchPayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { invoiceIds: string[]; method: PaymentMethod }) =>
      apiClient.post<CreateBatchPaymentResponse>("/payments/batch", input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: invoiceKeys.all });
      qc.invalidateQueries({ queryKey: paymentKeys.all });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}

export function useSetupAutoDebit() {
  return useMutation({
    mutationFn: (bankAccount: BankAccount) =>
      apiClient.post<SetupAutoDebitResponse>("/payments/auto-debit", { bankAccount }),
    onSuccess: () => toast.success("Đã gửi đăng ký trích tự động. Vui lòng xác minh."),
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}
