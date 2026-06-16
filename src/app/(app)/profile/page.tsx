"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui";
import { EmptyState, ErrorState } from "@/components/state";
import {
  useCustomerProfile,
  useCustomerTimeline,
  useRelatedAccounts,
  useUpdateProfile,
} from "@/features/customers/queries";
import { channelLabel, classificationLabel } from "@/features/customers/labels";
import { formatDate, formatDateTime } from "@/lib/utils";

export default function ProfilePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Hồ sơ khách hàng</h1>
        <p className="text-sm text-muted-foreground">Thông tin tài khoản và lịch sử tương tác</p>
      </div>
      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">Hồ sơ</TabsTrigger>
          <TabsTrigger value="timeline">Lịch sử tương tác</TabsTrigger>
          <TabsTrigger value="related">Tài khoản liên quan</TabsTrigger>
        </TabsList>
        <TabsContent value="profile" className="mt-4"><ProfileTab /></TabsContent>
        <TabsContent value="timeline" className="mt-4"><TimelineTab /></TabsContent>
        <TabsContent value="related" className="mt-4"><RelatedTab /></TabsContent>
      </Tabs>
    </div>
  );
}

function ProfileTab() {
  const { data, isLoading, isError, refetch } = useCustomerProfile();
  const [open, setOpen] = useState(false);

  if (isLoading) return <Skeleton className="h-96 w-full" />;
  if (isError) return <Card><CardContent><ErrorState onRetry={() => refetch()} /></CardContent></Card>;
  if (!data) return null;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Thông tin chung</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <Row label="Mã khách hàng" value={data.customerId} />
          <Row label="Họ tên" value={data.fullName} />
          <Row label="Phân loại" value={classificationLabel[data.classification]} />
          <Row label="Địa chỉ" value={data.address.fullAddress} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base">Thông tin liên hệ</CardTitle>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">Chỉnh sửa</Button>
            </DialogTrigger>
            <EditContactDialog defaults={data.contactInfo} onDone={() => setOpen(false)} />
          </Dialog>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <Row label="Số điện thoại" value={data.contactInfo.phone ?? "—"} />
          <Row label="Email" value={data.contactInfo.email ?? "—"} />
          <Row label="Địa chỉ liên hệ" value={data.contactInfo.contactAddress ?? "—"} />
          <div className="flex items-center gap-2 pt-2">
            <span className="text-muted-foreground">Trạng thái:</span>
            <Badge variant={data.status === "active" ? "success" : "secondary"}>
              {data.status === "active" ? "Đang hoạt động" : "Không hoạt động"}
            </Badge>
          </div>
        </CardContent>
      </Card>
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
  const { register, handleSubmit, formState: { errors } } = useForm<EditValues>({
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
            {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="contactAddress">Địa chỉ liên hệ</Label>
            <Input id="contactAddress" {...register("contactAddress")} />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onDone}>Huỷ</Button>
          <Button type="submit" disabled={update.isPending}>
            {update.isPending ? "Đang lưu..." : "Lưu thay đổi"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}

function TimelineTab() {
  const { data, isLoading, isError, refetch } = useCustomerTimeline();
  if (isLoading) return <Skeleton className="h-64 w-full" />;
  if (isError) return <Card><CardContent><ErrorState onRetry={() => refetch()} /></CardContent></Card>;
  if (!data?.entries.length) return <Card><CardContent><EmptyState title="Chưa có tương tác nào" /></CardContent></Card>;

  return (
    <Card>
      <CardHeader><CardTitle className="text-base">Dòng thời gian tương tác</CardTitle></CardHeader>
      <CardContent>
        <ol className="relative space-y-5 border-l pl-6">
          {data.entries.map((e, i) => (
            <li key={i} className="relative">
              <span className="absolute -left-[27px] top-1 h-3 w-3 rounded-full bg-primary" />
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary">{e.eventType}</Badge>
                {e.channel && <Badge variant="outline">{channelLabel[e.channel] ?? e.channel}</Badge>}
                <span className="text-xs text-muted-foreground">{formatDateTime(e.timestamp)}</span>
              </div>
              <p className="mt-1 text-sm">{e.summary}</p>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}

function RelatedTab() {
  const { data, isLoading, isError, refetch } = useRelatedAccounts();
  if (isLoading) return <Skeleton className="h-64 w-full" />;
  if (isError) return <Card><CardContent><ErrorState onRetry={() => refetch()} /></CardContent></Card>;
  if (!data?.accounts.length) return <Card><CardContent><EmptyState title="Không có tài khoản liên quan" /></CardContent></Card>;

  return (
    <Card>
      <CardHeader><CardTitle className="text-base">Tài khoản liên quan</CardTitle></CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mã KH</TableHead>
              <TableHead>Tên</TableHead>
              <TableHead>Mối quan hệ</TableHead>
              <TableHead>Địa chỉ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.accounts.map((a) => (
              <TableRow key={a.customerId}>
                <TableCell className="font-medium">{a.customerId}</TableCell>
                <TableCell>{a.name}</TableCell>
                <TableCell>{a.relationshipType}</TableCell>
                <TableCell className="max-w-[220px] truncate">{a.address ?? "—"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
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
