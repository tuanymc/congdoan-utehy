# Website Công đoàn UTEHY — Dự án nâng cấp

Cấu trúc thư mục đã được tổ chức lại theo bản thiết kế nâng cấp (Node.js + React + SQL Server).
Triển khai production trên **Windows Server có sẵn bằng IIS + PM2 + Memurai** — không dùng Docker.
Xem chi tiết đầy đủ trong `docs/`.

## Cấu trúc

- `apps/api` — Backend NestJS (chưa scaffold, Cursor sẽ tạo ở Phase 0)
- `apps/web` — Frontend React: cổng công khai + cổng đoàn viên (chưa scaffold)
- `apps/admin` — Frontend React + Refine: trang quản trị (chưa scaffold)
- `packages/ui` — Design system dùng chung (component)
- `packages/types` — DTO/type dùng chung giữa frontend và backend
- `packages/config` — eslint/tsconfig/tailwind config dùng chung
- `prisma/` — Schema và migration cơ sở dữ liệu SQL Server
- `deploy/` — Cấu hình triển khai native lên Windows Server: `ecosystem.config.js` (PM2), mẫu
  `web.config` cho IIS (ARR/URL Rewrite), script PowerShell deploy — KHÔNG có Docker/docker-compose
- `.github/workflows/` — CI/CD, chạy trên self-hosted GitHub Actions runner cài ngay trên Windows Server
- `docs/` — Bản thiết kế & kế hoạch nâng cấp, prompt dùng cho Cursor
- `_reference/university-information-portal/` — Bộ giao diện mẫu React/Vite/Tailwind/shadcn dùng làm design reference (KHÔNG phải hệ thống cũ — tái sử dụng cho giao diện mới)
- `web_cu/` — Toàn bộ mã nguồn và dữ liệu hệ thống cũ (ASP.NET Web Forms, .NET Framework 4.8), giữ lại để đối chiếu nghiệp vụ và di trú dữ liệu, không đưa vào hệ thống mới

## Hạ tầng triển khai (đã chốt)

- **SQL Server** — chạy native trên Windows Server hiện có (giữ nguyên).
- **Memurai** — bản Redis-compatible cho Windows, cài như Windows Service (thay Redis vì Redis không có bản Windows chính thức).
- **IIS** — reverse proxy/HTTPS phía trước tiến trình Node.js (ARR + URL Rewrite), serve file tĩnh cho web/admin.
- **PM2** — quản lý tiến trình `apps/api`, tự khởi động lại khi lỗi, khởi động cùng server.
- **CI/CD** — self-hosted GitHub Actions runner cài trực tiếp trên Windows Server, build xong tự copy vào path IIS và `pm2 reload`.
- Local dev của lập trình viên cũng cài native (SQL Server Express + Memurai), không dùng Docker, để khớp hoàn toàn với production.

## Bắt đầu

1. Đọc `docs/Thiet_ke_Ke_hoach_Nang_cap_Website_CongDoan_UTEHY.docx` để nắm thiết kế tổng thể.
2. Mở thư mục này trong Cursor, dán nội dung `docs/CURSOR_PROMPT_Website_CongDoan_UTEHY.md` vào Composer/Agent và chạy theo từng Phase.
