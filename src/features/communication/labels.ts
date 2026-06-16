import type {
  AlertStatus,
  AlertType,
  NotificationChannel,
  NotificationType,
} from "@/lib/types/entities";

export const channelLabel: Record<NotificationChannel, string> = {
  zns: "Zalo ZNS",
  push: "Push (ứng dụng)",
  sms: "SMS",
  email: "Email",
  in_app: "Trong ứng dụng",
};

export const notificationTypeLabel: Record<NotificationType, string> = {
  payment_completed: "Thanh toán thành công",
  payment_failed: "Thanh toán thất bại",
  ticket_status_changed: "Cập nhật phản ánh",
  alert_outage: "Cảnh báo mất nước",
  alert_maintenance: "Bảo trì",
  alert_quality: "Chất lượng nước",
  debt_reminder: "Nhắc công nợ",
};

export const deliveryStatusLabel: Record<string, string> = {
  sent: "Đã gửi",
  delivered: "Đã nhận",
  failed: "Lỗi",
};

export const alertTypeLabel: Record<AlertType, string> = {
  outage: "Mất nước",
  maintenance: "Bảo trì",
  quality: "Chất lượng nước",
};

export const alertStatusVariant: Record<
  AlertStatus,
  "destructive" | "warning" | "secondary"
> = {
  active: "destructive",
  scheduled: "warning",
  resolved: "secondary",
};

export const severityLabel: Record<string, string> = {
  low: "Thấp",
  medium: "Trung bình",
  high: "Cao",
};
