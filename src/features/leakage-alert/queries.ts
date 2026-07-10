"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";
import { getErrorMessage } from "@/lib/types/api";
import type { LeakageAlertsResponse, ScheduleInspectionResult } from "@/lib/types/entities";

export const leakageKeys = {
  all: ["leakage-alerts"] as const,
  alerts: () => ["leakage-alerts", "alerts"] as const,
};

export function useLeakageAlerts() {
  return useQuery({
    queryKey: leakageKeys.alerts(),
    queryFn: () => apiClient.get<LeakageAlertsResponse>("/leakage-alerts"),
  });
}

export function useScheduleInspection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { alertId: string; preferredSlot?: string }) =>
      apiClient.post<ScheduleInspectionResult>(
        `/leakage-alerts/${input.alertId}/inspection`,
        input.preferredSlot ? { preferredSlot: input.preferredSlot } : {},
      ),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: leakageKeys.all });
      toast.success(`Đã lên lịch kiểm tra — đội ${data.teamId}`);
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}
