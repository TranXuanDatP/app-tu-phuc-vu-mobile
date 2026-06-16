"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import { FileText } from "lucide-react";
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
} from "@/components/ui";
import { EmptyState, ErrorState } from "@/components/state";
import { useContracts } from "@/features/contracts/queries";
import {
  contractStatusLabel,
  contractStatusVariant,
  subscriptionLabel,
} from "@/features/contracts/labels";
import { formatCurrency, formatDate, formatNumber } from "@/lib/utils";
import type { ContractStatus } from "@/lib/types/entities";

export default function ContractsPage() {
  return (
    <Suspense fallback={<div className="h-48" />}>
      <ContractsPageContent />
    </Suspense>
  );
}

function ContractsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const status = (searchParams.get("status") as ContractStatus | "all") || "all";
  const { data, isLoading, isError, refetch } = useContracts({
    status: status === "all" ? undefined : status,
  });

  function setStatus(v: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (v === "all") params.delete("status");
    else params.set("status", v);
    const qs = params.toString();
    router.replace(qs ? `/contracts?${qs}` : "/contracts");
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Hợp đồng cấp nước</h1>
          <p className="text-sm text-muted-foreground">
            Các hợp đồng dịch vụ cấp nước của bạn
          </p>
        </div>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value="active">Còn hiệu lực</SelectItem>
            <SelectItem value="expired">Hết hạn</SelectItem>
            <SelectItem value="terminated">Đã chấm dứt</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Danh sách hợp đồng {data ? `(${data.totalCount})` : ""}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-48 w-full" />
          ) : isError ? (
            <ErrorState onRetry={() => refetch()} />
          ) : !data?.contracts.length ? (
            <EmptyState title="Không có hợp đồng" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mã hợp đồng</TableHead>
                  <TableHead>Địa chỉ</TableHead>
                  <TableHead>Loại</TableHead>
                  <TableHead>Đồng hồ</TableHead>
                  <TableHead>Ngày bắt đầu</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.contracts.map((c) => (
                  <TableRow key={c.contractId}>
                    <TableCell className="font-medium">
                      <Link href={`/contracts/${c.contractId}`} className="hover:underline">
                        {c.contractId}
                      </Link>
                    </TableCell>
                    <TableCell className="max-w-[220px] truncate" title={c.address}>
                      {c.address}
                    </TableCell>
                    <TableCell>{subscriptionLabel[c.subscriptionType]}</TableCell>
                    <TableCell>{c.meterId ?? "—"}</TableCell>
                    <TableCell>{formatDate(c.startDate)}</TableCell>
                    <TableCell>
                      <Badge variant={contractStatusVariant[c.status]}>
                        {contractStatusLabel[c.status]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/contracts/${c.contractId}`}>
                          <FileText className="h-4 w-4" />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
