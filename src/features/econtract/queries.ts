"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";
import { getErrorMessage } from "@/lib/types/api";
import type { EcontractResponse } from "@/lib/types/entities";

export const econtractKeys = {
  all: ["econtracts"] as const,
  detail: (id: string) => ["econtracts", id] as const,
};

export function useEcontract(dossierId: string) {
  return useQuery({
    queryKey: econtractKeys.detail(dossierId),
    queryFn: () => apiClient.get<EcontractResponse>(`/econtracts/${dossierId}`),
    enabled: Boolean(dossierId),
  });
}

export function useSignContract() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { dossierId: string; signatureRef: string }) =>
      apiClient.post(`/econtracts/${input.dossierId}/sign`, { signatureRef: input.signatureRef }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: econtractKeys.all });
      toast.success("Đã ký hợp đồng thành công");
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}
