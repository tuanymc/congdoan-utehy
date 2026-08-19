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
CORS_ORIGINS="https://congdoan.utehy.edu.vn,https://admin.congdoan.utehy.edu.vn"
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
provider = "sqlserver"
'@ | Set-Content -Encoding utf8 prisma\migrations\migration_lock.toml

$ts = Get-Date -Format "yyyyMMddHHmmss"
mkdir "prisma\migrations\${ts}_init" -Force | Out-Null
pnpm exec prisma migrate diff --from-empty --to-schema-datamodel=prisma/schema.prisma --script |
  Set-Content -Encoding utf8 "prisma\migrations\${ts}_init\migration.sql"
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

## Bước 5 — Tạo 3 site trong IIS

Trong **IIS Manager**, chuột phải **Sites** → **Add Website** 3 lần:

| Site | Physical path | Binding gợi ý | Nguồn web.config |
|---|---|---|---|
| congdoan-api | thư mục rỗng bất kỳ, ví dụ `C:\inetpub\congdoan\api` | `api.congdoan.utehy.edu.vn` (hoặc port riêng khi test) | `deploy\iis\web.config.api` |
| congdoan-web | `C:\inetpub\congdoan\web` (chứa `apps\web\dist`) | `congdoan.utehy.edu.vn` | `deploy\iis\web.config.web` |
| congdoan-admin | `C:\inetpub\congdoan\admin` | `admin.congdoan.utehy.edu.vn` | `deploy\iis\web.config.admin` |

Nếu server staging chưa có DNS/domain thật, dùng port riêng cho từng site (ví dụ 8081/8082/8083)
và sửa file hosts (`C:\Windows\System32\drivers\etc\hosts`) hoặc test trực tiếp qua
`http://localhost:8081` — chỉ cần nhớ đổi lại `CORS_ORIGINS` trong `.env` và `VITE_API_BASE_URL`
lúc build `apps/web`/`apps/admin` cho khớp domain/port thật khi lên production.

Copy dữ liệu build vào đúng physical path và đặt tên `web.config`:

```powershell
New-Item -ItemType Directory -Force -Path C:\inetpub\congdoan\api, C:\inetpub\congdoan\web, C:\inetpub\congdoan\admin

Copy-Item deploy\iis\web.config.api   -Destination C:\inetpub\congdoan\api\web.config -Force
Copy-Item apps\web\dist\*             -Destination C:\inetpub\congdoan\web -Recurse -Force
Copy-Item deploy\iis\web.config.web   -Destination C:\inetpub\congdoan\web\web.config -Force
Copy-Item apps\admin\dist\*           -Destination C:\inetpub\congdoan\admin -Recurse -Force
Copy-Item deploy\iis\web.config.admin -Destination C:\inetpub\congdoan\admin\web.config -Force
```

(Đây chính xác là những gì `deploy\scripts\deploy.ps1` tự động hoá cho các lần deploy sau — xem
Bước 7.)

Với site `congdoan-api`, **không** trỏ physical path vào `apps\api\dist` — site này chỉ là một vỏ
IIS rỗng chứa `web.config` để reverse-proxy sang tiến trình Node do PM2 quản lý ở `127.0.0.1:3000`.

---

## Bước 6 — Kiểm tra end-to-end

1. Mở `http://<domain-hoặc-port-web>/` — phải thấy trang chủ Công đoàn tải được.
2. Mở `http://<domain-hoặc-port-admin>/login` — đăng nhập bằng `SEED_ADMIN_EMAIL` /
   `SEED_ADMIN_PASSWORD` đã đặt ở Bước 2.
3. Trong trang admin, thử tạo 1 bài viết (Post) mới — nếu lưu thành công và hiện lại trên trang
   web công khai, tức là chuỗi Admin → API → SQL Server → Web đã thông toàn bộ.
4. Mở `http://<domain-api>/api/docs` — phải thấy Swagger UI liệt kê đầy đủ endpoint.
5. Kiểm tra route SPA fallback: mở thẳng một URL con bất kỳ trên web/admin (ví dụ
   `/gioi-thieu` hoặc `/posts`) rồi bấm F5 reload — nếu ra lỗi 404 của IIS thay vì tải đúng trang,
   nghĩa là rule `ReactRouterSpaFallback` trong web.config chưa được áp dụng (kiểm tra lại module
   URL Rewrite đã cài đúng chưa).

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
