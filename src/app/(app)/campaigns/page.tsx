"use client";

import { AppBar } from "@/components/layout/app-bar";
import { Skeleton } from "@/components/ui";
import { EmptyState, ErrorState } from "@/components/state";
import { useActiveCampaigns, useMarketingMessages } from "@/features/campaign/queries";
import { formatDate } from "@/lib/utils";

export default function CampaignPage() {
  const campaigns = useActiveCampaigns();
  const messages = useMarketingMessages();

  return (
    <div className="pb-4">
      <AppBar title="Ưu đãi & thông điệp" sub="Chiến dịch + tin nhắn marketing" />

      <div className="space-y-4 p-4">
        <section>
          <h2 className="mb-2 px-1 text-sm font-bold">Chiến dịch đang chạy</h2>
          <div className="space-y-2.5">
            {campaigns.isLoading ? (
              <Skeleton className="h-20 w-full" />
            ) : campaigns.isError ? (
              <ErrorState onRetry={() => campaigns.refetch()} />
            ) : !campaigns.data?.campaigns.length ? (
              <EmptyState title="Chưa có chiến dịch" />
            ) : (
              campaigns.data.campaigns.map((c) => (
                <div
                  key={c.campaignId}
                  className="rounded-[18px] border border-line bg-gradient-to-br from-aqua-soft/60 to-transparent p-4 shadow-[0_6px_22px_rgba(10,42,56,.10)]"
                >
                  <b className="text-[15px] font-extrabold text-deep">{c.title}</b>
                  <p className="mt-1 text-[12.5px] text-muted-foreground">
                    {c.audience} · {formatDate(c.startsAt)} → {formatDate(c.endsAt)}
                  </p>
                </div>
              ))
            )}
          </div>
        </section>

        <section>
          <h2 className="mb-2 px-1 text-sm font-bold">Tin nhắn</h2>
          <div className="overflow-hidden rounded-[18px] border border-line bg-card shadow-[0_6px_22px_rgba(10,42,56,.10)]">
            {messages.isLoading ? (
              <Skeleton className="h-24 w-full" />
            ) : messages.isError ? (
              <ErrorState onRetry={() => messages.refetch()} />
            ) : !messages.data?.messages.length ? (
              <EmptyState title="Chưa có tin nhắn" />
            ) : (
              messages.data.messages.map((m, i) => (
                <div
                  key={m.id}
                  className={`px-4 py-3.5 ${i < messages.data!.messages.length - 1 ? "border-b border-line" : ""}`}
                >
                  <div className="flex items-center justify-between">
                    <b className="text-[14px]">{m.title}</b>
                    {!m.read ? (
                      <span className="h-2 w-2 rounded-full bg-coral" />
                    ) : null}
                  </div>
                  <p className="mt-0.5 text-[12.5px] leading-snug text-muted-foreground">{m.body}</p>
                  <p className="mt-1 text-[11px] text-muted-foreground">{formatDate(m.sentAt)}</p>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
