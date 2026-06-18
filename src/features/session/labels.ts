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
  const c = (e.content ?? {}) as Record<string, unknown>;

  // Human-readable summaries for the high-signal events.
  switch (e.type) {
    case "zalo_message_received":
      return typeof c.text === "string" && c.text.trim()
        ? `“${c.text}”`
        : "Nhận tin nhắn qua Zalo OA";
    case "call_started":
      return c.assignedTeam ? `Cuộc gọi tới đội ${c.assignedTeam}` : "Bắt đầu cuộc gọi đến tổng đài";
    case "call_completed":
      return "Kết thúc cuộc gọi";
    case "ticket_created":
      return c.trackingId ? `Tạo phản ánh ${c.trackingId}` : "Tạo phản ánh sự cố";
    case "ticket_status_changed":
      return c.newStatus
        ? `Cập nhật trạng thái: ${String(c.newStatus)}`
        : "Cập nhật trạng thái phản ánh";
    case "payment_completed":
      return c.amount ? `Thanh toán ${String(c.amount)}` : "Thanh toán thành công";
    case "payment_failed":
      return "Thanh toán thất bại";
    case "notification_sent":
      return c.notificationType ? `Gửi thông báo ${String(c.notificationType)}` : "Gửi thông báo";
    case "invoice_viewed":
      return c.invoiceId ? `Xem hóa đơn ${String(c.invoiceId)}` : "Xem hóa đơn";
    case "alert_acknowledged":
      return "Xác nhận cảnh báo khu vực";
    case "session_started":
      return "Bắt đầu phiên truy cập";
    case "session_continued":
      return "Tiếp tục phiên truy cập";
    default: {
      // Fallback: render remaining content keys briefly.
      const keys = Object.keys(c);
      if (!keys.length) return "";
      return keys.slice(0, 3).map((k) => `${k}: ${String(c[k])}`).join(" · ");
    }
  }
}
