"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
} from "@/components/ui";
import { useSetupAutoDebit } from "./mutations";
import type { BankAccount } from "@/lib/types/entities";

const schema = z.object({
  bankName: z.string().min(1, "Nhập tên ngân hàng"),
  accountNumber: z
    .string()
    .regex(/^[0-9]{6,20}$/, "Số tài khoản gồm 6–20 chữ số"),
  accountHolder: z.string().min(1, "Nhập tên chủ tài khoản"),
  branchCode: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export function AutoDebitForm() {
  const mutation = useSetupAutoDebit();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  function onSubmit(values: FormValues) {
    const bankAccount: BankAccount = {
      bankName: values.bankName,
      accountNumber: values.accountNumber,
      accountHolder: values.accountHolder,
      ...(values.branchCode ? { branchCode: values.branchCode } : {}),
    };
    mutation.mutate(bankAccount, { onSuccess: () => reset() });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Trích tự động (Auto-debit)</CardTitle>
        <CardDescription>
          Đăng ký tài khoản ngân hàng để tự động thanh toán hóa đơn mỗi kỳ
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="bankName">Ngân hàng</Label>
            <Input id="bankName" placeholder="VD: Vietcombank" {...register("bankName")} />
            {errors.bankName && (
              <p className="text-sm text-destructive">{errors.bankName.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="accountNumber">Số tài khoản</Label>
            <Input
              id="accountNumber"
              inputMode="numeric"
              placeholder="0123456789"
              {...register("accountNumber")}
            />
            {errors.accountNumber && (
              <p className="text-sm text-destructive">{errors.accountNumber.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="branchCode">Mã chi nhánh (tùy chọn)</Label>
            <Input id="branchCode" {...register("branchCode")} />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="accountHolder">Chủ tài khoản</Label>
            <Input id="accountHolder" placeholder="NGUYEN VAN A" {...register("accountHolder")} />
            {errors.accountHolder && (
              <p className="text-sm text-destructive">{errors.accountHolder.message}</p>
            )}
          </div>
          <div className="sm:col-span-2">
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Đang gửi..." : "Đăng ký"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
