"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";
import { getErrorMessage } from "@/lib/types/api";
import type {
  CreateTicketRequest,
  CreateTicketResponse,
  TicketFeedbackResponse,
  TicketHistoryResponse,
  TicketStatus,
  TicketStatusResponse,
  TicketUploadUrl,
} from "@/lib/types/entities";

export const ticketKeys = {
  all: ["tickets"] as const,
  history: (params: { status?: TicketStatus; page?: number; pageSize?: number }) =>
    ["tickets", "history", params] as const,
  status: (trackingId: string) => ["tickets", "status", trackingId] as const,
};

export function useTicketHistory(
  params: { status?: TicketStatus; page?: number; pageSize?: number } = {},
) {
  return useQuery({
    queryKey: ticketKeys.history(params),
    queryFn: () => apiClient.get<TicketHistoryResponse>("/tickets", params),
  });
}

export function useTicketStatus(trackingId: string) {
  return useQuery({
    queryKey: ticketKeys.status(trackingId),
    queryFn: () => apiClient.get<TicketStatusResponse>(`/tickets/${trackingId}`),
    enabled: Boolean(trackingId),
  });
}

export function useCreateTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateTicketRequest) =>
      apiClient.post<CreateTicketResponse>("/tickets", input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ticketKeys.all }),
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}

export function useSubmitFeedback() {
  return useMutation({
    mutationFn: (input: { trackingId: string; score: number; comment?: string }) =>
      apiClient.post<TicketFeedbackResponse>(
        `/tickets/${input.trackingId}/feedback`,
        { score: input.score, ...(input.comment ? { comment: input.comment } : {}) },
      ),
    onSuccess: () => toast.success("Cảm ơn bạn đã đánh giá!"),
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}

/** Request a presigned upload URL, then PUT the file to object storage. */
export function useUploadTicketPhoto() {
  return useMutation({
    mutationFn: async ({ file }: { file: File }) => {
      const { uploadUrl, fileKey } = await apiClient.post<TicketUploadUrl>(
        "/tickets/upload-url",
        { fileName: file.name, fileType: file.type as "image/jpeg" | "image/png" | "image/webp" },
      );
      const putRes = await fetch(uploadUrl, { method: "PUT", body: file });
      if (!putRes.ok) throw new Error("Tải ảnh lên thất bại");
      return { fileKey, publicUrl: uploadUrl.split("?")[0] };
    },
    onError: (e) => toast.error((e as Error).message ?? "Tải ảnh lên thất bại"),
  });
}
