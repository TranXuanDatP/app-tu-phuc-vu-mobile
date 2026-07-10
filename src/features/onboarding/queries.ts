"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";
import { getErrorMessage } from "@/lib/types/api";

export const onboardingKeys = {
  all: ["onboarding"] as const,
  status: (id: string) => ["onboarding", id] as const,
};

export function useOnboardingStatus(requestId: string) {
  return useQuery({
    queryKey: onboardingKeys.status(requestId),
    queryFn: () => apiClient.get(`/onboarding/${requestId}`),
    enabled: Boolean(requestId),
  });
}

export function useCreateOnboarding() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { address: string; customerType: string; fullName: string; phone: string }) =>
      apiClient.post<{ requestId: string; status: string }>("/onboarding", input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: onboardingKeys.all });
      toast.success("Đã tạo yêu cầu đăng ký");
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}
