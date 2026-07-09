# 📘 RUNBOOK — App tự phục vụ KH (QUAWACO CSKH)

Hướng dẫn cài đặt, chạy và test toàn bộ project: **BFF backend** (`app-tu-phuc-vu`) + **Frontend** (`app-tu-phuc-vu-fe`).

---

## 1. Kiến trúc tổng quan

```
Điện thoại/PC  →  Frontend (Next.js 16, :3001)
                     │  /api/bff/*  ──rewrite──►  BFF (NestJS 11 + Fastify, :3000)
                     │  /api/auth/* ──rewrite──►     │  (better-auth OTP, 30 Hex-Ports,
                     │                              │   3-tier resilience, BullMQ queue)
                     │                              ├──► PostgreSQL (auth DB + drizzle)
                     │                              ├──► Redis (cache/session/queue — tùy chọn)
                     │                              └──► 30 downstream services (MOCK hoặc live)
```

- **MOCK_MODE=true** (mặc định khi dev): tất cả port trả JSON mẫu → không cần backend downstream thật.
- FE gọi BFF qua prefix `/api/bff` (Next rewrite) → cookie better-auth tự đi theo (same-origin).

---

## 2. Yêu cầu hệ thống

| Tool | Phiên bản | Kiểm tra |
|---|---|---|
| **Bun** | ≥ 1.3 | `bun --version` |
| **Node.js** | ≥ 20.9 | `node --version` |
| **PostgreSQL** | ≥ 14 | `psql --version` (port 5432) |
| **Redis** | ≥ 6 (tùy chọn) | `redis-cli ping` — nếu không có, BFF dùng memory cache + queue tắt |

---

## 3. Cài đặt

```bash
# Backend
cd f:/Workspace/app-tu-phuc-vu
bun install

# Frontend
cd f:/Workspace/app-tu-phuc-vu-fe
bun install
```

---

## 4. Cấu hình biến môi trường

### BFF — `app-tu-phuc-vu/.env`
```ini
# Database
DATABASE_URL=postgresql://postgres:admin@localhost:5432/nestjs_project

# Security
JWT_SECRET=đổi-key-bí-mật-dài

# Better Auth
BETTER_AUTH_URL=http://localhost:3000
BETTER_AUTH_SECRET=local-dev-secret-32-chars-min-value-x   # ≥32 ký tự
# Thêm origin của FE để browser không bị "invalid origin":
BETTER_AUTH_TRUSTED_ORIGINS=http://localhost:3001,http://localhost:3000

# Mock mode (dev) — bỏ dòng này nếu muốn gọi downstream thật
MOCK_MODE=true

# Redis (tùy chọn — để trống thì dùng memory cache + queue tắt)
# REDIS_HOST=localhost
# REDIS_PORT=6379
# REDIS_QUEUE_DB=1
```

### FE — `app-tu-phuc-vu-fe/.env.local`
```ini
BACKEND_BASE_URL=http://localhost:3000
NEXT_PUBLIC_APP_ORIGIN=http://localhost:3001
```

---

## 5. Khởi tạo database

```bash
cd f:/Workspace/app-tu-phuc-vu
bun run db:generate    # sinh migration từ drizzle schema (khi đổi schema)
bun run db:migrate     # áp dụng migration → tạo bảng better-auth (user/session/verification/provider_links)
```

---

## 6. Chạy project

### Terminal 1 — BFF (backend, port 3000)
```bash
cd f:/Workspace/app-tu-phuc-vu
bun run start:dev      # dev có hot-reload
# hoặc chạy build prod:
bun run build && MOCK_MODE=true BETTER_AUTH_SECRET=local-dev-secret-32-chars-min-value-x bun run start:prod
```
Sẵn sàng khi thấy log `Nest application successfully started` + `GET /health HTTP 200`.

### Terminal 2 — FE (frontend, port 3001)
```bash
cd f:/Workspace/app-tu-phuc-vu-fe
bun run dev            # Next 16 (Turbopack), mặc định :3000 → đổi nếu bị trùng
# ép port 3001:
PORT=3001 bun run dev
```
Sẵn sàng khi thấy `✓ Ready` + `http://localhost:3001`.

### Truy cập
- **PC:** http://localhost:3001/login
- **Điện thoại (cùng Wi-Fi):** http://<LAN-IP>:3001/login (xem §8)

---

## 7. Đăng nhập (better-auth OTP)

1. Mở `/login` → ô có sẵn prefix **+84**.
2. Nhập SĐT **bỏ số 0 đầu** (vd `987654321`), bấm **Gửi mã OTP**.
3. Lấy OTP từ log BFF (xem §9) → nhập 6 số → vào app.

> Mock mode: OTP sinh ngẫu nhiên + in trong console BFF (không gửi SMS thật).

---

## 8. Truy cập từ điện thoại (LAN)

```bash
# 1. Tìm IP LAN thật của máy (bỏ các adapter ảo 192.168.64.1 / 192.168.180.1)
ipconfig | grep IPv4
# → dùng IP thật, vd 192.168.100.95
```

- Điện thoại nối **cùng Wi-Fi** với máy → mở `http://<IP>:3001/login`.
- **Nếu không vào được** → Windows Firewall chặn. Mở **PowerShell as Administrator**:
  ```powershell
  netsh advfirewall firewall add rule name="Dev FE 3001" dir=in action=allow protocol=TCP localport=3001
  ```
- IP có thể đổi theo DHCP — nếu hết vào được, kiểm tra lại `ipconfig`.

---

## 9. Đọc log + lấy OTP

BFF dùng **pino (JSON)** — mỗi request 1 dòng có `time`, `level` (30=info, 50=error), `msg`, `req/res`. OTP (mock/dev) in dạng `OTP for <sdt-che>: <6 số>`.

### ⭐ Cách tốt nhất: chạy BFF trong terminal riêng
```bash
cd f:/Workspace/app-tu-phuc-vu
MOCK_MODE=true \
BETTER_AUTH_SECRET=local-dev-secret-32-chars-min-value-x \
BETTER_AUTH_TRUSTED_ORIGINS="http://localhost:3001,http://localhost:3000" \
bun run start:dev
```
→ OTP + log **in thẳng ra terminal**. Mỗi lần gửi OTP, dòng `OTP for ...: 123456` hiện ngay — không cần đọc file.

### Trường hợp BFF chạy nền → đọc từ file log
File log (task-id đổi theo lần chạy):
```
C:\Users\pc\AppData\Local\Temp\claude\f--Workspace\c9c5c11b-c52c-4843-a41e-6b6c977bd5a8\tasks\<task-id>.output
```

**Đặt biến gọn (Git Bash):**
```bash
LOG="/c/Users/pc/AppData/Local/Temp/claude/f--Workspace/c9c5c11b-c52c-4843-a41e-6b6c977bd5a8/tasks/<task-id>.output"
```

```bash
# 1) Lấy OTP mới nhất
grep -hoE 'OTP for [^:]+: [0-9]{6}' "$LOG" | tail -3

# 2) Theo dõi log trực tiếp (live, Ctrl+C thoát)
tail -f "$LOG"

# 3) Đọc "dễ" — chỉ time + msg
tail -50 "$LOG" | grep -oE '"(time|msg)":"[^"]*"'

# 4) Lọc theo endpoint
grep -F '/billing/invoices' "$LOG" | tail -10

# 5) Chỉ xem lỗi (level 50)
grep '"level":50' "$LOG" | tail -20

# 6) Tìm file log nếu quên task-id (lấy file mới nhất)
ls -t /c/Users/pc/AppData/Local/Temp/claude/f--Workspace/*/tasks/*.output | head -1
```

### PowerShell
```powershell
$LOG = "C:\Users\pc\AppData\Local\Temp\claude\f--Workspace\c9c5c11b-c52c-4843-a41e-6b6c977bd5a8\tasks\<task-id>.output"
Select-String -Path $LOG -Pattern 'OTP for [^:]+: [0-9]{6}' | Select-Object -Last 3   # OTP
Get-Content $LOG -Wait -Tail 20                                                        # live
```

> 💡 OTP chỉ có ở **mock/dev mode** (BFF in ra thay vì gửi SMS thật).

---

## 10. Test

### 10.1 Unit test + build (BFF)
```bash
cd f:/Workspace/app-tu-phuc-vu
bun run test           # Jest — toàn bộ spec (unit + handler + port)
bun run build          # nest build (TypeScript typecheck)
bun run lint           # eslint --fix
```
Kỳ vọng: **~1100+ tests pass**, build sạch.

### 10.2 Build + lint (FE)
```bash
cd f:/Workspace/app-tu-phuc-vu-fe
bun run build          # next build (Turbopack) — bắt lỗi type/Next 16
bun run lint           # eslint
```
Kỳ vọng: build `✓ Compiled successfully`, tất cả route trong route list.

### 10.3 Smoke test E2E (qua FE proxy)
Sau khi cả 2 server chạy:
```bash
PHONE="+84987654321"
# Gửi OTP
curl -s -X POST http://localhost:3001/api/auth/phone-number/send-otp \
  -H 'content-type: application/json' -H 'origin: http://localhost:3001' \
  -d "{\"phoneNumber\":\"$PHONE\"}"
# (lấy OTP từ log BFF — §9)
CODE=327047   # thay bằng OTP thật
# Xác thực → cookie
curl -s -X POST http://localhost:3001/api/auth/phone-number/verify \
  -H 'content-type: application/json' \
  -d "{\"phoneNumber\":\"$PHONE\",\"code\":\"$CODE\"}" -c /tmp/ck.txt
# Quét endpoint qua proxy /api/bff
for ep in customers/profile meters/consumption invoices?status=unpaid payments/debt tickets segments; do
  curl -s -o /dev/null -w "/api/bff/$ep → %{http_code}\n" "http://localhost:3001/api/bff/$ep" -b /tmp/ck.txt
done
```
Kỳ vọng: tất cả **HTTP 200**.

### 10.4 Kiểm tra visual (UI v2 data-rich)
Sau khi login, duyệt 7 màn qua bottom nav + link:
| Màn | Kiểm tra |
|---|---|
| Trang chủ | hero gradient + bill card + 4 quick actions + snap card (vòng tròn m³) + support card |
| Hóa đơn | tabs chưa/đã trả + billsum + Tự động & nhắc hạn (toggle) |
| Tiêu thụ | water-meter card (sóng động) + stats + dự báo + bậc giá pills + chart + gợi ý tiết kiệm |
| Sự cố | voice note + lưới 9 loại + yêu cầu của tôi + form tạo |
| Tài khoản | avatar header + info/contact + Thông báo & Hỗ trợ tiếp cận (toggle) + đăng xuất |
| Liên hệ `/contact` | hotline + kênh hỗ trợ + FAQ + văn phòng |
| Chat `/chat` | chat nhân viên (nav tự ẩn) |

---

## 11. Troubleshooting

| Triệu chứng | Nguyên nhân | Khắc phục |
|---|---|---|
| `invalid origin` khi gửi OTP | FE origin chưa trong `BETTER_AUTH_TRUSTED_ORIGINS` | thêm `http://localhost:3001` (+ IP LAN) vào BFF `.env`, restart BFF |
| OTP không tới / quên | OTP chỉ in trong log BFF (mock) | đọc log (§9) |
| Điện thoại trắng trang | IP cũ / khác mạng / firewall | `ipconfig` lấy IP mới, cùng Wi-Fi, mở port 3001 (§8) |
| `Port 3000 is already in use` | BFF/FE trùng port | dùng `PORT=3001 bun run dev` cho FE |
| `Failed to fetch` (upload ảnh) | mock upload-url trả URL giả | đã fallback blob URL trong `features/tickets/queries.ts` (mock) |
| Build lỗi `metadata` | export metadata trong file `'use client'` | chuyển metadata sang `layout.tsx` (Server Component) |
| Build lỗi `params` | dùng `params.slug` thay vì Promise | `const {id} = use(params)` (client) / `await params` (server) — Next 16 |

---

## 12. Cấu trúc lệnh nhanh

```bash
# BFF
cd app-tu-phuc-vu && bun install && bun run db:migrate
MOCK_MODE=true BETTER_AUTH_SECRET=local-dev-secret-32-chars-min-value-x \
  BETTER_AUTH_TRUSTED_ORIGINS="http://localhost:3001,http://localhost:3000" \
  bun run start:dev

# FE (terminal khác)
cd app-tu-phuc-vu-fe && bun install
PORT=3001 bun run dev
```

Mở http://localhost:3001/login → SĐT `987654321` → OTP (§9) → vào app. 🚀
