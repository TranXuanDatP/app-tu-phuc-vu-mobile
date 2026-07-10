"use client";

import Link from "next/link";
import {
  ChevronRight,
  HelpCircle,
  Mail,
  MapPin,
  MessageSquare,
  PhoneCall,
  ReceiptText,
  Siren,
  type LucideIcon,
} from "lucide-react";
import { AppBar } from "@/components/layout/app-bar";
import { toast } from "sonner";

export default function ContactPage() {
  return (
    <div className="pb-4">
      <AppBar title="Liên hệ & hỗ trợ" sub="QUAWACO — Chăm sóc khách hàng" back />

      {/* Hotline */}
      <div className="px-4 pt-4">
        <div className="rounded-[18px] bg-gradient-to-br from-deep via-[#0d7391] to-aqua p-5 text-center text-white">
          <p className="text-[12.5px] opacity-90">Tổng đài chăm sóc khách hàng</p>
          <p className="my-1 text-[32px] font-extrabold tracking-wide tabular-nums">1900 1234</p>
          <p className="text-[12px] opacity-90">Hoạt động 24/7 · cước 1.000đ/phút</p>
          <button
            type="button"
            onClick={() => toast("Đang gọi 1900 1234…")}
            className="mt-3.5 flex w-full items-center justify-center gap-2 rounded-xl bg-white py-3 text-[15px] font-extrabold text-deep active:scale-[0.99]"
          >
            <PhoneCall className="h-4 w-4" /> Gọi ngay
          </button>
        </div>
      </div>

      {/* Channels */}
      <Section title="Kênh hỗ trợ">
        <div className="grid grid-cols-2 gap-3">
          <Channel icon={MessageSquare} title="Chat nhân viên" sub="Phản hồi ~1 phút" href="/chat" />
          <Channel
            icon={PhoneCall}
            title="Gọi tổng đài"
            sub="1900 1234"
            onClick={() => toast("Đang gọi 1900 1234…")}
          />
          <Channel
            icon={Mail}
            title="Email"
            sub="cskh@quawaco.vn"
            onClick={() => toast("Mở email cskh@quawaco.vn")}
          />
          <Channel icon={Siren} title="Báo sự cố" sub="Tạo yêu cầu mới" href="/tickets" />
        </div>
      </Section>

      {/* FAQ */}
      <Section title="Câu hỏi thường gặp">
        <div className="overflow-hidden rounded-[18px] border border-line bg-card shadow-[0_6px_22px_rgba(10,42,56,.10)]">
          <FaqRow icon={HelpCircle} title="Vì sao hóa đơn tháng này tăng?" />
          <FaqRow icon={ReceiptText} title="Các cách thanh toán online" />
          <FaqRow icon={MapPin} title="Thủ tục đổi tên chủ hợp đồng" last />
        </div>
      </Section>

      {/* Office */}
      <Section title="Văn phòng giao dịch">
        <div className="rounded-[18px] border border-line bg-card p-4 shadow-[0_6px_22px_rgba(10,42,56,.10)]">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-foam text-deep">
              <MapPin className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <b className="text-[14px] font-bold">CN Hạ Long — QUAWACO</b>
              <p className="text-[12.5px] text-muted-foreground">
                Số 5 Lê Thánh Tông, TP Hạ Long · 7:30–17:00 (T2–T7)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => toast("Đang mở chỉ đường…")}
            className="mt-3.5 block w-full rounded-[14px] border-[1.5px] border-line bg-card py-3 text-[15px] font-extrabold text-deep active:scale-[0.99]"
          >
            Chỉ đường
          </button>
        </div>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="px-4 pt-5">
      <h2 className="mb-2 px-1 text-sm font-bold">{title}</h2>
      {children}
    </div>
  );
}

function Channel({
  icon: Icon,
  title,
  sub,
  href,
  onClick,
}: {
  icon: LucideIcon;
  title: string;
  sub: string;
  href?: string;
  onClick?: () => void;
}) {
  const inner = (
    <>
      <span className="mx-auto mb-2 flex h-11 w-11 items-center justify-center rounded-2xl bg-aqua-soft text-deep">
        <Icon className="h-5 w-5" />
      </span>
      <b className="block text-[13.5px] font-bold">{title}</b>
      <span className="text-[11px] text-muted-foreground">{sub}</span>
    </>
  );
  const cls =
    "flex flex-col items-center text-center rounded-2xl border border-line bg-card p-4 shadow-[0_6px_22px_rgba(10,42,56,.10)] active:translate-y-px";
  return href ? (
    <Link href={href} className={cls}>
      {inner}
    </Link>
  ) : (
    <button type="button" onClick={onClick} className={cls}>
      {inner}
    </button>
  );
}

function FaqRow({ icon: Icon, title, last }: { icon: LucideIcon; title: string; last?: boolean }) {
  return (
    <button
      type="button"
      onClick={() => toast("Chuyển đến chat — demo")}
      className={`flex w-full items-center gap-3 px-4 py-3.5 text-left ${
        !last ? "border-b border-line" : ""
      }`}
    >
      <span className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-xl bg-aqua-soft text-deep">
        <Icon className="h-5 w-5" />
      </span>
      <b className="flex-1 text-[14px] font-bold">{title}</b>
      <ChevronRight className="h-4 w-4 text-muted-foreground" />
    </button>
  );
}
