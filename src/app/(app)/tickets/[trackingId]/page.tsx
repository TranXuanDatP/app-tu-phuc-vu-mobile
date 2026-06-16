"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Star } from "lucide-react";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Skeleton,
  Textarea,
} from "@/components/ui";
import { ErrorState } from "@/components/state";
import { useSubmitFeedback, useTicketStatus } from "@/features/tickets/queries";
import { ticketStatusLabel, ticketStatusVariant } from "@/features/tickets/labels";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

export default function TicketTrackingPage({
  params,
}: {
  params: Promise<{ trackingId: string }>;
}) {
  const { trackingId } = use(params);
  const router = useRouter();
  const ticket = useTicketStatus(trackingId);
  const submitFeedback = useSubmitFeedback();
  const [score, setScore] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" onClick={() => router.back()} className="gap-1">
        <ArrowLeft className="h-4 w-4" /> Quay lại
      </Button>

      {ticket.isLoading ? (
        <Skeleton className="h-96 w-full" />
      ) : ticket.isError ? (
        <Card><CardContent><ErrorState onRetry={() => ticket.refetch()} /></CardContent></Card>
      ) : !ticket.data ? null : (
        <>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-semibold tracking-tight">
                {ticket.data.trackingId}
              </h1>
              <Badge variant={ticketStatusVariant[ticket.data.status]}>
                {ticketStatusLabel[ticket.data.status]}
              </Badge>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Tạo ngày {formatDate(ticket.data.createdAt)} · Cập nhật {formatDate(ticket.data.updatedAt)}
            </p>
            {ticket.data.assignedTeam && (
              <p className="text-sm text-muted-foreground">Đội xử lý: {ticket.data.assignedTeam}</p>
            )}
            {ticket.data.eta && (
              <p className="text-sm text-muted-foreground">Dự kiến: {formatDate(ticket.data.eta)}</p>
            )}
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Tiến trình xử lý</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="relative space-y-5 border-l pl-6">
                {ticket.data.timeline.map((e, i) => (
                  <li key={i} className="relative">
                    <span
                      className={cn(
                        "absolute -left-[27px] top-1 h-3.5 w-3.5 rounded-full border-2 border-background",
                        i === ticket.data!.timeline.length - 1 ? "bg-primary" : "bg-muted-foreground",
                      )}
                    />
                    <div className="flex items-center gap-2">
                      <Badge variant={ticketStatusVariant[e.status]}>
                        {ticketStatusLabel[e.status]}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{formatDate(e.timestamp)}</span>
                    </div>
                    {e.description && <p className="mt-1 text-sm">{e.description}</p>}
                    {e.actor && <p className="text-xs text-muted-foreground">Bởi: {e.actor}</p>}
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>

          {ticket.data.status === "resolved" || ticket.data.status === "closed" ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Đánh giá chất lượng xử lý</CardTitle>
              </CardHeader>
              <CardContent>
                {submitted ? (
                  <p className="text-sm text-muted-foreground">Bạn đã đánh giá phản ánh này. Cảm ơn!</p>
                ) : (
                  <div className="space-y-3">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => setScore(n)}
                          onMouseEnter={() => setHover(n)}
                          onMouseLeave={() => setHover(0)}
                          className="p-0.5"
                        >
                          <Star
                            className={cn(
                              "h-7 w-7 transition-colors",
                              (hover || score) >= n
                                ? "fill-amber-400 text-amber-400"
                                : "text-muted-foreground",
                            )}
                          />
                        </button>
                      ))}
                    </div>
                    <Textarea
                      rows={2}
                      maxLength={1000}
                      placeholder="Để lại nhận xét (không bắt buộc)"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                    />
                    <Button
                      disabled={score === 0 || submitFeedback.isPending}
                      onClick={() =>
                        submitFeedback.mutate(
                          { trackingId, score, ...(comment ? { comment } : {}) },
                          { onSuccess: () => setSubmitted(true) },
                        )
                      }
                    >
                      {submitFeedback.isPending ? "Đang gửi..." : "Gửi đánh giá"}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : null}
        </>
      )}
    </div>
  );
}
