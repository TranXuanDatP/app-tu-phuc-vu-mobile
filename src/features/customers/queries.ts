"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";
import { getErrorMessage } from "@/lib/types/api";
import type {
  CustomerProfile,
  RelatedAccountsResponse,
  TimelineResponse,
  UpdateProfileResponse,
} from "@/lib/types/entities";

export interface UpdateProfileInput {
  phone?: string;
  email?: string;
  contactAddress?: string;
}

export const customerKeys = {
  all: ["customer"] as const,
  profile: () => ["customer", "profile"] as const,
  timeline: () => ["customer", "timeline"] as const,
  related: () => ["customer", "related"] as const,
};

export function useCustomerProfile() {
  return useQuery({
    queryKey: customerKeys.profile(),
    queryFn: () => apiClient.get<CustomerProfile>("/customers/profile"),
  });
}

export function useCustomerTimeline() {
  return useQuery({
    queryKey: customerKeys.timeline(),
    queryFn: () => apiClient.get<TimelineResponse>("/customers/timeline"),
  });
}

export function useRelatedAccounts() {
  return useQuery({
    queryKey: customerKeys.related(),
    queryFn: () => apiClient.get<RelatedAccountsResponse>("/customers/related-accounts"),
  });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateProfileInput) =>
      apiClient.put<UpdateProfileResponse>("/customers/profile", input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: customerKeys.profile() });
      toast.success("Đã cập nhật thông tin liên hệ.");
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}
