"use client";

import { useState } from "react";
import { AppBar } from "@/components/layout/app-bar";
import { Button, Input, Label } from "@/components/ui";
import { useCreateOnboarding } from "@/features/onboarding/queries";

export default function OnboardingPage() {
  const create = useCreateOnboarding();
  const [form, setForm] = useState({
    address: "",
    customerType: "sinh_hoat",
    fullName: "",
    phone: "",
  });

  return (
    <div className="pb-4">
      <AppBar title="Đăng ký cấp nước" sub="Không cần ra quầy" back />
      <div className="space-y-4 p-4">
        <div className="space-y-3">
          <Field label="Họ tên">
            <Input
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              placeholder="Nguyễn Văn An"
            />
          </Field>
          <Field label="Số điện thoại">
            <Input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="912 345 678"
            />
          </Field>
          <Field label="Địa chỉ cần cấp nước">
            <Input
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              placeholder="Số 12 Trần Phú, Hạ Long"
            />
          </Field>
        </div>
        <Button
          type="button"
          disabled={create.isPending || !form.address}
          onClick={() => create.mutate(form)}
          className="h-[52px] w-full rounded-[14px] bg-deep text-[15.5px] font-extrabold"
        >
          {create.isPending ? "Đang gửi..." : "Gửi yêu cầu"}
        </Button>
        <p className="text-center text-[12.5px] text-muted-foreground">
          Yêu cầu được xử lý trong 3–5 ngày làm việc.
        </p>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-[12.5px] font-semibold text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}
