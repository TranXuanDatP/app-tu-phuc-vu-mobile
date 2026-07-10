"use client";

import { use, useState } from "react";
import Link from "next/link";
import { Check, Clock, MessageSquare, PhoneCall, Star } from "lucide-react";
import { AppBar } from "@/components/layout/app-bar";
import { Badge, Button, Skeleton, Textarea } from "@/components/ui";
import { ErrorState } from "@/components/state";
import { useSubmitFeedback, useTicketStatus } from "@/features/tickets/queries";
import { ticketStatusLabel, ticketStatusVariant } from "@/features/tickets/labels";
import { cn, formatDate } from "@/lib/utils";

export default function TicketTrackingPage({
  params,
}: {
  params: Promise<{ trackingId: string }>;
}) {
  const { trackingId } = use(params);
  const ticket = useTicketStatus(trackingId);
  const submitFeedback = useSubmitFeedback();
  const [score, setScore] = useState(0);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const t = ticket.data;
  const lastIdx = t ? t.timeline.length - 1 : -1;
  const isDone = t?.status === "resolved" || t?.status === "closed";
  const etaMin =
    t?.eta ? Math.max(0, Math.round((new Date(t.eta).getTime() - Date.now()) / 60000)) : null;

  return (
    <div className="pb-4">
      <AppBar title="Theo dõi yêu cầu" sub={t ? `#${t.trackingId}` : ""} back />

      {ticket.isLoading ? (
        <div className="p-4">
          <Skeleton className="h-64 w-full" />
        </div>
      ) : ticket.isError ? (
        <div className="p-4">
          <ErrorState onRetry={() => ticket.refetch()} />
        </div>
      ) : !t ? null : (
        <div className="space-y-4 p-4">
          <Badge variant={ticketStatusVariant[t.status]}>{ticketStatusLabel[t.status]}</Badge>

          {/* ETA card (Grab-style) */}
          {!isDone && (etaMin !== null || t.assignedTeam) ? (
            <div className="flex items-center gap-3.5 rounded-[18px] border border-[#CBE9DC] bg-mint-soft p-4">
              <span className="text-[30px] font-extrabold tabular-nums text-[#0f6b4c]">
                {etaMin !== null ? `${etaMin}'` : "—"}
              </span>
              <div>
                <b className="text-[14px]">
                  {etaMin !== null ? "Đội kỹ thuật đang tới" : "Đang xử lý"}
                </b>
                <p className="text-[12.5px] text-muted-foreground">
                  {t.assignedTeam ?? ""}
                  {t.eta ? ` · dự kiến ${formatDate(t.eta)}` : ""}
                </p>
              </div>
            </div>
          ) : null}

          {/* Timeline */}
          <h2 className="px-1 text-sm font-bold">Tiến trình xử lý</h2>
          <div className="rounded-[18px] border border-line bg-card p-4 shadow-[0_6px_22px_rgba(10,42,56,.10)]">
            <div className="pl-2 pt-1.5">
              {t.timeline.map((e, i) => {
                const done = i < lastIdx;
                const now = i === lastIdx && !isDone;
                return (
                  <div key={i} className="relative flex gap-3.5 pb-5 last:pb-0">
                    {i < lastIdx ? (
                      <span className="absolute bottom-0 left-[11px] top-6 w-0.5 bg-line" />
                    ) : null}
                    <span
                      className={cn(
                        "relative z-10 flex h-6 w-6 items-center justify-center rounded-full border-2",
                        done
                          ? "border-mint bg-mint text-white"
                          : now
                            ? "border-aqua bg-aqua text-white shadow-[0_0_0_4px_var(--aqua-soft)]"
                            : "border-line bg-foam text-muted-foreground",
                      )}
                    >
                      {done ? <Check className="h-3.5 w-3.5" /> : now ? <Clock className="h-3 w-3" /> : null}
                    </span>
                    <div className="pt-0.5">
                      <b className={cn("text-[14px]", now && "text-deep")}>
                        {ticketStatusLabel[e.status]}
                      </b>
                      <p className="text-[12px] text-muted-foreground">
                        {formatDate(e.timestamp)}
                        {e.actor ? ` · ${e.actor}` : ""}
                      </p>
                      {e.description ? <p className="mt-0.5 text-[13px]">{e.description}</p> : null}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2.5">
            <Link
              href="/contact"
              className="flex h-[52px] flex-1 items-center justify-center gap-2 rounded-[14px] border-[1.5px] border-line font-extrabold text-deep active:scale-[0.99]"
            >
              <PhoneCall className="h-4 w-4" /> Gọi tổng đài
            </Link>
            <Link
              href="/chat"
              className="flex h-[52px] flex-1 items-center justify-center gap-2 rounded-[14px] border-[1.5px] border-line font-extrabold text-deep active:scale-[0.99]"
            >
              <MessageSquare className="h-4 w-4" /> Nhắn cho đội
            </Link>
          </div>

          {/* Feedback */}
          {isDone ? (
            <div className="rounded-[18px] border border-line bg-card p-4 shadow-[0_6px_22px_rgba(10,42,56,.10)]">
              <h2 className="mb-3 px-1 text-sm font-bold">Đánh giá chất lượng xử lý</h2>
              {submitted ? (
                <p className="text-sm text-muted-foreground">Cảm ơn bạn đã đánh giá!</p>
              ) : (
                <div className="space-y-3">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button key={n} type="button" onClick={() => setScore(n)} className="p-0.5">
                        <Star
                          className={cn(
                            "h-7 w-7",
                            score >= n ? "fill-amber-400 text-amber-400" : "text-muted-foreground",
                          )}
                        />
                      </button>
                    ))}
                  </div>
                  <Textarea
                    rows={2}
                    maxLength={1000}
                    placeholder="Nhận xét (không bắt buộc)"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  />
                  <Button
                    type="button"
                    disabled={score === 0 || submitFeedback.isPending}
                    onClick={() =>
                      submitFeedback.mutate(
                        { trackingId, score, ...(comment ? { comment } : {}) },
                        { onSuccess: () => setSubmitted(true) },
                      )
                    }
                    className="h-[48px] w-full rounded-[14px] bg-deep font-extrabold"
                  >
                    {submitFeedback.isPending ? "Đang gửi..." : "Gửi đánh giá"}
                  </Button>
                </div>
              )}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
