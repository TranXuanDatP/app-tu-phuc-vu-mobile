"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Plus } from "lucide-react";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Skeleton,
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
import { CreateTicketForm } from "@/features/tickets/create-ticket-form";
import { useTicketHistory } from "@/features/tickets/queries";
import { incidentTypeLabel, ticketStatusLabel, ticketStatusVariant } from "@/features/tickets/labels";
import { formatDate } from "@/lib/utils";
import type { TicketStatus } from "@/lib/types/entities";

export default function TicketsPage() {
  return (
    <Tabs defaultValue="history">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Phản ánh sự cố</h1>
        <p className="text-sm text-muted-foreground">
          Gửi và theo dõi các phản ánh về dịch vụ cấp nước
        </p>
      </div>
      <TabsList>
        <TabsTrigger value="history">Phản ánh của tôi</TabsTrigger>
        <TabsTrigger value="create">
          <Plus className="h-4 w-4" /> Tạo phản ánh
        </TabsTrigger>
      </TabsList>

      <TabsContent value="history" className="mt-4">
        <Suspense fallback={<Skeleton className="h-48 w-full" />}>
          <TicketHistoryTab />
        </Suspense>
      </TabsContent>
      <TabsContent value="create" className="mt-4">
        <div className="max-w-2xl">
          <CreateTicketForm />
        </div>
      </TabsContent>
    </Tabs>
  );
}

function TicketHistoryTab() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const status = (searchParams.get("status") as TicketStatus | "all") || "all";
  const page = Number(searchParams.get("page") ?? "1");
  const { data, isLoading, isError, refetch } = useTicketHistory({
    status: status === "all" ? undefined : status,
    page,
    pageSize: 10,
  });

  function setStatus(v: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (v === "all") params.delete("status");
    else params.set("status", v);
    params.delete("page");
    const qs = params.toString();
    router.replace(qs ? `/tickets?${qs}` : "/tickets");
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base">Lịch sử phản ánh {data ? `(${data.total})` : ""}</CardTitle>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            {(Object.keys(ticketStatusLabel) as TicketStatus[]).map((s) => (
              <SelectItem key={s} value={s}>{ticketStatusLabel[s]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-48 w-full" />
        ) : isError ? (
          <ErrorState onRetry={() => refetch()} />
        ) : !data?.tickets.length ? (
          <EmptyState title="Chưa có phản ánh nào" description="Chuyển sang tab 'Tạo phản ánh' để gửi mới." />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã theo dõi</TableHead>
                <TableHead>Loại</TableHead>
                <TableHead>Ngày tạo</TableHead>
                <TableHead>Cập nhật</TableHead>
                <TableHead>Trạng thái</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.tickets.map((t) => (
                <TableRow key={t.trackingId}>
                  <TableCell className="font-medium">
                    <Link href={`/tickets/${t.trackingId}`} className="hover:underline">
                      {t.trackingId}
                    </Link>
                  </TableCell>
                  <TableCell>{incidentTypeLabel[t.type]}</TableCell>
                  <TableCell>{formatDate(t.createdAt)}</TableCell>
                  <TableCell>{formatDate(t.updatedAt)}</TableCell>
                  <TableCell>
                    <Badge variant={ticketStatusVariant[t.status]}>
                      {ticketStatusLabel[t.status]}
                    </Badge>
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
