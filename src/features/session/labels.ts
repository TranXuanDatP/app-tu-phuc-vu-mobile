import type { SessionChannel, SessionEvent } from "@/lib/types/entities";

export const sessionChannelLabel: Record<SessionChannel, string> = {
  zalo: "Zalo",
  web: "Web",
  hotline: "Hotline",
  counter: "Quầy trực tiếp",
};

export function eventLabel(type: string): string {
  const map: Record<string, string> = {
    zalo_message_received: "Nhận tin nhắn Zalo",
    call_started: "Bắt đầu cuộc gọi",
    call_completed: "Kết thúc cuộc gọi",
    ticket_created: "Tạo phản ánh",
    ticket_status_changed: "Cập nhật phản ánh",
    payment_completed: "Thanh toán thành công",
    payment_failed: "Thanh toán thất bại",
    notification_sent: "Gửi thông báo",
    invoice_viewed: "Xem hóa đơn",
    alert_acknowledged: "Xác nhận cảnh báo",
    session_started: "Bắt đầu phiên",
    session_continued: "Tiếp tục phiên",
  };
  return map[type] ?? type;
}

export function eventDescription(e: SessionEvent): string {
  const c = e.content ?? {};
  const any = c as Record<string, unknown>;
  const keys = Object.keys(any);
  if (!keys.length) return "";
  // Render key=value pairs for a quick readable summary
  return keys
    .slice(0, 4)
    .map((k) => `${k}: ${String(any[k])}`)
    .join(" · ");
}
