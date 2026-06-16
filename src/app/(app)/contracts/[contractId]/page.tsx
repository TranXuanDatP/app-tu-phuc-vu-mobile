"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Download } from "lucide-react";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui";
import { ErrorState } from "@/components/state";
import {
  useContract,
  useContractVersions,
  fetchContractPdf,
} from "@/features/contracts/queries";
import { useApplicableFees, useTariffPlan } from "@/features/billing/queries";
import {
  contractStatusLabel,
  contractStatusVariant,
  subscriptionLabel,
} from "@/features/contracts/labels";
import { feeTypeLabel, tariffCustomerTypeLabel } from "@/features/billing/labels";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function ContractDetailPage({
  params,
}: {
  params: Promise<{ contractId: string }>;
}) {
  const { contractId } = use(params);
  const router = useRouter();
  const contract = useContract(contractId);
  const versions = useContractVersions(contractId);
  const tariffPlan = useTariffPlan(contractId);
  const fees = useApplicableFees(contractId);
  const [downloading, setDownloading] = useState(false);

  async function downloadPdf() {
    setDownloading(true);
    try {
      const pdf = await fetchContractPdf(contractId);
      if (pdf.downloadUrl) window.open(pdf.downloadUrl, "_blank");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" onClick={() => router.back()} className="gap-1">
        <ArrowLeft className="h-4 w-4" /> Quay lại
      </Button>

      {contract.isLoading ? (
        <Skeleton className="h-96 w-full" />
      ) : contract.isError ? (
        <Card><CardContent><ErrorState onRetry={() => contract.refetch()} /></CardContent></Card>
      ) : !contract.data ? null : (
        <>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-semibold tracking-tight">
                  Hợp đồng {contract.data.contractId}
                </h1>
                <Badge variant={contractStatusVariant[contract.data.status]}>
                  {contractStatusLabel[contract.data.status]}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{contract.data.address}</p>
            </div>
            <Button variant="outline" onClick={downloadPdf} disabled={downloading} className="gap-1">
              <Download className="h-4 w-4" />
              {downloading ? "Đang tải..." : "Tải PDF"}
            </Button>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Thông tin hợp đồng</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <Row label="Loại thuê bao" value={subscriptionLabel[contract.data.subscriptionType]} />
                <Row label="Đồng hồ" value={contract.data.meterId ?? "—"} />
                <Row label="Định mức nước" value={contract.data.waterQuota != null ? `${contract.data.waterQuota} m³` : "—"} />
                <Row label="Ngày bắt đầu" value={formatDate(contract.data.startDate)} />
                <Row label="Ngày kết thúc" value={contract.data.endDate ? formatDate(contract.data.endDate) : "Không giới hạn"} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Điều khoản giá</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <Row label="Giá cơ bản" value={formatCurrency(contract.data.pricingTerms.basePrice)} />
                <Row label="Đơn vị tiền" value={contract.data.pricingTerms.currency} />
                <Row label="Chu kỳ tính phí" value={contract.data.pricingTerms.billingCycle} />
                {contract.data.specialConditions && contract.data.specialConditions.length > 0 && (
                  <div className="space-y-1 pt-2">
                    <p className="font-medium">Điều kiện đặc biệt</p>
                    <ul className="list-inside list-disc space-y-1 text-muted-foreground">
                      {contract.data.specialConditions.map((c, i) => (
                        <li key={i}>{c}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Lịch sử phiên bản</CardTitle>
            </CardHeader>
            <CardContent>
              {versions.isLoading ? (
                <Skeleton className="h-32 w-full" />
              ) : versions.isError ? (
                <ErrorState onRetry={() => versions.refetch()} />
              ) : !versions.data?.versions.length ? (
                <p className="text-sm text-muted-foreground">Chưa có phiên bản nào.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Phiên bản</TableHead>
                      <TableHead>Mô tả thay đổi</TableHead>
                      <TableHead>Ngày hiệu lực</TableHead>
                      <TableHead>Thay đổi bởi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {versions.data.versions.map((v) => (
                      <TableRow key={v.versionId}>
                        <TableCell className="font-medium">v{v.versionNumber}</TableCell>
                        <TableCell>{v.changeDescription}</TableCell>
                        <TableCell>{formatDate(v.effectiveDate)}</TableCell>
                        <TableCell>{v.changedBy}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Tariff plan + applicable fees */}
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Biểu giá áp dụng</CardTitle>
              </CardHeader>
              <CardContent>
                {tariffPlan.isLoading ? (
                  <Skeleton className="h-32 w-full" />
                ) : tariffPlan.isError || !tariffPlan.data ? (
                  <p className="text-sm text-muted-foreground">Không có thông tin biểu giá.</p>
                ) : (
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium">{tariffPlan.data.planName}</span>
                      <Badge variant="secondary">
                        {tariffCustomerTypeLabel[tariffPlan.data.customerType]}
                      </Badge>
                    </div>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Bậc</TableHead>
                          <TableHead>Khoảng (m³)</TableHead>
                          <TableHead className="text-right">Đơn giá</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {tariffPlan.data.tiers.map((t) => (
                          <TableRow key={t.tier}>
                            <TableCell>{t.tier}</TableCell>
                            <TableCell>
                              {t.fromVolume}
                              {t.toVolume == null ? "+" : `–${t.toVolume}`}
                            </TableCell>
                            <TableCell className="text-right">{formatCurrency(t.pricePerM3)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    <p className="text-xs text-muted-foreground">
                      Hiệu lực {formatDate(tariffPlan.data.effectiveFrom)}
                      {tariffPlan.data.effectiveTo ? ` – ${formatDate(tariffPlan.data.effectiveTo)}` : " trở đi"}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Phí áp dụng</CardTitle>
              </CardHeader>
              <CardContent>
                {fees.isLoading ? (
                  <Skeleton className="h-32 w-full" />
                ) : fees.isError || !fees.data ? (
                  <p className="text-sm text-muted-foreground">Không có thông tin phí.</p>
                ) : (
                  <div className="space-y-2">
                    {fees.data.fees.map((f) => (
                      <Row
                        key={f.feeType}
                        label={f.feeName ?? feeTypeLabel[f.feeType]}
                        value={
                          f.isPercentage
                            ? `${f.rate}%`
                            : formatCurrency(f.rate)
                        }
                      />
                    ))}
                    <div className="flex justify-between border-t pt-2">
                      <span className="text-muted-foreground">Thuế GTGT (VAT)</span>
                      <span className="font-medium">{fees.data.vatPercentage}%</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}
