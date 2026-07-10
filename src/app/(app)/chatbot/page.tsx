"use client";

import { useEffect, useRef, useState } from "react";
import { AppBar } from "@/components/layout/app-bar";
import { Skeleton } from "@/components/ui";
import { useConversation, useSendMessage } from "@/features/chatbot/queries";
import { cn } from "@/lib/utils";
import { Send } from "lucide-react";

const CONV_ID = "CONV-001";

export default function ChatbotPage() {
  const conv = useConversation(CONV_ID);
  const send = useSendMessage(CONV_ID);
  const [text, setText] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  const msgs = conv.data?.messages ?? [];

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs.length, send.isPending]);

  function handleSend() {
    if (!text.trim()) return;
    send.mutate(text);
    setText("");
  }

  return (
    <div className="flex h-[calc(100dvh-3.5rem)] flex-col">
      <AppBar title="Trợ lý AI" sub="Hỏi đáp tự động 24/7" back />
      <div className="flex-1 space-y-2.5 overflow-y-auto bg-foam p-4 pb-32">
        {conv.isLoading ? (
          <Skeleton className="h-20 w-full" />
        ) : (
          <>
            {msgs.length === 0 ? (
              <div className="mx-auto w-fit rounded-full bg-ink/5 px-3 py-1 text-[11.5px] font-semibold text-muted-foreground">
                Hỏi tôi về hóa đơn, tiêu thụ, sự cố...
              </div>
            ) : null}
            {msgs.map((m, i) => (
              <div
                key={i}
                className={cn(
                  "max-w-[82%] rounded-2xl px-3.5 py-2.5 text-[14px] leading-relaxed",
                  m.role === "user"
                    ? "ml-auto bg-deep text-white rounded-br-md"
                    : "bg-card border border-line rounded-bl-md",
                )}
              >
                {m.content}
              </div>
            ))}
            {send.isPending ? (
              <div className="bg-card border border-line rounded-2xl rounded-bl-md px-3.5 py-2.5 text-[14px] text-muted-foreground">
                Đang trả lời...
              </div>
            ) : null}
          </>
        )}
        <div ref={endRef} />
      </div>
      <div className="fixed bottom-0 left-1/2 w-full max-w-md -translate-x-1/2 border-t border-line bg-card px-3 pb-5 pt-2.5">
        <div className="flex items-center gap-2">
          <div className="flex flex-1 items-center rounded-full border-[1.5px] border-line px-3.5 py-2">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Hỏi trợ lý AI..."
              className="flex-1 bg-transparent text-[15px] outline-none"
            />
          </div>
          <button
            type="button"
            onClick={handleSend}
            disabled={send.isPending}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-aqua text-white active:scale-95"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
