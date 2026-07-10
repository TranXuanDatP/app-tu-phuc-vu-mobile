"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";
import { getErrorMessage } from "@/lib/types/api";

export interface CallRecord {
  callId: string;
  startedAt: string;
  durationSec: number;
  outcome: string;
}

export function useCallHistory() {
  return useQuery({
    queryKey: ["call-center", "history"],
    queryFn: () => apiClient.get<{ calls: CallRecord[] }>("/call-center/history"),
  });
}

export function useClickToCall() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (phoneNumber: string) =>
      apiClient.post<{ callId: string; status: string }>("/call-center/click-to-call", {
        phoneNumber,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["call-center"] });
      toast.success("Đang kết nối tổng đài...");
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}
