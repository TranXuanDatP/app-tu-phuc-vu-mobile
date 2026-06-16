import type { CustomerClassification } from "@/lib/types/entities";

export const classificationLabel: Record<CustomerClassification, string> = {
  sinh_hoat: "Hộ sinh hoạt",
  san_xuat: "Sản xuất",
  hanh_chinh: "Hành chính sự nghiệp",
};

export const channelLabel: Record<string, string> = {
  zalo: "Zalo",
  hotline: "Hotline",
  counter: "Quầy",
  web: "Web",
};
