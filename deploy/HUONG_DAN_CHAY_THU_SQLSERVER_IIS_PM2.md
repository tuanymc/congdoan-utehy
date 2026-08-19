# Hướng dẫn chạy thử thật: SQL Server + IIS + PM2 trên Windows Server

Tài liệu này hướng dẫn triển khai thử nghiệm lần đầu trên Windows Server thật, đi từ cài đặt nền
tảng đến chạy được cả 3 phần (`apps/api`, `apps/web`, `apps/admin`) qua IIS. Nên làm trên máy
**staging** trước, không làm thẳng trên máy production đang phục vụ người dùng thật.

Giả định: bạn đã có quyền Administrator trên Windows Server, và đã có bản build code trong thư mục
dự án (`apps/`, `packages/`, `prisma/`, `deploy/`) như đã đưa vào máy bạn ở bước trước.

---

## Bước 0 — Kiểm tra trước khi bắt đầu

```powershell
node -v      # cần >= 20
git --version
```

Nếu chưa có Node.js 20 LTS, cài từ https://nodejs.org (bản MSI, chọn LTS).

---

## Bước 1 — Cài các thành phần nền tảng (chỉ làm 1 lần trên server)

### 1.1. pnpm, PM2

```powershell
corepack enable
corepack prepare pnpm@9.0.0 --activate
npm i -g pm2
npm i -g pm2-windows-startup
pm2-startup install    # để PM2 tự khởi động lại cùng Windows khi server reboot
```

### 1.2. SQL Server

Trường đã có sẵn hạ tầng SQL Server theo thiết kế — nếu server staging chưa có, cài **SQL Server
Express** (miễn phí, đủ cho staging): https://www.microsoft.com/sql-server/sql-server-downloads

Sau khi cài, mở **SQL Server Configuration Manager**:
- Bật **TCP/IP** trong "SQL Server Network Configuration" (mặc định SQL Server Express chỉ nghe
  qua Named Pipes, cần bật TCP/IP để Prisma kết nối được qua `sqlserver://`).
- Đặt cổng TCP cố định `1433` cho instance (tab TCP/IP Properties → IP Addresses → IPAll → TCP Port
  = 1433).
- Khởi động lại SQL Server service sau khi đổi.
- Đảm bảo chế độ xác thực là **SQL Server and Windows Authentication mode** (không chỉ Windows-only),
  vì `DATABASE_URL` trong `.env.example` dùng user/password kiểu SQL auth (`sa`).

Tạo database rỗng:

```sql
CREATE DATABASE CongDoanUtehy;
```

### 1.3. Memurai (thay thế Redis cho Windows)

Tải và cài từ https://www.memurai.com — cài như Windows Service (mặc định chạy sẵn ở cổng 6379,
không cần cấu hình thêm cho lần chạy thử này).

### 1.4. IIS + ARR + URL Rewrite

Trong **Server Manager → Add Roles and Features**, bật role **Web Server (IIS)**.

Cài thêm 2 module (không có sẵn trong IIS mặc định):
- **URL Rewrite**: https://www.iis.net/downloads/microsoft/url-rewrite
- **Application Request Routing (ARR)**: https://www.iis.net/downloads/microsoft/application-request-routing

Sau khi cài ARR, mở **IIS Manager** → chọn tên **Server** ở cấp cao nhất (không phải site) →
**Application Request Routing Cache** → **Server Proxy Settings...** (panel bên phải) → tick
**Enable proxy** → **Apply**. Bỏ qua bước này sẽ khiến mọi rule reverse-proxy báo lỗi 502.

---

## Bước 2 — Cấu hình biến môi trường thật

Tạo thư mục chứa file `.env` thật, **không đặt trong thư mục repo** (để không lỡ commit):

```powershell
mkdir C:\inetpub\congdoan\shared
notepad C:\inetpub\congdoan\shared\.env
```

Dán nội dung dựa theo `.env.example` ở gốc repo, chỉnh lại giá trị thật:

```
DATABASE_URL="sqlserver://localhost:1433;database=CongDoanUtehy;user=sa;password=<mật khẩu SQL thật của bạn>;trustServerCertificate=true"
JWT_ACCESS_SECRET="<chuỗi ngẫu nhiên dài, đổi khác giá trị mẫu>"
JWT_ACCESS_EXPIRES_IN="15m"
JWT_REFRESH_SECRET="<chuỗi ngẫu nhiên dài khác, đổi khác giá trị mẫu>"
JWT_REFRESH_EXPIRES_IN="7d"
REDIS_URL="redis://localhost:6379"
SEED_ADMIN_EMAIL="admin@congdoan.utehy.edu.vn"
SEED_ADMIN_PASSWORD="<mật khẩu admin ban đầu, đổi ngay sau khi đăng nhập lần đầu>"
API_PORT=3000
# Web và admin cùng chạy trên 1 domain congdoan.utehy.edu.vn (web ở "/", admin ở "/admin" — xem
# Bước 5), nên request từ trình duyệt tới API luôn same-origin, KHÔNG bị CORS chặn. Dòng này chỉ
# thật sự cần khi chạy "pnpm dev" cục bộ (web/admin dev server ở port riêng, khác origin với API).
CORS_ORIGINS="http://localhost:5173,http://localhost:5174"
```

Sinh chuỗi ngẫu nhiên nhanh cho 2 dòng `JWT_*_SECRET` bằng PowerShell:

```powershell
[Convert]::ToBase64String((1..48 | ForEach-Object { Get-Random -Maximum 256 }))
```

---

## Bước 3 — Build code và chạy migrate lần đầu

Trong thư mục gốc repo trên server (ví dụ `D:\WEBSITE DA HOAN THANH\WebsiteCongDoan\CongDoan.utehy.edu.vn`):

```powershell
pnpm install --frozen-lockfile

# QUAN TRỌNG: lệnh Prisma CLI (prisma:generate/deploy/seed) chạy từ THƯ MỤC GỐC repo, nên đọc
# .env ở gốc repo (hoặc prisma/.env) — KHÔNG phải apps/api/.env (đó là chỗ tiến trình PM2 đọc, xem
# Bước 4). Copy .env ra CẢ HAI chỗ:
Copy-Item C:\inetpub\congdoan\shared\.env .env               # cho các lệnh Prisma CLI chạy ở bước này
Copy-Item C:\inetpub\congdoan\shared\.env apps\api\.env      # cho tiến trình API chạy qua PM2 ở Bước 4

pnpm prisma:generate
```

**LẦN ĐẦU TIÊN duy nhất** (database `CongDoanUtehy` còn trống, chưa có migration nào trong
`prisma/migrations/`), có 2 cách tạo migration khởi tạo — chọn theo quyền của user trong `DATABASE_URL`:

**Cách A — nếu user (vd `sa`) có quyền `CREATE DATABASE` ở cấp server** (dbcreator/sysadmin role):
Prisma tự tạo một database tạm ("shadow database") để so sánh schema, đơn giản nhất:

```powershell
pnpm prisma:migrate -- --name init
```

**Cách B — nếu user CHỈ có quyền trên riêng database `CongDoanUtehy`** (không có `CREATE DATABASE`
ở `master`, gặp lỗi `P3014 ... CREATE DATABASE permission denied`) — đây là cấu hình phổ biến và
đúng chuẩn bảo mật (least-privilege) ở nhiều hạ tầng do IT quản lý tập trung. Sinh migration SQL
tĩnh trực tiếp từ schema, không cần kết nối/tạo database nào:

```powershell
mkdir prisma\migrations -Force | Out-Null
@'
# Please do not edit this file manually
# It should be added in your version-control system (e.g., Git)
provider = "mssql"
'@ | Set-Content -Encoding utf8 prisma\migrations\migration_lock.toml
# Lưu ý: schema.prisma khai báo `provider = "sqlserver"`, nhưng tên định danh nội bộ Prisma dùng
# cho migration_lock.toml của SQL Server lại là "mssql" — khác chuỗi, đây là điểm dễ nhầm của Prisma
# (không phải lỗi đánh máy). Ghi sai thành "sqlserver" ở đây sẽ gặp lỗi P3019 khi chạy migrate deploy.

$ts = Get-Date -Format "yyyyMMddHHmmss"
mkdir "prisma\migrations\${ts}_init" -Force | Out-Null
# QUAN TRỌNG: "-Encoding utf8" trên Windows PowerShell tự chèn BOM (byte-order-mark) đầu file, SQL
# Server đọc phải BOM đó sẽ báo "Incorrect syntax" ngay câu lệnh đầu tiên. Nội dung SQL sinh ra ở
# đây thuần ASCII (tên bảng/cột lấy từ schema.prisma đều là tiếng Anh) nên dùng "-Encoding ascii" —
# không bao giờ có BOM, an toàn tuyệt đối cho trường hợp này.
pnpm exec prisma migrate diff --from-empty --to-schema-datamodel=prisma/schema.prisma --script |
  Out-File -Encoding ascii -FilePath "prisma\migrations\${ts}_init\migration.sql"
```

Cả 2 cách, bước tiếp theo giống nhau — áp dụng (Cách B chưa áp dụng gì, cần chạy `prisma:deploy`;
Cách A đã áp dụng sẵn nên bước này sẽ báo "No pending migrations", vô hại) rồi seed và build:

```powershell
pnpm prisma:deploy      # áp dụng migration lên CongDoanUtehy — chỉ cần quyền trên database đích
pnpm prisma:seed        # tạo tài khoản admin đầu tiên (SEED_ADMIN_EMAIL/PASSWORD ở .env)
pnpm build               # build cả apps/api, apps/web, apps/admin
```

Sau khi migration khởi tạo được tạo ra (thư mục `prisma/migrations/<timestamp>_init/`), **nhớ commit
thư mục này vào Git** (`git add prisma/migrations && git commit -m "feat(prisma): initial migration"`)
rồi push, để lần deploy tiếp theo qua CI (luôn dùng `prisma:deploy`, không phải `migrate dev`) có
migration để áp dụng.

File `.env` ở gốc repo chỉ dùng để chạy các lệnh CLI ở bước này — không commit vào Git (đã có trong
`.gitignore`), và không cần thiết nữa sau khi triển khai xong qua `deploy.ps1` (script đó chỉ đọc từ
`C:\inetpub\congdoan\shared\.env`, không đụng tới file `.env` ở gốc repo).

Nếu `pnpm prisma:deploy` báo lỗi kết nối, kiểm tra lại: TCP/IP đã bật ở bước 1.2 chưa, tường lửa
Windows có chặn cổng 1433 không (`New-NetFirewallRule -DisplayName "SQL Server" -Direction Inbound
-LocalPort 1433 -Protocol TCP -Action Allow` nếu SQL Server và web server khác máy), user/password
trong `DATABASE_URL` đúng chưa.

---

## Bước 4 — Chạy API bằng PM2

```powershell
cd "D:\WEBSITE DA HOAN THANH\WebsiteCongDoan\CongDoan.utehy.edu.vn"
pm2 start deploy\ecosystem.config.js --env production
pm2 save
pm2 status          # phải thấy "congdoan-api" ở trạng thái "online"
pm2 logs congdoan-api --lines 50
```

Kiểm tra API sống ở cổng nội bộ trước khi đụng tới IIS:

```powershell
curl http://127.0.0.1:3000/health
```

Phải trả về JSON `status: ok` (theo `apps/api/src/modules/health`). Nếu lỗi ở bước này thì chưa
cần đụng đến IIS — xem `pm2 logs congdoan-api` để biết lỗi thật (thường là do `.env` sai hoặc thiếu
`apps/api/.env`).

---

## Bước 5 — Tạo 1 site IIS + 2 sub-application (1 domain duy nhất)

Đã chốt dùng **1 domain duy nhất** `congdoan.utehy.edu.vn` cho cả 3 phần, chia theo đường dẫn:

| Đường dẫn | Nội dung | Physical path | Nguồn web.config |
|---|---|---|---|
| `/` | apps/web (site chính) | `C:\inetpub\congdoan\web` (chứa `apps\web\dist`) | `deploy\iis\web.config.web` |
| `/admin` | apps/admin (IIS Application nested) | `C:\inetpub\congdoan\admin` (chứa `apps\admin\dist`) | `deploy\iis\web.config.admin` |
| `/api` | apps/api (IIS Application nested, reverse proxy) | thư mục rỗng, ví dụ `C:\inetpub\congdoan\api` | `deploy\iis\web.config.api` |

`/admin` và `/api` phải là **IIS Application** nested dưới site chính (không phải site/binding
riêng) — đây là điểm khác so với mô hình 3 site độc lập. apps/admin đã được build sẵn với
`base: "/admin/"` (asset trỏ đúng) và React Router `basename="/admin"` (xem
`apps/admin/vite.config.ts`, `apps/admin/src/App.tsx`) — **không cần build lại** nếu bạn đã chạy
`pnpm build` sau khi đồng bộ code mới nhất từ Git.

**Copy dữ liệu build vào đúng physical path trước** (nếu chưa làm ở Bước 3):

```powershell
New-Item -ItemType Directory -Force -Path C:\inetpub\congdoan\api, C:\inetpub\congdoan\web, C:\inetpub\congdoan\admin

Copy-Item deploy\iis\web.config.api   -Destination C:\inetpub\congdoan\api\web.config -Force
Copy-Item apps\web\dist\*             -Destination C:\inetpub\congdoan\web -Recurse -Force
Copy-Item deploy\iis\web.config.web   -Destination C:\inetpub\congdoan\web\web.config -Force
Copy-Item apps\admin\dist\*           -Destination C:\inetpub\congdoan\admin -Recurse -Force
Copy-Item deploy\iis\web.config.admin -Destination C:\inetpub\congdoan\admin\web.config -Force
```

(Đây chính xác là những gì `deploy\scripts\deploy.ps1` tự động hoá cho các lần deploy sau — xem
Bước 7. Với `congdoan\api`, **không** copy `apps\api\dist` vào đó — thư mục này chỉ cần đúng 1 file
`web.config` để làm proxy sang tiến trình Node do PM2 quản lý ở `127.0.0.1:3000`.)

**Tạo site + 2 sub-application bằng PowerShell** (module `WebAdministration` có sẵn trên mọi
Windows Server đã cài IIS):

```powershell
Import-Module WebAdministration

# Site chính — binding domain thật. Nếu server staging chưa có DNS trỏ vào, có thể tạm bỏ
# -HostHeader (site nghe mọi domain trên cổng đó) và test qua http://localhost/ hoặc IP server.
New-Website -Name "congdoan" -PhysicalPath "C:\inetpub\congdoan\web" -Port 80 -HostHeader "congdoan.utehy.edu.vn"

# 2 Application nested — "-Site congdoan" gắn chúng vào ĐÚNG site vừa tạo, không phải site riêng.
New-WebApplication -Name "admin" -Site "congdoan" -PhysicalPath "C:\inetpub\congdoan\admin"
New-WebApplication -Name "api"   -Site "congdoan" -PhysicalPath "C:\inetpub\congdoan\api"
```

Cấu hình HTTPS: mở **IIS Manager** → site `congdoan` → **Bindings...** → **Add** → type `https`,
chọn chứng chỉ SSL của trường → **OK**. Cả `/admin` và `/api` tự động dùng chung binding/chứng chỉ
của site cha, không cần cấu hình HTTPS riêng cho từng Application.

Nếu IIS Manager báo lỗi khi tạo Application do App Pool mặc định đang chạy chế độ "Managed Code"
không phù hợp (thường không xảy ra với 2 lệnh trên vì mặc định dùng lại App Pool của site cha), tạo
riêng 1 App Pool "No Managed Code" và gán qua tham số `-ApplicationPool` của `New-WebApplication`.

---

## Bước 6 — Kiểm tra end-to-end

Toàn bộ đều trên cùng domain `congdoan.utehy.edu.vn` (thay bằng `http://localhost` nếu server
staging chưa có DNS thật):

1. Mở `https://congdoan.utehy.edu.vn/` — phải thấy trang chủ Công đoàn tải được.
2. Mở `https://congdoan.utehy.edu.vn/admin/login` — đăng nhập bằng `SEED_ADMIN_EMAIL` /
   `SEED_ADMIN_PASSWORD` đã đặt ở Bước 2.
3. Trong trang admin, thử tạo 1 bài viết (Post) mới — nếu lưu thành công và hiện lại trên trang
   web công khai, tức là chuỗi Admin → API → SQL Server → Web đã thông toàn bộ.
4. Mở `https://congdoan.utehy.edu.vn/api/docs` — phải thấy Swagger UI liệt kê đầy đủ endpoint.
5. Kiểm tra route SPA fallback: mở thẳng một URL con bất kỳ trên web/admin (ví dụ
   `/gioi-thieu` hoặc `/admin/posts`) rồi bấm F5 reload — nếu ra lỗi 404 của IIS thay vì tải đúng
   trang, nghĩa là rule `ReactRouterSpaFallback` trong web.config chưa được áp dụng (kiểm tra lại
   module URL Rewrite đã cài đúng chưa, và đảm bảo `/admin` được tạo bằng `New-WebApplication`
   chứ không phải chỉ là 1 thư mục con thường trong site — nếu chỉ là thư mục con, IIS sẽ không áp
   dụng web.config riêng của nó đúng cách).
6. Mở thẳng `https://congdoan.utehy.edu.vn/api/health` — phải trả JSON `status: ok`, xác nhận
   reverse-proxy `/api` hoạt động đúng qua IIS (khác với `curl 127.0.0.1:3000/health` ở Bước 4 vốn
   chỉ kiểm tra thẳng Node, chưa qua IIS).

---

## Bước 7 — Từ đây trở đi: để CI/CD tự động hoá

Sau khi xác nhận chạy thủ công thành công, cài **self-hosted GitHub Actions runner** ngay trên
server này (theo hướng dẫn trong `deploy\README.md`, mục cài đặt runner) để `.github\workflows\ci.yml`
tự động build + test + gọi `deploy\scripts\deploy.ps1` mỗi khi push lên nhánh `main`. Script
`deploy.ps1` làm đúng các thao tác copy ở Bước 5 và `pm2 reload` không downtime, nên từ lần deploy
thứ 2 trở đi bạn không cần lặp lại các lệnh Copy-Item thủ công nữa.

---

## Xử lý sự cố thường gặp

- **502 Bad Gateway ở site API**: chưa bật "Enable proxy" trong ARR (Bước 1.4), hoặc PM2 chưa chạy
  (`pm2 status` kiểm tra), hoặc sai cổng trong `web.config.api` so với `API_PORT` trong `.env`.
- **PM2 báo "errored" liên tục**: xem `pm2 logs congdoan-api --err` — thường do thiếu file
  `apps\api\.env`, hoặc `prisma generate` chưa chạy nên thiếu Prisma Client, hoặc sai
  `DATABASE_URL`.
- **Trang admin gọi API báo lỗi CORS**: domain thật của trang admin/web chưa có trong
  `CORS_ORIGINS` của `.env` — sửa xong phải `pm2 reload congdoan-api --update-env` để áp dụng.
  chạy: `pm2 reload deploy\ecosystem.config.js --update-env`
- **F5 reload một route con ra lỗi 404**: module URL Rewrite chưa cài hoặc web.config chưa được
  copy đúng vào physical path của site — xem lại Bước 5.
- **Không đăng nhập được admin dù đúng mật khẩu seed**: kiểm tra `pnpm prisma:seed` đã chạy thành
  công chưa (xem log lúc chạy, phải báo tạo user + gán role ADMIN); có thể chạy lại an toàn (script
  seed idempotent, không tạo trùng nếu email đã tồn tại).
- **`prisma:deploy` báo lỗi `P3018 ... Incorrect syntax near '﻿'`** (Cách B ở Bước 3): file
  `migration.sql` bị ghi kèm BOM do dùng `-Encoding utf8` trên Windows PowerShell — xem lại đã dùng
  đúng `-Encoding ascii` chưa. Sau khi sửa lại file, migration cũ đã bị Prisma đánh dấu "failed",
  phải gỡ trước khi thử lại: `pnpm exec prisma migrate resolve --rolled-back <tên-migration>
  --schema=prisma/schema.prisma` (lấy `<tên-migration>` từ tên thư mục trong `prisma/migrations/`,
  ví dụ `20260819085744_init`), rồi chạy lại `pnpm prisma:deploy`.
