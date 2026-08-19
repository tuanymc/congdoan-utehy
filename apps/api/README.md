# apps/api

Backend NestJS + TypeScript + Prisma (SQL Server).

## Đã triển khai (Phase 0 + Phase 1 + module mẫu Content)

- Health check: `GET /health`
- Auth: `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout`, `POST /auth/change-password`, `GET /auth/me`
  (JWT access 15 phút + refresh token xoay vòng, lưu hash trong bảng `refresh_tokens`)
- RBAC: 4 vai trò mặc định (ADMIN, UNION_CLERK, DEPARTMENT_OFFICER, MEMBER), permission dạng
  `module:action`, guard `RolesGuard` + `PermissionsGuard` (`src/common/guards`)
- Audit log: `AuditLogService` — ghi mọi thao tác create/update/delete lên bảng `audit_logs`
- Users: `GET/POST /users`, `GET /users/roles`, `GET/PATCH /users/:id` (chỉ ADMIN)
- Content (module mẫu — khuôn cho các module Phase 2+):
  - Công khai: `GET /categories`, `GET /posts`, `GET /posts/:slug`
  - Quản trị: `GET/POST /admin/categories`, `PATCH/DELETE /admin/categories/:id`,
    `GET/POST /admin/posts`, `GET/PATCH/DELETE /admin/posts/:id`
- Swagger UI: `/api/docs`

## Chạy dev

```bash
cp ../../.env.example ../../.env   # sửa DATABASE_URL trỏ SQL Server của bạn
pnpm install
pnpm prisma:generate
pnpm prisma:migrate
pnpm prisma:seed
pnpm --filter @congdoan/api dev
```

## Còn thiếu (việc tiếp theo — xem docs/CURSOR_PROMPT_Website_CongDoan_UTEHY.md)

- Phase 2: domain Membership (Member, Leader, Position, Term, Department, ManagementUnit, EducationLevel)
- Phase 3: domain OfficialDocument (công văn đi/đến + luồng duyệt)
- Phase 4: domain DigitalUtility (Tiện ích số Công đoàn: biểu mẫu điện tử, ví đoàn phí, chatbot AI...)
- Test E2E (Playwright), CI thật chạy trên self-hosted runner (xem `deploy/` và `.github/workflows/`)
