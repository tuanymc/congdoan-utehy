# @congdoan/admin

Trang quản trị (React + [Refine](https://refine.dev), headless — không dùng `@refinedev/antd`/`@refinedev/mui`)
cho website Công đoàn Trường Đại học Sư phạm Kỹ thuật Hưng Yên. Giao diện dựng bằng Tailwind CSS v4 +
các component shadcn/ui (Radix) copy từ `_design_reference/university-information-portal`, dùng chung
bảng màu Công đoàn (đỏ `#C0272D` + vàng `#F5B700`) và type từ `@congdoan/types` với `apps/web`.

## Chạy dự án

Cài đặt dependency và chạy các lệnh chung ở thư mục gốc repo (đã được người điều phối cài sẵn):

```bash
pnpm --filter @congdoan/admin dev        # chạy dev server tại http://localhost:5174
pnpm --filter @congdoan/admin build      # build production vào dist/
pnpm --filter @congdoan/admin typecheck  # tsc --noEmit
pnpm --filter @congdoan/admin test       # vitest run
pnpm --filter @congdoan/admin lint       # eslint
```

Cấu hình `apps/api` phải chạy song song (mặc định `http://localhost:3000`, xem `apps/api/README.md`).
Sao chép `.env.example` thành `.env.local` nếu cần đổi `VITE_API_BASE_URL`.

## Đăng nhập thử

Dùng tài khoản ADMIN được seed sẵn khi chạy `pnpm prisma:seed` ở thư mục gốc:

- Email: `admin@congdoan.utehy.edu.vn` (biến `SEED_ADMIN_EMAIL`)
- Mật khẩu: xem biến `SEED_ADMIN_PASSWORD` trong file `.env` ở thư mục gốc repo (mặc định trong
  `.env.example` là `ChangeMe@123` — đổi ngay ở môi trường thật).

## Kiến trúc thư mục

```
src/
  lib/
    api-client.ts       # fetch wrapper: gắn base URL, Authorization, tự refresh khi 401
    slugify.ts           # sinh slug xem trước phía client (chỉ hiển thị placeholder)
  providers/
    auth-provider.ts     # AuthProvider cho Refine (login/logout/check/onError/getIdentity)
    data-provider.ts     # DataProvider cho Refine, map resource -> endpoint apps/api
    data-provider.test.ts
    notification-provider.ts
  components/
    ui/                  # shadcn/ui component copy từ _design_reference (đã bỏ hậu tố @version)
    layout/AdminLayout.tsx
    common/               # Toaster, ConfirmDeleteDialog, RequireAdmin, PageLoading
  pages/
    login/ dashboard/ posts/ categories/ users/
```

## Giả định & đơn giản hoá đã thực hiện (MVP)

- **Lưu token phía client**: `accessToken` giữ trong biến module-scope (mất khi tải lại trang),
  `refreshToken` lưu ở `localStorage` (khoá `congdoan_admin_refresh_token`). Khi tải lại trang,
  `authProvider.check()` gọi `GET /auth/me` — nếu accessToken đã mất, `api-client.ts` tự nhận 401 và
  gọi `/auth/refresh` một lần để khôi phục phiên. **Production nên chuyển sang httpOnly cookie** do
  backend set, tránh rủi ro XSS đọc được token.
- **Nội dung bài viết**: dùng `<textarea>` thuần (xem TODO trong `PostForm.tsx`) — Phase sau thay
  bằng TipTap rich text editor theo bản thiết kế.
- **Ảnh bìa**: chỉ nhập URL ảnh có sẵn, chưa có chức năng upload file thật.
- **Chuyên mục**: `GET /categories` là endpoint public không phân trang nên `CategoryList` hiển thị
  toàn bộ danh sách một lần (sắp xếp theo `sortOrder`), không có ô tìm kiếm/phân trang như `PostList`.
- **Vai trò (roles) trong form Người dùng**: dùng checkbox HTML thuần (không thêm component
  `checkbox.tsx`/`@radix-ui/react-checkbox` vì không nằm trong danh sách component được yêu cầu copy).
- **Toast/thông báo lỗi**: tự viết `components/common/Toaster.tsx` + `toast-store.ts` (không phụ
  thuộc thư viện ngoài như `sonner`) làm `notificationProvider` cho Refine.
- **Người dùng (Users)**: không có nút xoá vì `apps/api` chưa cung cấp `DELETE /users/:id` — chỉ có
  thể khoá tài khoản qua trường `isActive` khi sửa.
- **Phân trang**: dùng nút "Trước/Sau" đơn giản (không copy component `pagination.tsx` vì không phù
  hợp thao tác bằng state trong SPA — component đó thiết kế cho điều hướng dạng `<a href>`).

## Việc còn thiếu / Phase 2+ (chưa làm ở bước này)

- [ ] Rich text editor thật cho nội dung bài viết (TipTap theo bản thiết kế).
- [ ] Upload ảnh thật (hiện chỉ nhập URL).
- [ ] Trang quản lý Đoàn viên (Members) — chưa có endpoint từ `apps/api`.
- [ ] Trang quản lý Công văn/Văn bản — chưa có endpoint từ `apps/api`.
- [ ] Nhật ký thao tác (Audit log) — `apps/api` đã có `AuditLogDto` trong `@congdoan/types` nhưng
      chưa có endpoint đọc, nên trang quản trị chưa hiển thị.
- [ ] Đổi mật khẩu cho chính người dùng đang đăng nhập (`POST /auth/change-password` đã có ở API
      nhưng chưa có UI ở admin).
- [ ] Chuyển lưu trữ token sang httpOnly cookie (xem mục "Giả định" ở trên).
