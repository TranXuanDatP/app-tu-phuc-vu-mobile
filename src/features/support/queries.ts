import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useIsFocused } from "@react-navigation/native";
import { apiClient } from "@/lib/api-client";
import { toast } from "@/lib/toast";
import type { ChatConversation, ChatMessage } from "@/lib/types/entities";

/** Query key for the active chat thread (shared by useConversation + useSendMessage). */
export const CHAT_KEY = ["chat", "conversation"] as const;

/**
 * The customer's active chat thread (history + staff replies), aggregated in
 * omnichannel_be. Polls every 4s WHILE THE SCREEN IS FOCUSED so staff replies
 * show up; stops when the user leaves the chat (no background polling).
 */
export function useConversation() {
  const focused = useIsFocused();
  return useQuery<ChatConversation>({
    queryKey: CHAT_KEY,
    queryFn: () => apiClient.get<ChatConversation>("/call-center/messages"),
    enabled: focused,
    refetchInterval: focused ? 4000 : false,
  });
}

/** POST /call-center/message — send a customer message to CSKH (forwarded to omnichannel). */
export function useSendMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (text: string) =>
      apiClient.post<{ sent: boolean; messageId?: string; conversationId?: string }>(
        "/call-center/message",
        { text },
      ),
    onSuccess: (data, text) => {
      // Optimistic: show the sent message immediately — don't wait for the next
      // poll (omnichannel read-after-write can lag a beat after the POST commits).
      queryClient.setQueryData<ChatConversation>(CHAT_KEY, (prev) => {
        const msg: ChatMessage = {
          id: data.messageId ?? `local-${Date.now()}`,
          content: text,
          direction: "INBOUND",
          senderType: "CUSTOMER",
          createdAt: new Date().toISOString(),
        };
        // Dedup by id in case the poll already added it.
        const existing = prev?.messages ?? [];
        if (existing.some((m) => m.id === msg.id)) return prev;
        return {
          conversationId: prev?.conversationId ?? data.conversationId ?? null,
          messages: [...existing, msg],
        };
      });
      // Reconcile with the server (poll picks up staff replies too).
      queryClient.invalidateQueries({ queryKey: CHAT_KEY });
    },
    onError: () => toast.error("Không gửi được tin nhắn. Thử lại."),
  });
}
