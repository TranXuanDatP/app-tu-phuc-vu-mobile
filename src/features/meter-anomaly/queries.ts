"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";
import { getErrorMessage } from "@/lib/types/api";
import type { AnomalyAlertsResponse } from "@/lib/types/entities";

export const anomalyKeys = {
  all: ["meter-anomalies"] as const,
  alerts: () => ["meter-anomalies", "alerts"] as const,
};

export function useAnomalyAlerts() {
  return useQuery({
    queryKey: anomalyKeys.alerts(),
    queryFn: () => apiClient.get<AnomalyAlertsResponse>("/meter-anomalies"),
  });
}

export function useReportAnomalyStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { alertId: string; status: "acknowledged" | "false_alarm" | "resolved" }) =>
      apiClient.post(`/meter-anomalies/${input.alertId}/status`, { status: input.status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: anomalyKeys.all }),
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}
