import { execSync } from "child_process";

/**
 * app.json + build stamp. Expo ưu tiên app.config.ts khi có — config này chỉ
 * spread app.json rồi đóng dấu `extra.buildId` = git short hash HIỆN TẠI mỗi
 * lần `expo start`, nên màn hình hiển thị build id luôn khớp bundle Metro đang
 * serve (hết cảnh "điện thoại chạy bundle cũ/mới?" — 3 lần trong 2026-08-21).
 */
const app = require("./app.json").expo;

let buildId = "unknown";
try {
  buildId = execSync("git rev-parse --short HEAD", { cwd: __dirname }).toString().trim();
} catch {
  // Không có git trong PATH — giữ "unknown".
}

export default {
  ...app,
  extra: {
    ...app.extra,
    buildId,
  },
};
