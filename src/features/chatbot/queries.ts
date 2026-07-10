"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";
import { getErrorMessage } from "@/lib/types/api";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}
export interface ConversationResponse {
  conversationId: string;
  messages: ChatMessage[];
}

export function useConversation(convId: string) {
  return useQuery({
    queryKey: ["chatbot", convId],
    queryFn: () =>
      apiClient.get<ConversationResponse>(`/chatbot/conversations/${convId}`),
    enabled: Boolean(convId),
  });
}

export function useSendMessage(convId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (message: string) =>
      apiClient.post<{ reply: string; conversationId: string }>(
        `/chatbot/conversations/${convId}/messages`,
        { message },
      ),
    onError: (e) => toast.error(getErrorMessage(e)),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["chatbot", convId] }),
  });
}
