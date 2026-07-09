"use client";

import { useState } from "react";
import { Tag } from "lucide-react";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Skeleton,
} from "@/components/ui";
import { EmptyState, ErrorState } from "@/components/state";
import { StatusBadge } from "@/components/status-badge";
import {
  useCheckEligibility,
  useSegments,
} from "@/features/segmentation/queries";
import {
  customerTypeLabel,
  valueSegmentLabel,
  valueSegmentTone,
} from "@/features/segmentation/labels";

export default function SegmentsPage() {
  const segments = useSegments();
  const [campaignId, setCampaignId] = useState("CAMP-2026-1");
  const [submitted, setSubmitted] = useState("CAMP-2026-1");
  const eligibility = useCheckEligibility(submitted);

  return (
    <div className="space-y-6">
      <div className="fade-in-up">
        <h1 className="text-2xl font-semibold tracking-tight">Phân khúc & Ưu đãi</h1>
        <p className="text-sm text-muted-foreground">
          Hồ sơ phân khúc và kiểm tra điều kiện chiến dịch
        </p>
      </div>

      {segments.isLoading ? (
        <Skeleton className="h-40 w-full" />
      ) : segments.isError ? (
        <ErrorState onRetry={() => segments.refetch()} />
      ) : !segments.data ? (
        <EmptyState />
      ) : (
        <Card
          className="glass fade-in-up relative overflow-hidden"
          style={{ animationDelay: "60ms" }}
        >
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-violet-500/15 to-transparent" />
          <CardHeader className="relative">
            <CardTitle className="text-base">Phân khúc khách hàng</CardTitle>
            <CardDescription>
              {customerTypeLabel[segments.data.segment.customerType]} · Khu vực{" "}
              {segments.data.segment.area}
            </CardDescription>
          </CardHeader>
          <CardContent className="relative space-y-4">
            <StatusBadge
              tone={valueSegmentTone[segments.data.segment.valueSegment]}
              label={valueSegmentLabel[segments.data.segment.valueSegment]}
            />
            {segments.data.segment.behaviorTags.length ? (
              <div className="flex flex-wrap gap-2">
                {segments.data.segment.behaviorTags.map((t) => (
                  <Badge key={t} variant="secondary" className="gap-1">
                    <Tag className="h-3 w-3" />
                    {t}
                  </Badge>
                ))}
              </div>
            ) : null}
          </CardContent>
        </Card>
      )}

      {/* Eligibility check */}
      <Card className="fade-in-up" style={{ animationDelay: "120ms" }}>
        <CardHeader>
          <CardTitle className="text-base">Kiểm tra điều kiện chiến dịch</CardTitle>
          <CardDescription>Nhập mã chiến dịch để kiểm tra</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              setSubmitted(campaignId);
            }}
          >
            <Input
              value={campaignId}
              onChange={(e) => setCampaignId(e.target.value)}
              placeholder="CAMP-2026-1"
            />
            <Button type="submit">Kiểm tra</Button>
          </form>
          {eligibility.isLoading ? (
            <Skeleton className="h-16 w-full" />
          ) : eligibility.isError ? (
            <ErrorState onRetry={() => eligibility.refetch()} />
          ) : eligibility.data ? (
            <div className="space-y-2 rounded-lg border p-4">
              <div className="flex items-center gap-2">
                <StatusBadge
                  tone={eligibility.data.eligible ? "success" : "warning"}
                  label={
                    eligibility.data.eligible
                      ? "Đủ điều kiện"
                      : "Chưa đủ điều kiện"
                  }
                />
                <span className="text-sm text-muted-foreground">
                  {eligibility.data.campaignId}
                </span>
              </div>
              {eligibility.data.reasons.length ? (
                <ul className="list-disc pl-5 text-sm text-muted-foreground">
                  {eligibility.data.reasons.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
