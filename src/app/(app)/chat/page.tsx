"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, PhoneCall, Send } from "lucide-react";
import Link from "next/link";
import { AppBar } from "@/components/layout/app-bar";
import { cn } from "@/lib/utils";

type Msg = { who: "them" | "me"; text: string; tm: string };
const tm = () => new Date().toLocaleTimeString("vi", { hour: "2-digit", minute: "2-digit" });

const SEED: Msg[] = [
  { who: "them", text: "Xin chào, em là trợ lý ảo của QUAWACO. Em có thể giúp gì cho anh/chị hôm nay ạ?", tm: "08:05" },
  { who: "me", text: "Hóa đơn kỳ này sao cao hơn tháng trước vậy?", tm: "08:06" },
  {
    who: "them",
    text: "Kỳ này mức dùng cao hơn — có thể do rò rỉ trong nhà. Anh/chị muốn em chuyển đến nhân viên kiểm tra không ạ?",
    tm: "08:06",
  },
];

export default function ChatPage() {
  const [msgs, setMsgs] = useState<Msg[]>(SEED);
  const [text, setText] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs]);

  function send(t?: string) {
    const v = (t ?? text).trim();
    if (!v) return;
    setMsgs((m) => [...m, { who: "me", text: v, tm: tm() }]);
    setText("");
    setTimeout(
      () =>
        setMsgs((m) => [
          ...m,
          { who: "them", text: "Cảm ơn anh/chị, em đã ghi nhận yêu cầu. Em kiểm tra và phản hồi ngay ạ.", tm: tm() },
        ]),
      700,
    );
  }

  return (
    <div className="flex h-[calc(100dvh-3.5rem)] flex-col">
      <AppBar title="Hỗ trợ CSKH" sub="Trực tuyến · thường trả lời trong 1 phút" back>
        <Link
          href="/contact"
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-line text-deep"
        >
          <PhoneCall className="h-5 w-5" />
        </Link>
      </AppBar>

      {/* Messages */}
      <div className="flex-1 space-y-2.5 overflow-y-auto bg-foam p-4 pb-32">
        <div className="mx-auto w-fit rounded-full bg-ink/5 px-3 py-1 text-[11.5px] font-semibold text-muted-foreground">
          Hôm nay
        </div>
        {msgs.map((m, i) => (
          <div
            key={i}
            className={cn(
              "max-w-[82%] rounded-2xl px-3.5 py-2.5 text-[14px] leading-relaxed",
              m.who === "me"
                ? "ml-auto bg-deep text-white rounded-br-md"
                : "bg-card border border-line rounded-bl-md",
            )}
          >
            {m.text}
            <span className="mt-1 block text-[10px] opacity-60">{m.tm}</span>
          </div>
        ))}
        <div ref={endRef} />
      </div>

      {/* Input (fixed within the mobile column) */}
      <div className="fixed bottom-0 left-1/2 w-full max-w-md -translate-x-1/2 border-t border-line bg-card px-3 pb-5 pt-2.5">
        <div className="flex gap-2 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {["Tình trạng sự cố của tôi?", "Hỏi về hóa đơn", "Đăng ký dịch vụ"].map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => send(q)}
              className="shrink-0 rounded-full border-[1.5px] border-line bg-card px-3 py-1.5 text-[12.5px] font-semibold text-deep active:scale-[0.97]"
            >
              {q}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <div className="flex flex-1 items-center gap-2 rounded-full border-[1.5px] border-line px-3.5 py-2">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Nhập tin nhắn…"
              className="flex-1 bg-transparent text-[15px] outline-none"
            />
            <Camera className="h-4 w-4 shrink-0 text-muted-foreground" />
          </div>
          <button
            type="button"
            onClick={() => send()}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-aqua text-white active:scale-95"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
