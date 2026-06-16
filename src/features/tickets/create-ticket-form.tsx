"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X, Upload, Loader2 } from "lucide-react";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
  Input,
} from "@/components/ui";
import { useCreateTicket, useUploadTicketPhoto } from "./queries";
import { incidentTypeLabel } from "./labels";
import type { IncidentType } from "@/lib/types/entities";

const MAX_PHOTOS = 5;
const schema = z.object({
  type: z.enum(["water_outage", "leak", "water_quality", "meter_issue", "other"]),
  description: z.string().min(1, "Vui lòng mô tả sự cố").max(2000),
});
type FormValues = z.infer<typeof schema>;

export function CreateTicketForm() {
  const router = useRouter();
  const create = useCreateTicket();
  const uploadPhoto = useUploadTicketPhoto();
  const [photos, setPhotos] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { type: "water_outage", description: "" },
  });
  const type = watch("type");

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

  function onSubmit(values: FormValues) {
    create.mutate(
      { ...values, ...(photos.length ? { imageUrls: photos } : {}) },
      {
        onSuccess: (res) => {
          router.push(`/tickets/${res.trackingId}`);
        },
      },
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Tạo phản ánh mới</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Loại sự cố</Label>
            <Select
              value={type}
              onValueChange={(v) => setValue("type", v as IncidentType, { shouldValidate: true })}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {(Object.keys(incidentTypeLabel) as IncidentType[]).map((t) => (
                  <SelectItem key={t} value={t}>{incidentTypeLabel[t]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Mô tả chi tiết</Label>
            <Textarea
              id="description"
              rows={5}
              maxLength={2000}
              placeholder="Mô tả sự cố bạn đang gặp phải..."
              {...register("description")}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Hình ảnh minh họa (tối đa {MAX_PHOTOS})</Label>
            <div className="flex flex-wrap gap-2">
              {photos.map((url, i) => (
                <div
                  key={i}
                  className="relative h-20 w-20 overflow-hidden rounded-md border"
                >
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
                <label className="flex h-20 w-20 cursor-pointer flex-col items-center justify-center gap-1 rounded-md border border-dashed text-xs text-muted-foreground hover:bg-accent">
                  {uploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                  <span>Tải ảnh</span>
                  <Input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    className="hidden"
                    onChange={(e) => handleFiles(e.target.files)}
                  />
                </label>
              )}
            </div>
          </div>

          <Button type="submit" disabled={create.isPending || uploading}>
            {create.isPending ? "Đang gửi..." : "Gửi phản ánh"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
