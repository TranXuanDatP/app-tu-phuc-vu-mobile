import type {
  CalibrationState,
  MeterStatus,
  MeterType,
  MeterHistoryEventType,
} from "@/lib/types/entities";

export const meterTypeLabel: Record<MeterType, string> = {
  mechanical: "Cơ học",
  ultrasonic: "Siêu âm",
  electromagnetic: "Điện từ",
};

export const meterStatusLabel: Record<MeterStatus, string> = {
  active: "Đang hoạt động",
  removed: "Đã tháo dỡ",
  defective: "Hỏng",
};

export const calibrationLabel: Record<CalibrationState, string> = {
  valid: "Còn hạn",
  expiring_soon: "Sắp hết hạn",
  expired: "Hết hạn",
};

export const calibrationVariant: Record<
  CalibrationState,
  "success" | "warning" | "destructive"
> = {
  valid: "success",
  expiring_soon: "warning",
  expired: "destructive",
};

export const historyEventLabel: Record<MeterHistoryEventType, string> = {
  installation: "Lắp đặt",
  removal: "Tháo dỡ",
  replacement: "Thay thế",
  calibration: "Hiệu chuẩn",
};
