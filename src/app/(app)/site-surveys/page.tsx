"use client";

import { useState } from "react";
import { AppBar } from "@/components/layout/app-bar";
import { Button, Input, Label } from "@/components/ui";
import { useCreateSurvey } from "@/features/site-survey/queries";

export default function SiteSurveyPage() {
  const create = useCreateSurvey();
  const [address, setAddress] = useState("");
  const [purpose, setPurpose] = useState("");

  return (
    <div className="pb-4">
      <AppBar title="Khảo sát hiện trường" sub="Yêu cầu đội khảo sát địa chỉ" back />
      <div className="space-y-4 p-4">
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-[12.5px] font-semibold text-muted-foreground">Địa chỉ khảo sát</Label>
            <Input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Số 12 Trần Phú, Hạ Long"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[12.5px] font-semibold text-muted-foreground">Mục đích</Label>
            <Input
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="Lắp đặt đồng hồ mới"
            />
          </div>
        </div>
        <Button
          type="button"
          disabled={create.isPending || !address}
          onClick={() => create.mutate({ address, purpose })}
          className="h-[52px] w-full rounded-[14px] bg-deep text-[15.5px] font-extrabold"
        >
          {create.isPending ? "Đang gửi..." : "Gửi yêu cầu"}
        </Button>
        <p className="text-center text-[12.5px] text-muted-foreground">
          Đội khảo sát sẽ liên hệ trong 2–3 ngày làm việc.
        </p>
      </div>
    </div>
  );
}
