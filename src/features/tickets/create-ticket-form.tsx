"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Upload, X } from "lucide-react";
import { Button, Input, Textarea } from "@/components/ui";
import { useCreateTicket, useUploadTicketPhoto } from "./queries";
import { incidentTypeLabel } from "./labels";
import { cn } from "@/lib/utils";
import type { IncidentType } from "@/lib/types/entities";

const MAX_PHOTOS = 5;

const TYPE_OPTS = (Object.keys(incidentTypeLabel) as IncidentType[]).map((v) => ({
  value: v,
  label: incidentTypeLabel[v],
}));
const URGENCY = ["Thấp", "Trung bình", "Cao", "Khẩn cấp"];
const LOCATION = ["Trong nhà", "Tại đồng hồ", "Ngoài đường", "Bể/ống chung"];
const SCOPE = ["Chỉ nhà tôi", "Vài hộ lân cận", "Cả khu vực"];
const CONDITION = ["Nước đục/cặn", "Có mùi lạ", "Chảy yếu", "Mất hoàn toàn", "Bình thường"];
const SLOT = ["Trong hôm nay", "Buổi sáng", "Buổi chiều", "Cuối tuần", "Bất kỳ"];
const CHANNEL = ["Thông báo App", "Zalo", "Gọi điện"];

export function CreateTicketForm() {
  const router = useRouter();
  const create = useCreateTicket();
  const uploadPhoto = useUploadTicketPhoto();

  const [type, setType] = useState<IncidentType>("leak");
  const [urgency, setUrgency] = useState("Trung bình");
  const [location, setLocation] = useState("Trong nhà");
  const [scope, setScope] = useState("Chỉ nhà tôi");
  const [condition, setCondition] = useState("Nước đục/cặn");
  const [slot, setSlot] = useState("Trong hôm nay");
  const [channel, setChannel] = useState("Thông báo App");
  const [detail, setDetail] = useState("");
  const [point, setPoint] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string>();

  async function handleFiles(files: FileList | null) {
    if (!files) return;
    setUploading(true);
    try {
      for (const file of Array.from(files).slice(0, MAX_PHOTOS - photos.length)) {
        const res = await uploadPhoto.mutateAsync({ file });
        setPhotos((p) => [...p, res.publicUrl]);
      }
    } finally {
      setUploading(false);
    }
  }

  function submit() {
    if (!detail.trim()) {
      setError("Vui lòng mô tả chi tiết sự cố");
      return;
    }
    setError(undefined);
    // Compose rich description from chip selections + free text.
    const meta = [
      `Mức độ: ${urgency}`,
      `Vị trí: ${location}${point ? ` (${point})` : ""}`,
      `Phạm vi: ${scope}`,
      `Tình trạng nước: ${condition}`,
      `Tiếp đội: ${slot}`,
      `Cập nhật qua: ${channel}`,
    ].join(" · ");
    create.mutate(
      { type, description: `${detail}\n${meta}`, ...(photos.length ? { imageUrls: photos } : {}) },
      { onSuccess: (res) => router.push(`/tickets/${res.trackingId}`) },
    );
  }

  return (
    <div className="space-y-0">
      {/* 1 · Loại & mức độ */}
      <SubLabel first>1 · Loại & mức độ</SubLabel>
      <Mini>Loại sự cố</Mini>
      <ChipGroup options={TYPE_OPTS} value={type} onChange={(v) => setType(v as IncidentType)} />
      <Mini>Mức độ khẩn cấp</Mini>
      <ChipGroup options={URGENCY} value={urgency} onChange={setUrgency} />

      {/* 2 · Vị trí & phạm vi */}
      <SubLabel>2 · Vị trí & phạm vi</SubLabel>
      <Mini>Điểm xảy ra sự cố</Mini>
      <ChipGroup options={LOCATION} value={location} onChange={setLocation} />
      <Mini>Mô tả điểm cụ thể</Mini>
      <Input
        value={point}
        onChange={(e) => setPoint(e.target.value)}
        placeholder="VD: ngõ 5, gần cột điện số 12, tầng 2"
      />
      <Mini>Phạm vi ảnh hưởng</Mini>
      <ChipGroup options={SCOPE} value={scope} onChange={setScope} />

      {/* 3 · Chi tiết hiện trạng */}
      <SubLabel>3 · Chi tiết hiện trạng</SubLabel>
      <Mini>Tình trạng nước hiện tại</Mini>
      <ChipGroup options={CONDITION} value={condition} onChange={setCondition} />
      <Mini>Ảnh / video hiện trạng (tối đa {MAX_PHOTOS})</Mini>
      <div className="flex flex-wrap gap-2.5">
        {photos.map((url, i) => (
          <div key={i} className="relative h-[72px] w-[72px] overflow-hidden rounded-[13px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt="" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => setPhotos((p) => p.filter((_, idx) => idx !== i))}
              className="absolute right-0.5 top-0.5 rounded-full bg-black/60 p-0.5 text-white"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
        {photos.length < MAX_PHOTOS && (
          <label className="flex h-[72px] w-[72px] cursor-pointer flex-col items-center justify-center gap-1 rounded-[13px] border-2 border-dashed border-aqua bg-aqua-soft text-deep hover:brightness-95">
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            <span className="text-[10px] font-semibold">Tải ảnh</span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
            />
          </label>
        )}
      </div>
      <Mini>Mô tả chi tiết</Mini>
      <Textarea
        rows={3}
        maxLength={2000}
        value={detail}
        onChange={(e) => setDetail(e.target.value)}
        placeholder="VD: nước có màu vàng đục từ sáng nay, khi mở vòi có cặn lắng…"
      />
      {error ? <p className="mt-1 text-sm text-destructive">{error}</p> : null}

      {/* 4 · Liên hệ & hẹn lịch */}
      <SubLabel>4 · Liên hệ & hẹn lịch</SubLabel>
      <Mini>Khung giờ tiếp đội</Mini>
      <ChipGroup options={SLOT} value={slot} onChange={setSlot} />
      <Mini>Nhận cập nhật qua</Mini>
      <ChipGroup options={CHANNEL} value={channel} onChange={setChannel} />

      <Button
        type="button"
        onClick={submit}
        disabled={create.isPending || uploading}
        className="mt-6 h-[52px] w-full rounded-[14px] bg-deep text-[15.5px] font-extrabold text-white"
      >
        {create.isPending ? "Đang gửi..." : "Gửi yêu cầu"}
      </Button>
      <p className="mt-3 text-center text-[12.5px] leading-relaxed text-muted-foreground">
        Yêu cầu được định tuyến qua GIS Triage → tạo ticket & gán đội gần nhất.
      </p>
    </div>
  );
}

function SubLabel({ children, first }: { children: React.ReactNode; first?: boolean }) {
  return (
    <div
      className={cn(
        "mt-5 border-t border-line pt-3.5 text-[12.5px] font-extrabold tracking-wide text-deep",
        first && "mt-1 border-0 pt-0",
      )}
    >
      {children}
    </div>
  );
}

function Mini({ children }: { children: React.ReactNode }) {
  return (
    <label className="mb-2 mt-3.5 block text-[12.5px] font-semibold text-muted-foreground">
      {children}
    </label>
  );
}

function ChipGroup<T extends string>({
  options,
  value,
  onChange,
}: {
  options: readonly T[] | { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  const items = (Array.isArray(options) && typeof options[0] === "object"
    ? (options as { value: T; label: string }[])
    : (options as readonly T[]).map((o) => ({ value: o, label: String(o) })));
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={cn(
            "rounded-xl border-[1.5px] px-3.5 py-2 text-[13px] font-semibold active:scale-[0.97]",
            value === o.value
              ? "border-aqua bg-aqua-soft text-deep"
              : "border-line bg-card text-muted-foreground",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
