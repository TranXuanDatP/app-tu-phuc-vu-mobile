"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
} from "@/components/ui";
import { useCreatePayment, useBatchPayment } from "./mutations";
import { formatCurrency } from "@/lib/utils";
import type { CreatePaymentResponse, CreateBatchPaymentResponse, PaymentMethod } from "@/lib/types/entities";

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Single invoice or multiple invoices (batch). */
  invoiceIds: string[];
  /** Total to display before initiating. */
  total?: number;
}

const METHOD_LABEL: Record<PaymentMethod, string> = {
  qr_code: "Mã QR (VNPay)",
  payment_link: "Liên kết thanh toán",
  bank_transfer: "Chuyển khoản ngân hàng",
};

export function PaymentDialog({
  open,
  onOpenChange,
  invoiceIds,
  total,
}: PaymentDialogProps) {
  const isBatch = invoiceIds.length > 1;
  const single = useCreatePayment();
  const batch = useBatchPayment();
  const [method, setMethod] = useState<PaymentMethod>("qr_code");
  const [result, setResult] = useState<
    CreatePaymentResponse | CreateBatchPaymentResponse | null
  >(null);

  const isPending = single.isPending || batch.isPending;

  async function initiate() {
    const res = isBatch
      ? await batch.mutateAsync({ invoiceIds, method })
      : await single.mutateAsync({ invoiceId: invoiceIds[0], method });
    setResult(res);
  }

  function close() {
    onOpenChange(false);
    setResult(null);
  }

  return (
    <Dialog open={open} onOpenChange={(o) => (o ? onOpenChange(true) : close())}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Thanh toán {isBatch ? `${invoiceIds.length} hóa đơn` : "hóa đơn"}</DialogTitle>
          <DialogDescription>
            {isBatch
              ? `Thanh toán gộp ${invoiceIds.length} hóa đơn.`
              : `Hóa đơn ${invoiceIds[0] ?? ""}`}
          </DialogDescription>
        </DialogHeader>

        {!result ? (
          <div className="space-y-4">
            {total !== undefined && (
              <div className="flex items-center justify-between rounded-md bg-muted px-4 py-3">
                <span className="text-sm text-muted-foreground">Tổng tiền</span>
                <span className="text-lg font-semibold">{formatCurrency(total)}</span>
              </div>
            )}
            <div className="space-y-2">
              <label className="text-sm font-medium">Phương thức thanh toán</label>
              <Select value={method} onValueChange={(v) => setMethod(v as PaymentMethod)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(METHOD_LABEL) as PaymentMethod[]).map((m) => (
                    <SelectItem key={m} value={m}>
                      {METHOD_LABEL[m]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        ) : (
          <PaymentResult result={result} method={method} />
        )}

        <DialogFooter>
          {!result ? (
            <Button onClick={initiate} disabled={isPending}>
              {isPending ? "Đang tạo..." : "Tạo yêu cầu thanh toán"}
            </Button>
          ) : (
            <Button onClick={close}>Đóng</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function PaymentResult({
  result,
  method,
}: {
  result: CreatePaymentResponse | CreateBatchPaymentResponse;
  method: PaymentMethod;
}) {
  const amount = "totalAmount" in result ? result.totalAmount : result.amount;
  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center gap-3 text-center">
        {result.qrCodeUrl ? (
          <Image
            src={result.qrCodeUrl}
            alt="Mã QR thanh toán"
            width={200}
            height={200}
            unoptimized
            className="rounded-md border"
          />
        ) : (
          <div className="flex h-24 w-full items-center justify-center rounded-md bg-muted text-sm text-muted-foreground">
            Đang chuẩn bị phương thức thanh toán...
          </div>
        )}
        <div>
          <p className="text-sm text-muted-foreground">{METHOD_LABEL[method]}</p>
          <p className="text-lg font-semibold">{formatCurrency(amount)}</p>
        </div>
      </div>
      <Separator />
      <div className="space-y-1 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Mã giao dịch</span>
          <span className="font-medium">{result.paymentId}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Trạng thái</span>
          <span className="font-medium capitalize">{result.status}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Hết hạn</span>
          <span className="font-medium">
            {new Date(result.expiresAt).toLocaleString("vi-VN")}
          </span>
        </div>
      </div>
      {result.paymentLink && (
        <Button asChild className="w-full">
          <a href={result.paymentLink} target="_blank" rel="noopener noreferrer">
            Mở liên kết thanh toán
          </a>
        </Button>
      )}
    </div>
  );
}
