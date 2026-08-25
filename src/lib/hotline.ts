import { Linking, Share } from "react-native";
import { toast } from "@/lib/toast";

/**
 * Hotline CSKH QUAWACO — NGUỒN DUY NHẤT cho mọi chỗ hiển thị/quay số
 * (dashboard, bind capped-view, profile, empty-state hồ sơ). Hotline là một
 * nhánh escalation THẬT của binding flow — hai số khác nhau ở hai chỗ là lỗi
 * nghiệp vụ, không phải lỗi hiển thị.
 *
 * ⚠️ CHƯA XÁC NHẬN VỚI QUAWACO (Pc 2026-08-21): 19001008 là số có sẵn từ code
 * cũ (profile.tsx), KHÔNG có bằng chứng công khai đó là hotline CSKH cấp nước.
 * Sai số trước mặt khách = mở dialer nhầm đầu dây. Pc xác nhận số thật → đổi
 * ĐÚNG 1 DÒNG này là toàn app theo.
 */
export const HOTLINE = "19001008";

/**
 * Mở dialer với số tổng đài. `tel:` fail im lặng trên simulator/máy không có
 * SIP — canOpenURL trước; không mở được thì toast số ra để đọc + Share sheet
 * (iOS share sheet có Copy) thay vì "bấm không ra gì".
 */
export async function openHotline(): Promise<void> {
  const url = `tel:${HOTLINE}`;
  try {
    if (await Linking.canOpenURL(url)) {
      await Linking.openURL(url);
      return;
    }
  } catch {
    // fall through — chia sẻ số
  }
  toast.info(`Tổng đài CSKH: ${HOTLINE}`);
  try {
    await Share.share({ message: `Tổng đài CSKH QUAWACO: ${HOTLINE}` });
  } catch {
    // user đóng share sheet — đã có toast hiển thị số.
  }
}
