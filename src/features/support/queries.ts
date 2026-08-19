import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useIsFocused } from "@react-navigation/native";
import { apiClient } from "@/lib/api-client";
import type { ChatConversation, ChatMessage } from "@/lib/types/entities";

/** Server thread (GET /call-center/messages) — the aggregation truth, polled. */
export const CHAT_KEY = ["chat", "conversation"] as const;
/**
 * Local outbox — messages composed on THIS device. Local-first pipeline: they
 * render immediately and STAY until the server poll echoes them back (dedup by
 * id). In-memory (RQ cache) — cleared on app restart; anything the wire accepted
 * lives server-side, so nothing durable is lost.
 */
export const CHAT_OUTBOX_KEY = ["chat", "outbox"] as const;

/**
 * The customer's active chat thread, aggregated in omnichannel_be. Polls every 4s
 * WHILE THE SCREEN IS FOCUSED so staff replies show up; stops when the user
 * leaves the chat (no background polling).
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

/** Subscribe to the outbox cache (written via setQueryData by the send hooks). */
export function useOutbox() {
  const queryClient = useQueryClient();
  return useQuery<ChatMessage[]>({
    queryKey: CHAT_OUTBOX_KEY,
    queryFn: () => queryClient.getQueryData<ChatMessage[]>(CHAT_OUTBOX_KEY) ?? [],
    initialData: [],
    staleTime: Infinity,
  });
}

/**
 * Local-first thread view: server messages + outbox entries not yet echoed by
 * the server. A successful send adopts the server's messageId, so once the poll
 * returns it, the local copy is deduped away. Failed sends stay with a retry
 * state instead of silently vanishing.
 */
export function useChatThread() {
  const server = useConversation();
  const outbox = useOutbox();
  const serverIds = new Set((server.data?.messages ?? []).map((m) => m.id));
  const pending = (outbox.data ?? []).filter((m) => !serverIds.has(m.id));
  // DESCENDING (newest first): the FlatList is `inverted` — data[0] renders at the
  // BOTTOM, so newest-first puts each new message below the previous ones. An
  // ascending sort made every new message land ABOVE the old ones instead.
  const messages = [...(server.data?.messages ?? []), ...pending].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt),
  );
  return {
    conversationId: server.data?.conversationId ?? null,
    messages,
    isLoading: server.isLoading,
  };
}

/**
 * POST /call-center/message + patch the outbox entry (`id`) with the outcome.
 * BFF maps wire failure to HTTP 200 + {sent:false} (FE-shape contract) — a 200
 * is NOT a delivered message. Network errors also land in the same failed state.
 */
function usePostMessage() {
  const queryClient = useQueryClient();
  const patch = (id: string, p: Partial<ChatMessage>) =>
    queryClient.setQueryData<ChatMessage[]>(CHAT_OUTBOX_KEY, (list) =>
      (list ?? []).map((m) => (m.id === id ? { ...m, ...p } : m)),
    );
  return async (id: string, text: string) => {
    try {
      const data = await apiClient.post<{
        sent: boolean;
        messageId?: string;
        conversationId?: string;
      }>("/call-center/message", { text });
      if (!data.sent) {
        patch(id, { status: "failed" });
        return;
      }
      // Adopt the server id (when given) so the next poll's echo dedups this
      // entry away; drop the local status → renders as delivered.
      patch(id, { status: undefined, id: data.messageId ?? id });
    } catch {
      patch(id, { status: "failed" });
    }
  };
}

/** Send: append to the outbox FIRST (renders instantly), then push to the BFF. */
export function useSendMessage() {
  const queryClient = useQueryClient();
  const post = usePostMessage();
  return useMutation({
    mutationFn: (text: string) => {
      const msg: ChatMessage = {
        id: `local-${Date.now()}`,
        content: text,
        direction: "INBOUND",
        senderType: "CUSTOMER",
        createdAt: new Date().toISOString(),
        status: "sending",
      };
      queryClient.setQueryData<ChatMessage[]>(CHAT_OUTBOX_KEY, (l) => [...(l ?? []), msg]);
      return post(msg.id, text);
    },
  });
}

/** Retry a failed outbox message — same wire call, entry flips back to "sending". */
export function useRetryMessage() {
  const queryClient = useQueryClient();
  const post = usePostMessage();
  return useMutation({
    mutationFn: (msg: ChatMessage) => {
      queryClient.setQueryData<ChatMessage[]>(
        CHAT_OUTBOX_KEY,
        (l) => (l ?? []).map((m) => (m.id === msg.id ? { ...m, status: "sending" } : m)),
      );
      return post(msg.id, msg.content);
    },
  });
}
