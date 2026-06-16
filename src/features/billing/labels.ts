import type { FeeType, TariffCustomerType } from "@/lib/types/entities";

export const tariffCustomerTypeLabel: Record<TariffCustomerType, string> = {
  residential: "Hộ sinh hoạt",
  industrial: "Sản xuất",
  commercial: "Kinh doanh",
  institutional: "Hành chính sự nghiệp",
};

export const feeTypeLabel: Record<FeeType, string> = {
  environmental: "Bảo vệ môi trường",
  drainage: "Xả thải / Thoát nước",
  vat: "Thuế GTGT (VAT)",
  surcharge: "Phụ phí",
};
