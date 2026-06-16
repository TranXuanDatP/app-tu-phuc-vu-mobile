"use client";

import { Suspense, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertTriangle, Bell, Check } from "lucide-react";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Skeleton,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui";
import { EmptyState, ErrorState } from "@/components/state";
import {
  useAcknowledgeAlert,
  useActiveAlerts,
  useAlertHistory,
  useNotificationHistory,
  useNotificationPreferences,
  useUpdateNotificationPreferences,
} from "@/features/communication/queries";
import {
  alertStatusVariant,
  alertTypeLabel,
  channelLabel,
  deliveryStatusLabel,
  notificationTypeLabel,
  severityLabel,
} from "@/features/communication/labels";
import { formatDate, formatDateTime } from "@/lib/utils";
import type { NotificationChannel } from "@/lib/types/entities";

export default function NotificationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Thông báo</h1>
        <p className="text-sm text-muted-foreground">
          Cảnh báo khu vực, lịch sử thông báo và tuỳ chọn kênh
        </p>
      </div>
      <Tabs defaultValue="alerts">
        <TabsList>
          <TabsTrigger value="alerts">Cảnh báo khu vực</TabsTrigger>
          <TabsTrigger value="history">Lịch sử thông báo</TabsTrigger>
          <TabsTrigger value="prefs">Tuỳ chọn</TabsTrigger>
        </TabsList>

        <TabsContent value="alerts" className="mt-4 space-y-6">
          <ActiveAlertsSection />
          <AlertHistorySection />
        </TabsContent>
        <TabsContent value="history" className="mt-4">
          <Suspense fallback={<Skeleton className="h-48 w-full" />}>
            <HistorySection />
          </Suspense>
        </TabsContent>
        <TabsContent value="prefs" className="mt-4">
          <PreferencesSection />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ActiveAlertsSection() {
  const { data, isLoading, isError, refetch } = useActiveAlerts();
  const acknowledge = useAcknowledgeAlert();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <AlertTriangle className="h-4 w-4 text-amber-500" /> Cảnh báo đang hoạt động
        </CardTitle>
        <CardDescription>Các sự cố đang ảnh hưởng đến khu vực của bạn</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-32 w-full" />
        ) : isError ? (
          <ErrorState onRetry={() => refetch()} />
        ) : !data?.alerts.length ? (
          <EmptyState title="Không có cảnh báo nào" description="Khu vực của bạn hiện không có sự cố." />
        ) : (
          <div className="space-y-3">
            {data.alerts.map((a) => (
              <div key={a.id} className="rounded-lg border p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Badge variant={alertStatusVariant[a.status]}>
                      {alertTypeLabel[a.type]}
                    </Badge>
                    {a.severity && (
                      <Badge variant="secondary">Mức: {severityLabel[a.severity]}</Badge>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={acknowledge.isPending}
                    onClick={() => acknowledge.mutate(a.id)}
                    className="gap-1"
                  >
                    <Check className="h-3.5 w-3.5" /> Đã biết
                  </Button>
                </div>
                <p className="mt-2 text-sm">{a.description}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Khu vực: {a.affectedArea} · Dự kiến {formatDate(a.expectedStartTime)} – {formatDate(a.expectedEndTime)}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function AlertHistorySection() {
  const { data, isLoading, isError, refetch } = useAlertHistory({ page: 1, pageSize: 10 });
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Lịch sử cảnh báo</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-32 w-full" />
        ) : isError ? (
          <ErrorState onRetry={() => refetch()} />
        ) : !data?.alerts.length ? (
          <p className="text-sm text-muted-foreground">Chưa có cảnh báo trong lịch sử.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Loại</TableHead>
                <TableHead>Khu vực</TableHead>
                <TableHead>Thời gian</TableHead>
                <TableHead>Trạng thái</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.alerts.map((a) => (
                <TableRow key={a.id}>
                  <TableCell>{alertTypeLabel[a.type]}</TableCell>
                  <TableCell className="max-w-[200px] truncate">{a.affectedArea}</TableCell>
                  <TableCell>{formatDate(a.startTime)}</TableCell>
                  <TableCell>
                    <Badge variant={alertStatusVariant[a.status]}>{a.status}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

function HistorySection() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const channel = searchParams.get("channel") || "all";

  const params = useMemo(
    () => ({
      page: 1,
      pageSize: 15,
      ...(channel !== "all" ? { channel: channel as NotificationChannel } : {}),
    }),
    [channel],
  );
  const { data, isLoading, isError, refetch } = useNotificationHistory(params);

  function setChannel(v: string) {
    const p = new URLSearchParams(searchParams.toString());
    if (v === "all") p.delete("channel");
    else p.set("channel", v);
    router.replace(`/notifications?${p.toString()}`);
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base">Lịch sử thông báo</CardTitle>
        <Select value={channel} onValueChange={setChannel}>
          <SelectTrigger className="w-44"><SelectValue placeholder="Kênh" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả kênh</SelectItem>
            {(Object.keys(channelLabel) as NotificationChannel[]).map((c) => (
              <SelectItem key={c} value={c}>{channelLabel[c]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-48 w-full" />
        ) : isError ? (
          <ErrorState onRetry={() => refetch()} />
        ) : !data?.notifications.length ? (
          <EmptyState title="Chưa có thông báo nào" />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nội dung</TableHead>
                <TableHead>Loại</TableHead>
                <TableHead>Kênh</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Thời gian</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.notifications.map((n) => (
                <TableRow key={n.id}>
                  <TableCell className="max-w-[260px]">{n.contentSummary}</TableCell>
                  <TableCell>{notificationTypeLabel[n.type] ?? n.type}</TableCell>
                  <TableCell>{channelLabel[n.channel]}</TableCell>
                  <TableCell>
                    <Badge variant={n.deliveryStatus === "failed" ? "destructive" : "secondary"}>
                      {deliveryStatusLabel[n.deliveryStatus]}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDateTime(n.timestamp)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

function PreferencesSection() {
  const { data, isLoading, isError, refetch } = useNotificationPreferences();
  const update = useUpdateNotificationPreferences();

  function toggle(channel: NotificationChannel, enabled: boolean) {
    if (!data) return;
    update.mutate({
      channels: data.channels.map((c) => ({ channel: c.channel, enabled: c.channel === channel ? enabled : c.enabled })),
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Bell className="h-4 w-4" /> Kênh nhận thông báo
        </CardTitle>
        <CardDescription>Bật/tắt các kênh thông báo (trừ kênh quan trọng bắt buộc)</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-32 w-full" />
        ) : isError ? (
          <ErrorState onRetry={() => refetch()} />
        ) : (
          <div className="divide-y">
            {data?.channels.map((c) => (
              <div key={c.channel} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium">{channelLabel[c.channel]}</p>
                  {c.isCritical && (
                    <p className="text-xs text-muted-foreground">Kênh quan trọng — không thể tắt</p>
                  )}
                </div>
                <Switch
                  checked={c.enabled}
                  disabled={c.isCritical || update.isPending}
                  onCheckedChange={(v) => toggle(c.channel, v)}
                />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
