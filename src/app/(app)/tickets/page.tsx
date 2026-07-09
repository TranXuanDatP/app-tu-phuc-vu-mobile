"use client";

import Link from "next/link";
import {
  CloudRain,
  Droplet,
  Droplets,
  Gauge,
  HelpCircle,
  Mic,
  ShieldAlert,
  Waves,
  Wind,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { AppBar } from "@/components/layout/app-bar";
import { Badge, Skeleton } from "@/components/ui";
import { EmptyState, ErrorState } from "@/components/state";
import { CreateTicketForm } from "@/features/tickets/create-ticket-form";
import { useTicketHistory } from "@/features/tickets/queries";
import {
  incidentTypeLabel,
  ticketStatusLabel,
  ticketStatusVariant,
} from "@/features/tickets/labels";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";

const CATEGORIES: { icon: LucideIcon; label: string }[] = [
  { icon: Droplet, label: "Rò rỉ" },
  { icon: Waves, label: "Nước đục" },
  { icon: Wind, label: "Mùi/vị lạ" },
  { icon: Droplets, label: "Mất nước" },
  { icon: Wrench, label: "Vỡ ống" },
  { icon: CloudRain, label: "Ngập/tràn" },
  { icon: Gauge, label: "Đồng hồ lỗi" },
  { icon: ShieldAlert, label: "Đấu nối lậu" },
  { icon: HelpCircle, label: "Khác" },
];

export default function TicketsPage() {
  return (
    <div className="pb-4">
      <AppBar title="Báo sự cố" sub="Tạo yêu cầu trong dưới 30 giây" />

      {/* Voice quick note */}
      <div className="px-4 pt-4">
        <button
          type="button"
          onClick={() => toast("Ghi âm mô tả — AI tự phân loại (demo)")}
          className="flex w-full items-center gap-3.5 rounded-[18px] bg-gradient-to-br from-deep to-aqua p-4 text-left text-white active:scale-[0.99]"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20">
            <Mic className="h-5 w-5" />
          </span>
          <span className="flex-1">
            <b className="text-[15px]">Báo nhanh bằng giọng nói</b>
            <p className="text-[12.5px] opacity-90">
              Chụp ảnh + nói 1 câu mô tả — AI tự phân loại sự cố.
            </p>
          </span>
        </button>
      </div>

      {/* Category grid */}
      <div className="px-4 pt-5">
        <h2 className="mb-2 px-1 text-sm font-bold">Chọn loại sự cố</h2>
        <div className="grid grid-cols-3 gap-3">
          {CATEGORIES.map((c) => {
            const Icon = c.icon;
            return (
              <button
                key={c.label}
                type="button"
                onClick={() => {
                  toast(`Đã chọn: ${c.label}`);
                  document
                    .getElementById("ticket-create")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
                className="rounded-2xl border border-line bg-card p-3.5 text-center shadow-[0_6px_22px_rgba(10,42,56,.10)] active:translate-y-px"
              >
                <span className="mx-auto mb-2 flex h-11 w-11 items-center justify-center rounded-2xl bg-aqua-soft text-deep">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="text-xs font-semibold leading-tight">{c.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* My requests */}
      <MyRequests />

      {/* Create form */}
      <div id="ticket-create" className="scroll-mt-20 px-4 pt-5">
        <h2 className="mb-2 px-1 text-sm font-bold">Tạo phản ánh</h2>
        <CreateTicketForm />
      </div>
    </div>
  );
}

function MyRequests() {
  const { data, isLoading, isError, refetch } = useTicketHistory({ pageSize: 5 });
  return (
    <div className="px-4 pt-5">
      <div className="mb-2 flex items-center justify-between px-1">
        <h2 className="text-sm font-bold">Yêu cầu của tôi</h2>
        <Link href="/sessions" className="text-[12.5px] font-semibold text-aqua">
          Tất cả
        </Link>
      </div>
      <div className="overflow-hidden rounded-[18px] border border-line bg-card shadow-[0_6px_22px_rgba(10,42,56,.10)]">
        {isLoading ? (
          <Skeleton className="h-16 w-full" />
        ) : isError ? (
          <ErrorState onRetry={() => refetch()} />
        ) : !data?.tickets.length ? (
          <EmptyState title="Chưa có yêu cầu nào" />
        ) : (
          data.tickets.map((t, i) => (
            <Link
              key={t.trackingId}
              href={`/tickets/${t.trackingId}`}
              className={`flex items-center gap-3 px-4 py-3.5 ${
                i < data.tickets.length - 1 ? "border-b border-line" : ""
              }`}
            >
              <span className="flex h-[42px] w-[42px] items-center justify-center rounded-xl bg-amber-soft text-[#8a5410]">
                <Gauge className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <b className="text-[14.5px] font-bold">{incidentTypeLabel[t.type]}</b>
                <p className="text-[12.5px] text-muted-foreground">
                  #{t.trackingId} · {formatDate(t.createdAt)}
                </p>
              </div>
              <Badge variant={ticketStatusVariant[t.status]}>
                {ticketStatusLabel[t.status]}
              </Badge>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
