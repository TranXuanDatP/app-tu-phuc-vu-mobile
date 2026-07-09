import type { ComparisonType } from "@/lib/types/entities";

export const comparisonTypeLabel: Record<ComparisonType, string> = {
  previous_period: "Tháng này vs tháng trước",
  same_period_last_year: "Năm nay vs năm ngoái",
  area_average: "So với trung bình khu vực",
};
