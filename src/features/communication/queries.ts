"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";
import { getErrorMessage } from "@/lib/types/api";
import type {
  AcknowledgeAlertResponse,
  ActiveAlert,
  AlertHistoryResponse,
  NotificationChannel,
  NotificationHistoryResponse,
  NotificationPreferences,
  NotificationType,
} from "@/lib/types/entities";

export const commKeys = {
  all: ["comm"] as const,
  prefs: () => ["comm", "prefs"] as const,
  history: (params: object) => ["comm", "history", params] as const,
  activeAlerts: () => ["comm", "alerts", "active"] as const,
  alertHistory: (params: object) => ["comm", "alerts", "history", params] as const,
};

export interface NotificationHistoryParams {
  page?: number;
  pageSize?: number;
  channel?: NotificationChannel;
  type?: NotificationType;
  startDate?: string;
  endDate?: string;
}

export function useNotificationPreferences() {
  return useQuery({
    queryKey: commKeys.prefs(),
    queryFn: () => apiClient.get<NotificationPreferences>("/notifications/preferences"),
  });
}

export function useUpdateNotificationPreferences() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { channels: { channel: NotificationChannel; enabled: boolean }[] }) =>
      apiClient.patch<NotificationPreferences>("/notifications/preferences", input),
    onSuccess: (data) => {
      qc.setQueryData(commKeys.prefs(), data);
      toast.success("Đã cập nhật tuỳ chọn thông báo.");
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}

export function useNotificationHistory(params: NotificationHistoryParams = {}) {
  return useQuery({
    queryKey: commKeys.history(params),
    queryFn: () =>
      apiClient.get<NotificationHistoryResponse>("/notifications/history", {
        page: params.page,
        pageSize: params.pageSize,
        ...(params.channel ? { channel: params.channel } : {}),
        ...(params.type ? { type: params.type } : {}),
        ...(params.startDate ? { startDate: params.startDate } : {}),
        ...(params.endDate ? { endDate: params.endDate } : {}),
      }),
  });
}

export function useActiveAlerts() {
  return useQuery({
    queryKey: commKeys.activeAlerts(),
    queryFn: () => apiClient.get<{ alerts: ActiveAlert[]; totalCount: number }>("/proactive-notifications/active"),
  });
}

export function useAlertHistory(params: Record<string, unknown> = {}) {
  return useQuery({
    queryKey: commKeys.alertHistory(params),
    queryFn: () => apiClient.get<AlertHistoryResponse>("/proactive-notifications/history", params),
  });
}

export function useAcknowledgeAlert() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (alertId: string) =>
      apiClient.post<AcknowledgeAlertResponse>(`/proactive-notifications/${alertId}/acknowledge`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: commKeys.activeAlerts() });
      toast.success("Đã xác nhận cảnh báo.");
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}
