import { useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArrowLeft, Send } from "lucide-react-native";
import { Input } from "@/components/ui/input";
import { useConversation, useSendMessage } from "@/features/support/queries";
import { colors } from "@/theme/colors";
import type { ChatMessage } from "@/lib/types/entities";

/**
 * Customer ↔ staff chat. Messages are aggregated in omnichannel_be (the agent
 * inbox): this screen READs the active thread (GET /call-center/messages, polled
 * every 4s while focused) and SENDs (POST /call-center/message → omnichannel).
 * Staff replies appear as OUTBOUND/AGENT bubbles on the left.
 */
export default function ChatScreen() {
  const { data } = useConversation();
  const send = useSendMessage();
  const [text, setText] = useState("");
  const insets = useSafeAreaInsets();
  const messages = data?.messages ?? [];

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
        renderItem={({ item }) => <Bubble msg={item} />}
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

function Bubble({ msg }: { msg: ChatMessage }) {
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
          className={`rounded-2xl px-3.5 py-2.5 ${mine ? "bg-deep" : "border border-line bg-card"}`}
        >
          <Text className={`text-[14px] leading-snug ${mine ? "text-white" : "text-foreground"}`}>
            {msg.content}
          </Text>
        </View>
      </View>
    </View>
  );
}
