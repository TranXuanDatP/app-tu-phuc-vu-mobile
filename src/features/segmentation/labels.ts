import type { CustomerType, ValueSegment } from "@/lib/types/entities";
import type { StatusTone } from "@/components/status-badge";

export const valueSegmentLabel: Record<ValueSegment, string> = {
  VIP: "VIP",
  large: "Khách hàng lớn",
  medium: "Trung bình",
  small: "Nhỏ",
};

export const valueSegmentTone: Record<ValueSegment, StatusTone> = {
  VIP: "info",
  large: "success",
  medium: "neutral",
  small: "neutral",
};

export const customerTypeLabel: Record<CustomerType, string> = {
  sinh_hoat: "Sinh hoạt",
  san_xuat: "Sản xuất",
  kcn: "Khu công nghiệp",
  hanh_chinh: "Hành chính",
  dich_vu: "Dịch vụ",
};
