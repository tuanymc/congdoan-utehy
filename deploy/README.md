# deploy

Triển khai trực tiếp lên Windows Server bằng IIS + PM2 + Memurai — KHÔNG dùng Docker (quyết định đã
chốt, xem `docs/CURSOR_PROMPT_Website_CongDoan_UTEHY.md` mục "Kiến trúc triển khai").

## Nội dung

- `ecosystem.config.js` — cấu hình PM2 quản lý tiến trình `apps/api` (tự khởi động lại khi lỗi, ghi
  log ra `logs/api-*.log`). `apps/web` và `apps/admin` KHÔNG cần PM2 vì là site tĩnh do IIS serve
  trực tiếp.
- `iis/web.config.api` — mẫu web.config reverse-proxy (ARR + URL Rewrite) từ IIS sang tiến trình
  Node.js do PM2 quản lý.
- `iis/web.config.web`, `iis/web.config.admin` — mẫu web.config cho 2 site tĩnh, xử lý SPA fallback
  (mọi route không phải file tĩnh trả về `index.html` để React Router tự điều hướng).
- `scripts/deploy.ps1` — script PowerShell chạy bởi self-hosted GitHub Actions runner sau khi build
  xong: copy bản build vào đúng path IIS, chạy `prisma migrate deploy`, `pm2 reload` không downtime.

## Cài đặt một lần trên Windows Server (trước lần deploy đầu tiên)

1. Cài Node.js 20 LTS, `pnpm`, `pm2` (`npm i -g pnpm pm2`), `pm2-windows-startup` (để PM2 tự chạy
   cùng Windows: `npm i -g pm2-windows-startup && pm2-startup install`).
2. Cài SQL Server (đã có sẵn theo hạ tầng hiện tại của trường) và **Memurai**
   (https://www.memurai.com — bản Redis-compatible cho Windows, cài như Windows Service).
3. Cài IIS + module **Application Request Routing (ARR)** + **URL Rewrite**, bật "Enable proxy"
   trong ARR Server Proxy Settings (xem chi tiết comment trong `iis/web.config.api`).
4. Tạo 1 site IIS duy nhất (binding `congdoan.utehy.edu.vn`, physical path = `apps/web/dist`) +
   2 IIS Application nested `/admin` và `/api` trỏ tới physical path riêng — xem hướng dẫn chi tiết
   ở Bước 5 trong `deploy/HUONG_DAN_CHAY_THU_SQLSERVER_IIS_PM2.md` (đã chốt dùng 1 domain duy nhất,
   không tách subdomain riêng cho admin/api).
5. Cài self-hosted GitHub Actions runner trên chính server này (xem `.github/workflows/ci.yml`).
6. Tạo file `.env` thật tại `C:\inetpub\congdoan\shared\.env` (không commit vào git) theo mẫu
   `.env.example` ở gốc repo — script `deploy.ps1` sẽ copy file này vào cạnh `dist/main.js` mỗi lần
   deploy.

## Deploy

CI tự chạy `deploy/scripts/deploy.ps1` sau khi build (xem `.github/workflows/ci.yml`). Chạy thủ công
khi cần:

```powershell
powershell -File deploy\scripts\deploy.ps1 -Environment production
```

## Local dev của lập trình viên

Cài native, KHÔNG dùng Docker (kể cả cho tiện) — SQL Server Express + Memurai cài trực tiếp trên máy
dev, để khớp hoàn toàn với production. Xem hướng dẫn trong `.env.example` ở gốc repo.
