"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Wrench } from "lucide-react";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Skeleton,
} from "@/components/ui";
import { ErrorState } from "@/components/state";
import { useCalibration, useMeterHistory } from "@/features/meters/queries";
import {
  calibrationLabel,
  calibrationVariant,
  historyEventLabel,
} from "@/features/meters/labels";
import { formatDate } from "@/lib/utils";

export default function MeterDetailPage({
  params,
}: {
  params: Promise<{ meterId: string }>;
}) {
  const { meterId } = use(params);
  const router = useRouter();
  const calibration = useCalibration(meterId);
  const history = useMeterHistory(meterId);

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" onClick={() => router.back()} className="gap-1">
        <ArrowLeft className="h-4 w-4" /> Quay lại
      </Button>

      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Đồng hồ {meterId}</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Calibration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Wrench className="h-4 w-4" /> Tình trạng hiệu chuẩn
            </CardTitle>
          </CardHeader>
          <CardContent>
            {calibration.isLoading ? (
              <Skeleton className="h-32 w-full" />
            ) : calibration.isError ? (
              <ErrorState onRetry={() => calibration.refetch()} />
            ) : !calibration.data ? null : (
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Trạng thái</span>
                  <Badge variant={calibrationVariant[calibration.data.status]}>
                    {calibrationLabel[calibration.data.status]}
                  </Badge>
                </div>
                {calibration.data.isWarning && (
                  <p className="rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-800">
                    ⚠️ Hiệu chuẩn sắp hoặc đã hết hạn — cần kiểm định lại.
                  </p>
                )}
                <InfoRow label="Lần hiệu chuẩn cuối" value={formatDate(calibration.data.lastCalibrationDate)} />
                <InfoRow label="Lần kiểm định tiếp theo" value={formatDate(calibration.data.nextCalibrationDate)} />
                <InfoRow label="Số chứng chỉ" value={calibration.data.certificateNumber ?? "—"} />
              </div>
            )}
          </CardContent>
        </Card>

        {/* History */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Lịch sử đồng hồ</CardTitle>
          </CardHeader>
          <CardContent>
            {history.isLoading ? (
              <Skeleton className="h-48 w-full" />
            ) : history.isError ? (
              <ErrorState onRetry={() => history.refetch()} />
            ) : !history.data?.entries.length ? (
              <p className="text-sm text-muted-foreground">Chưa có sự kiện nào.</p>
            ) : (
              <ol className="relative space-y-4 border-l pl-4">
                {history.data.entries.map((e, i) => (
                  <li key={i} className="relative">
                    <span className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full bg-primary" />
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{historyEventLabel[e.eventType]}</Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(e.eventDate)}
                      </span>
                    </div>
                    <p className="mt-1 text-sm">{e.description}</p>
                    <p className="text-xs text-muted-foreground">Thực hiện bởi: {e.performedBy}</p>
                  </li>
                ))}
              </ol>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}
