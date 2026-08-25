import Constants from "expo-constants";

/**
 * Short git hash của bundle đang chạy — app.config.ts đóng dấu mỗi lần
 * `expo start` (Metro serve manifest → Constants.expoConfig.extra.buildId).
 * Hiển thị ở footer login + profile để trả lời "mình đang chạy build nào?"
 */
export const BUILD_ID: string =
  (Constants.expoConfig as { extra?: { buildId?: string } } | undefined)?.extra?.buildId ??
  "unknown";
