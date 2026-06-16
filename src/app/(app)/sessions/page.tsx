"use client";

import { Activity, Clock } from "lucide-react";
import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Skeleton,
} from "@/components/ui";
import { ErrorState } from "@/components/state";
import { useSessionDetail, useSessionEvents } from "@/features/session/queries";
import {
  eventDescription,
  eventLabel,
  sessionChannelLabel,
} from "@/features/session/labels";
import { formatDateTime } from "@/lib/utils";

export default function SessionsPage() {
  const detail = useSessionDetail();
  const events = useSessionEvents({ page: 1, pageSize: 20 });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Phiên tương tác</h1>
        <p className="text-sm text-muted-foreground">
          Hành trình tương tác của bạn với hệ thống
        </p>
      </div>

      {/* Current session */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Clock className="h-4 w-4" /> Phiên hiện tại
          </CardTitle>
        </CardHeader>
        <CardContent>
          {detail.isLoading ? (
            <Skeleton className="h-24 w-full" />
          ) : detail.isError ? (
            <ErrorState onRetry={() => detail.refetch()} />
          ) : !detail.data?.session ? (
            <p className="text-sm text-muted-foreground">Không có phiên đang hoạt động.</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Stat label="Kênh" value={sessionChannelLabel[detail.data.session.channel]} />
              <Stat label="Sự kiện trong phiên" value={String(detail.data.session.eventCount)} />
              <Stat label="Bắt đầu" value={formatDateTime(detail.data.session.createdAt)} />
              <Stat label="Cập nhật" value={formatDateTime(detail.data.session.updatedAt)} />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Event history */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Activity className="h-4 w-4" /> Lịch sử sự kiện
          </CardTitle>
          <CardDescription>Các tương tác gần đây theo thời gian</CardDescription>
        </CardHeader>
        <CardContent>
          {events.isLoading ? (
            <Skeleton className="h-64 w-full" />
          ) : events.isError ? (
            <ErrorState onRetry={() => events.refetch()} />
          ) : !events.data?.events.length ? (
            <p className="text-sm text-muted-foreground">Chưa có sự kiện nào được ghi nhận.</p>
          ) : (
            <ol className="relative space-y-5 border-l pl-6">
              {events.data.events.map((e) => (
                <li key={e.id} className="relative">
                  <span className="absolute -left-[27px] top-1 h-3 w-3 rounded-full bg-primary" />
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary">{eventLabel(e.type)}</Badge>
                    <Badge variant="outline">{sessionChannelLabel[e.channel]}</Badge>
                    <span className="text-xs text-muted-foreground">{formatDateTime(e.timestamp)}</span>
                  </div>
                  {eventDescription(e) && (
                    <p className="mt-1 text-xs text-muted-foreground">{eventDescription(e)}</p>
                  )}
                </li>
              ))}
            </ol>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-muted px-4 py-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-0.5 font-medium">{value}</p>
    </div>
  );
}
