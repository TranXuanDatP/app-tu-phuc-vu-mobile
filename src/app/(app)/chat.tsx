import { useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AlertCircle, ArrowLeft, Clock3, Send } from "lucide-react-native";
import { Input } from "@/components/ui/input";
import { useChatThread, useRetryMessage, useSendMessage } from "@/features/support/queries";
import { colors } from "@/theme/colors";
import type { ChatMessage } from "@/lib/types/entities";

/**
 * Customer ↔ staff chat — LOCAL-FIRST pipeline: a message renders in the thread
 * the moment it is sent (outbox), then is pushed to the BFF → omnichannel_be for
 * aggregation. The server thread (GET /call-center/messages, polled every 4s
 * while focused) supplies history + staff replies and confirms our sends by
 * echo (dedup by id). Failed sends stay visible with a retry tap instead of
 * silently vanishing. Staff replies render as OUTBOUND/AGENT bubbles on the left.
 */
export default function ChatScreen() {
  const { messages } = useChatThread();
  const send = useSendMessage();
  const retry = useRetryMessage();
  const [text, setText] = useState("");
  const insets = useSafeAreaInsets();

  function handleSend() {
    const t = text.trim();
    if (!t || send.isPending) return;
    setText("");
    send.mutate(t);
  }

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View
        style={{ paddingTop: insets.top }}
        className="flex-row items-center gap-3 border-b border-line bg-card px-4 pb-3"
      >
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <ArrowLeft size={22} color={colors.ink} />
        </Pressable>
        <View className="flex-1">
          <Text className="text-base font-extrabold text-foreground">Chat với nhân viên</Text>
          <Text className="text-[11.5px] text-muted-foreground">
            CSKH sẽ phản hồi trong giờ làm việc
          </Text>
        </View>
      </View>

      {/* Thread */}
      <FlatList
        data={messages}
        keyExtractor={(m: ChatMessage) => m.id}
        inverted={messages.length > 0}
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 16, gap: 10 }}
        renderItem={({ item }) => <Bubble msg={item} onRetry={(m) => retry.mutate(m)} />}
        ListEmptyComponent={
          <View className="mt-24 items-center px-8">
            <Text className="text-center text-sm text-muted-foreground">
              Chưa có tin nhắn. Hãy gửi câu hỏi cho nhân viên CSKH.
            </Text>
          </View>
        }
      />

      {/* Composer */}
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined}>
        {/* Quick-reply chips — scrollable row of common requests */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="border-t border-line bg-card"
          contentContainerStyle={{ paddingHorizontal: 12, paddingVertical: 8, gap: 8 }}
        >
          {QUICK_MESSAGES.map((q) => (
            <Pressable
              key={q}
              onPress={() => setText(q)}
              className="rounded-full border border-line bg-background px-3.5 py-1.5 active:opacity-70"
            >
              <Text className="text-[12.5px] font-medium text-deep">{q}</Text>
            </Pressable>
          ))}
        </ScrollView>
        <View
          style={{ paddingBottom: insets.bottom + 8 }}
          className="flex-row items-center gap-2 border-t border-line bg-card px-3 pt-2"
        >
          <Input
            value={text}
            onChangeText={setText}
            placeholder="Nhập tin nhắn…"
            multiline
            className="max-h-28 min-h-[40px] flex-1 rounded-full bg-background px-4"
          />
          <Pressable
            onPress={handleSend}
            disabled={!text.trim() || send.isPending}
            className="h-11 w-11 items-center justify-center rounded-full bg-deep disabled:opacity-50"
          >
            <Send size={18} color="white" />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const FAILED_RED = "#dc2626";

/** Quick-reply chips — common customer requests; a tap pre-fills the composer. */
const QUICK_MESSAGES = [
  "Tra cứu hóa đơn",
  "Báo mất nước",
  "Tra chỉ số đồng hồ",
  "Hỏi giá nước",
  "Khiếu nại chất lượng nước",
  "Hỏi lịch cắt nước",
];

function Bubble({
  msg,
  onRetry,
}: {
  msg: ChatMessage;
  onRetry?: (m: ChatMessage) => void;
}) {
  // INBOUND = the customer (this app, right); OUTBOUND = staff (left, labelled).
  const mine = msg.direction === "INBOUND";
  return (
    <View className={`w-full ${mine ? "items-end" : "items-start"}`}>
      <View className="max-w-[80%]">
        {!mine ? (
          <Text className="mb-1 ml-1 text-[10.5px] font-semibold text-muted-foreground">
            {msg.senderType === "BOT" ? "Trợ lý ảo" : "Nhân viên"}
          </Text>
        ) : null}
        <View
          className={`rounded-2xl px-3.5 py-2.5 ${
            mine ? (msg.status === "failed" ? "border border-line bg-card" : "bg-deep") : "border border-line bg-card"
          }`}
        >
          <Text
            className={`text-[14px] leading-snug ${mine && msg.status !== "failed" ? "text-white" : "text-foreground"}`}
          >
            {msg.content}
          </Text>
        </View>
        {mine && msg.status === "sending" ? (
          <View className="mt-1 flex-row items-center gap-1 self-end">
            <Clock3 size={11} color={colors.ink} />
            <Text className="text-[10px] text-muted-foreground">Đang gửi</Text>
          </View>
        ) : null}
        {mine && msg.status === "failed" ? (
          <Pressable
            onPress={() => onRetry?.(msg)}
            hitSlop={8}
            className="mt-1 flex-row items-center gap-1 self-end"
          >
            <AlertCircle size={11} color={FAILED_RED} />
            <Text style={{ color: FAILED_RED }} className="text-[10px] font-semibold">
              Không gửi được — chạm để thử lại
            </Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}
