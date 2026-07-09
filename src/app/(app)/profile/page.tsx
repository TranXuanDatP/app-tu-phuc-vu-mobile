"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Bell,
  ChevronRight,
  Droplet,
  LogOut,
  Mail,
  MapPin,
  Phone,
  PhoneCall,
  ScanLine,
  AlertTriangle,
  Gauge,
  Gift,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { AppBar } from "@/components/layout/app-bar";
import { toast } from "sonner";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Input,
  Label,
  Skeleton,
  Toggle,
} from "@/components/ui";
import { ErrorState } from "@/components/state";
import { useCustomerProfile, useUpdateProfile } from "@/features/customers/queries";
import { classificationLabel } from "@/features/customers/labels";
import { signOut } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

export default function ProfilePage() {
  const { data, isLoading, isError, refetch } = useCustomerProfile();
  const [open, setOpen] = useState(false);

  async function handleLogout() {
    await signOut();
    window.location.replace("/login");
  }

  return (
    <div className="pb-4">
      <AppBar title="Tài khoản" />

      {/* Avatar header */}
      <div className="flex items-center gap-3.5 border-b border-line bg-card px-4 py-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-[18px] bg-gradient-to-br from-deep to-aqua text-[22px] font-extrabold text-white">
          {(data?.fullName ?? "?").charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[17px] font-extrabold">
            {data?.fullName ?? (isLoading ? "…" : "Khách hàng")}
          </div>
          <div className="text-[12.5px] text-muted-foreground">
            {data?.contactInfo?.phone ?? "—"} · {data?.customerId ?? ""}
          </div>
          <span className="mt-1 inline-block rounded-full bg-mint-soft px-2.5 py-0.5 text-[11px] font-bold text-[#0f6b4c]">
            Đã liên kết mã KH
          </span>
        </div>
      </div>

      {isError ? (
        <div className="p-4">
          <ErrorState onRetry={() => refetch()} />
        </div>
      ) : null}

      <Section title="Thông tin tài khoản">
        <div className="overflow-hidden rounded-[18px] border border-line bg-card shadow-[0_6px_22px_rgba(10,42,56,.10)]">
          {isLoading ? (
            <Skeleton className="h-28 w-full" />
          ) : data ? (
            <>
              <Row label="Mã khách hàng" value={data.customerId} />
              <Row
                label="Phân loại"
                value={classificationLabel[data.classification] ?? data.classification}
              />
              <Row label="Địa chỉ" value={data.address.fullAddress} last />
            </>
          ) : null}
        </div>
      </Section>

      <Section
        title="Thông tin liên hệ"
        action={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <button type="button" className="text-[12.5px] font-semibold text-aqua">
                Chỉnh sửa
              </button>
            </DialogTrigger>
            {data ? (
              <EditContactDialog defaults={data.contactInfo} onDone={() => setOpen(false)} />
            ) : null}
          </Dialog>
        }
      >
        <div className="overflow-hidden rounded-[18px] border border-line bg-card shadow-[0_6px_22px_rgba(10,42,56,.10)]">
          {isLoading ? (
            <Skeleton className="h-28 w-full" />
          ) : data ? (
            <>
              <IconRow icon={Phone} label="Số điện thoại" value={data.contactInfo.phone ?? "—"} />
              <IconRow icon={Mail} label="Email" value={data.contactInfo.email ?? "—"} />
              <IconRow
                icon={MapPin}
                label="Địa chỉ liên hệ"
                value={data.contactInfo.contactAddress ?? "—"}
                last
              />
            </>
          ) : null}
        </div>
      </Section>

      <Section title="Tiện ích">
        <div className="overflow-hidden rounded-[18px] border border-line bg-card shadow-[0_6px_22px_rgba(10,42,56,.10)]">
          {(
            [
              { icon: Droplet, label: "Chất lượng nước", href: "/water-quality" },
              { icon: Gauge, label: "Cảnh báo đồng hồ", href: "/meter-anomalies" },
              { icon: AlertTriangle, label: "Cảnh báo rò rỉ", href: "/leakage-alerts" },
              { icon: Gift, label: "Ưu đãi & thông điệp", href: "/campaigns" },
            ] as const
          ).map((u, i, arr) => (
            <Link
              key={u.href}
              href={u.href}
              className={`flex items-center gap-3 px-4 py-3.5 ${i < arr.length - 1 ? "border-b border-line" : ""}`}
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-aqua-soft text-deep">
                <u.icon className="h-4 w-4" />
              </span>
              <b className="flex-1 text-[14px] font-semibold">{u.label}</b>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </Link>
          ))}
        </div>
      </Section>

      <Section title="Thông báo & hóa đơn">
        <div className="overflow-hidden rounded-[18px] border border-line bg-card shadow-[0_6px_22px_rgba(10,42,56,.10)]">
          <div className="flex items-center gap-3 border-b border-line px-4 py-3.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-foam text-deep">
              <Bell className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <b className="text-[14px] font-semibold">Cảnh báo sự cố khu vực</b>
              <p className="text-[12px] text-muted-foreground">Mất nước, bảo trì gần bạn</p>
            </div>
            <Toggle defaultOn />
          </div>
          <div className="flex items-center gap-3 px-4 py-3.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-foam text-deep">
              <Droplet className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <b className="text-[14px] font-semibold">Cảnh báo nghi rò rỉ</b>
              <p className="text-[12px] text-muted-foreground">Khi tiêu thụ tăng bất thường</p>
            </div>
            <Toggle defaultOn />
          </div>
        </div>
      </Section>

      <Section title="Hỗ trợ tiếp cận">
        <div className="overflow-hidden rounded-[18px] border border-line bg-card shadow-[0_6px_22px_rgba(10,42,56,.10)]">
          <div className="flex items-center gap-3 border-b border-line px-4 py-3.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-foam text-deep">
              <ScanLine className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <b className="text-[14px] font-semibold">Chế độ người cao tuổi</b>
              <p className="text-[12px] text-muted-foreground">Chữ lớn hơn, thao tác đơn giản</p>
            </div>
            <Toggle
              onChange={(on) => toast(on ? "Đã bật chế độ người cao tuổi" : "Đã tắt")}
            />
          </div>
          <Link href="/contact" className="flex items-center gap-3 px-4 py-3.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-mint-soft text-[#0f6b4c]">
              <PhoneCall className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <b className="text-[14px] font-semibold">Gọi tổng đài viên</b>
              <p className="text-[12px] text-muted-foreground">Nói chuyện trực tiếp với nhân viên</p>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </Link>
        </div>
      </Section>

      <div className="px-4 pt-5">
        <button
          type="button"
          onClick={handleLogout}
          className="block w-full rounded-[14px] border border-[#F3D2CB] bg-card py-[15px] text-[15.5px] font-extrabold text-coral active:scale-[0.99]"
        >
          <span className="inline-flex items-center gap-2">
            <LogOut className="h-4 w-4" /> Đăng xuất
          </span>
        </button>
        <p className="mt-3 text-center text-[12.5px] text-muted-foreground">
          My QUAWACO · phiên bản 1.0 (prototype)
        </p>
      </div>
    </div>
  );
}

function Section({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="px-4 pt-5">
      <div className="mb-2 flex items-center justify-between px-1">
        <h2 className="text-sm font-bold">{title}</h2>
        {action}
      </div>
      {children}
    </div>
  );
}

function Row({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <div
      className={cn(
        "flex justify-between gap-4 px-4 py-3 text-[13.5px]",
        !last && "border-b border-line",
      )}
    >
      <span className="text-muted-foreground">{label}</span>
      <span className="max-w-[60%] text-right font-semibold">{value}</span>
    </div>
  );
}

function IconRow({
  icon: Icon,
  label,
  value,
  last,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  last?: boolean;
}) {
  return (
    <div className={cn("flex items-center gap-3 px-4 py-3", !last && "border-b border-line")}>
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-foam text-deep">
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <p className="text-[12px] text-muted-foreground">{label}</p>
        <p className="truncate text-[14px] font-semibold">{value}</p>
      </div>
    </div>
  );
}

const editSchema = z.object({
  phone: z.string().optional(),
  email: z.string().email("Email không hợp lệ").or(z.literal("")),
  contactAddress: z.string().optional(),
});
type EditValues = z.infer<typeof editSchema>;

function EditContactDialog({
  defaults,
  onDone,
}: {
  defaults: { phone: string | null; email: string | null; contactAddress: string | null };
  onDone: () => void;
}) {
  const update = useUpdateProfile();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EditValues>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      phone: defaults.phone ?? "",
      email: defaults.email ?? "",
      contactAddress: defaults.contactAddress ?? "",
    },
  });

  function onSubmit(v: EditValues) {
    const payload: Record<string, string> = {};
    if (v.phone && v.phone !== (defaults.phone ?? "")) payload.phone = v.phone;
    if (v.email && v.email !== (defaults.email ?? "")) payload.email = v.email;
    if (v.contactAddress && v.contactAddress !== (defaults.contactAddress ?? ""))
      payload.contactAddress = v.contactAddress;
    if (!Object.keys(payload).length) {
      onDone();
      return;
    }
    update.mutate(payload, { onSuccess: onDone });
  }

  return (
    <DialogContent>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogHeader>
          <DialogTitle>Chỉnh sửa thông tin liên hệ</DialogTitle>
          <DialogDescription>Cập nhật số điện thoại, email hoặc địa chỉ liên hệ</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-1.5">
            <Label htmlFor="phone">Số điện thoại</Label>
            <Input id="phone" {...register("phone")} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register("email")} />
            {errors.email ? (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            ) : null}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="contactAddress">Địa chỉ liên hệ</Label>
            <Input id="contactAddress" {...register("contactAddress")} />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onDone}>
            Huỷ
          </Button>
          <Button type="submit" disabled={update.isPending}>
            {update.isPending ? "Đang lưu..." : "Lưu thay đổi"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
