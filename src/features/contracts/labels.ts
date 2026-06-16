import type { ContractStatus, SubscriptionType } from "@/lib/types/entities";

export const contractStatusLabel: Record<ContractStatus, string> = {
  active: "Còn hiệu lực",
  expired: "Hết hạn",
  terminated: "Đã chấm dứt",
};

export const contractStatusVariant: Record<
  ContractStatus,
  "success" | "secondary" | "destructive"
> = {
  active: "success",
  expired: "secondary",
  terminated: "destructive",
};

export const subscriptionLabel: Record<SubscriptionType, string> = {
  residential: "Hộ sinh hoạt",
  commercial: "Kinh doanh",
  industrial: "Công nghiệp",
  administrative: "Hành chính sự nghiệp",
};
