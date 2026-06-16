import type { IncidentType, TicketStatus } from "@/lib/types/entities";

export const incidentTypeLabel: Record<IncidentType, string> = {
  water_outage: "Mất nước",
  leak: "Rò rỉ nước",
  water_quality: "Chất lượng nước",
  meter_issue: "Lỗi đồng hồ",
  other: "Khác",
};

export const ticketStatusLabel: Record<TicketStatus, string> = {
  submitted: "Đã tiếp nhận",
  assigned: "Đã phân công",
  in_progress: "Đang xử lý",
  resolved: "Đã xử lý",
  closed: "Đã đóng",
};

export const ticketStatusVariant: Record<
  TicketStatus,
  "secondary" | "warning" | "success"
> = {
  submitted: "secondary",
  assigned: "secondary",
  in_progress: "warning",
  resolved: "success",
  closed: "success",
};
