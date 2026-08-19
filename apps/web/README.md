# apps/web

Frontend công khai + cổng đoàn viên của Công đoàn Trường Đại học Sư phạm Kỹ thuật Hưng Yên.
Vite + React 18 + TypeScript (strict) + React Router v6 + Tailwind CSS v4 + một số component
shadcn/ui (Radix UI) được copy có chọn lọc từ `_design_reference/university-information-portal`.

## Chạy dev

```bash
# Từ thư mục gốc monorepo — cài đặt dependency cho toàn workspace (đã bao gồm apps/web)
pnpm install

# Cấu hình biến môi trường (nếu apps/api không chạy ở localhost:3000)
cp ../../.env.example ../../.env   # sửa VITE_API_BASE_URL nếu cần

# Chạy riêng apps/web (mặc định http://localhost:5173)
pnpm --filter @congdoan/web dev
```

apps/web cần apps/api đang chạy (mặc định `http://localhost:3000`, cấu hình qua biến môi trường
`VITE_API_BASE_URL`) để có dữ liệu tin tức/chuyên mục/đăng nhập.

## Build & kiểm tra

```bash
pnpm --filter @congdoan/web build       # tsc -b && vite build
pnpm --filter @congdoan/web typecheck   # tsc -b --noEmit
pnpm --filter @congdoan/web lint
pnpm --filter @congdoan/web test        # vitest run
```

## Các trang đã có

| Route | Trang | Ghi chú |
| --- | --- | --- |
| `/` | `HomePage` | Banner giới thiệu, lối tắt, 6 tin tức mới nhất (`GET /posts?pageSize=6`) |
| `/tin-tuc` | `NewsListPage` | Danh sách bài viết có phân trang + lọc theo chuyên mục (query string `page`, `category`) |
| `/tin-tuc/:slug` | `NewsDetailPage` | Chi tiết bài viết (`GET /posts/:slug`), hiện 404 thân thiện nếu không tìm thấy |
| `/gioi-thieu` | `AboutPage` | Nội dung tĩnh, có placeholder rõ ràng cho phần chưa có dữ liệu chính thức |
| `/lien-he` | `ContactPage` | Thông tin liên hệ + form tĩnh (chưa nối API — xem TODO trong code) |
| `/dang-nhap` | `LoginPage` | Đăng nhập đoàn viên (`POST /auth/login`) |
| `/cong-doan-vien` | `MemberPortalPage` | Yêu cầu đăng nhập — hiện thông tin tài khoản, khung tiện ích số Phase 4 |
| `*` | `NotFoundPage` | 404 |

## Kiến trúc auth

- `src/lib/api-client.ts` — hàm `apiFetch<T>()` bọc `fetch`, tự gắn `VITE_API_BASE_URL` và header
  `Authorization` nếu có access token, ném `ApiError` (message tiếng Việt từ `ApiErrorBody`) khi
  response lỗi.
- `src/lib/auth-context.tsx` — `AuthProvider` + hook `useAuth()`. Access token chỉ giữ trong bộ nhớ
  (React state), refresh token lưu trong `localStorage` (key `congdoan_refresh_token`) để khôi phục
  phiên khi tải lại trang. **Lưu ý bảo mật**: lưu access token trong bộ nhớ đã an toàn hơn
  localStorage, nhưng refreshToken vẫn nằm trong localStorage nên còn rủi ro XSS ở mức độ thấp hơn —
  bản production nên chuyển hẳn sang cơ chế httpOnly cookie do backend set. Đây là đánh đổi chấp
  nhận được cho bản MVP.

## Checklist việc còn thiếu (chờ API/Phase sau)

- [ ] **Tổ chức bộ máy** (Ban Chấp hành, Công đoàn bộ phận) — `AboutPage` hiện chỉ có placeholder,
      chưa có endpoint cung cấp dữ liệu này ở apps/api.
- [ ] **Tiện ích số Công đoàn** (ví đoàn phí, biểu mẫu điện tử, thông báo cá nhân hoá) — dự kiến
      Phase 4, `MemberPortalPage` đã có khung UI sẵn (`UPCOMING_FEATURES`) nhưng chưa nối API.
- [ ] **Form liên hệ** (`ContactPage`) — hiện chỉ là form tĩnh phía client, chưa có endpoint
      `POST /contact` để lưu/gửi phản ánh.
- [ ] **Đổi mật khẩu** — `apps/api` đã có `POST /auth/change-password` nhưng chưa có màn hình FE
      tương ứng (nằm ngoài phạm vi yêu cầu ban đầu của apps/web).
- [ ] **Tìm kiếm tin tức** — `PaginationQuery` hỗ trợ `search`, nhưng `NewsListPage` hiện chỉ lọc
      theo chuyên mục; có thể bổ sung ô tìm kiếm khi cần.

## Component UI

`src/components/ui/*.tsx` là các component shadcn/ui (Radix UI) được copy có chọn lọc từ
`_design_reference/university-information-portal` (button, card, badge, separator, sheet, skeleton,
avatar, tooltip, utils). Khi cần thêm component khác, copy tương tự từ thư mục tham khảo rồi bỏ
phần version trong import (`@radix-ui/react-x@1.2.3` → `@radix-ui/react-x`) và thêm dependency
tương ứng vào `package.json`.

Bảng màu (đỏ cờ `#C0272D` + vàng sao `#F5B700`) lấy từ `packages/config/theme.css` — đã dán vào đầu
`src/index.css`, không tự định nghĩa màu ở nơi khác.
