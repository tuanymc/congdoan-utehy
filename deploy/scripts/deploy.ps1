# deploy/scripts/deploy.ps1
# Chạy bởi self-hosted GitHub Actions runner cài trên chính Windows Server, SAU KHI build xong
# (pnpm build ở bước trước trong workflow .github/workflows/ci.yml).
# Copy bản build mới nhất vào đúng path IIS đang trỏ tới, rồi pm2 reload API — không downtime.
#
# Chạy thử thủ công: powershell -File deploy/scripts/deploy.ps1 -Environment staging

param(
  [ValidateSet("staging", "production")]
  [string]$Environment = "staging",

  # Đổi các path dưới đây theo đúng cấu trúc thật trên server của bạn (mục README gốc gợi ý
  # C:\inetpub\congdoan\{api,web,admin}\ — chỉnh lại nếu server dùng cấu trúc khác).
  [string]$ApiSitePath = "C:\inetpub\congdoan\api",
  [string]$WebSitePath = "C:\inetpub\congdoan\web",
  [string]$AdminSitePath = "C:\inetpub\congdoan\admin",

  # File .env thật KHÔNG nằm trong repo — đặt sẵn 1 lần trên server, script chỉ tham chiếu tới,
  # không ghi đè mỗi lần deploy.
  [string]$ApiEnvFile = "C:\inetpub\congdoan\shared\.env"
)

$ErrorActionPreference = "Stop"
$RepoRoot = Resolve-Path "$PSScriptRoot\..\.."

Write-Host "== Deploy Website Công đoàn UTEHY — môi trường: $Environment ==" -ForegroundColor Cyan

# 1) API: copy dist + node_modules (production only) + package.json, giữ nguyên .env trên server
Write-Host "-- Deploy apps/api --"
New-Item -ItemType Directory -Force -Path $ApiSitePath | Out-Null
Copy-Item "$RepoRoot\apps\api\dist\*" -Destination $ApiSitePath -Recurse -Force
Copy-Item "$RepoRoot\apps\api\package.json" -Destination $ApiSitePath -Force
Copy-Item "$RepoRoot\prisma" -Destination "$ApiSitePath\prisma" -Recurse -Force
Copy-Item "$RepoRoot\deploy\iis\web.config.api" -Destination "$ApiSitePath\web.config" -Force

Push-Location $ApiSitePath
if (Test-Path $ApiEnvFile) {
  Copy-Item $ApiEnvFile -Destination ".\.env" -Force
} else {
  Write-Warning "Không tìm thấy $ApiEnvFile — đảm bảo đã tạo file .env thật trên server trước khi deploy lần đầu."
}
pnpm install --prod --frozen-lockfile
npx prisma generate --schema=.\prisma\schema.prisma
npx prisma migrate deploy --schema=.\prisma\schema.prisma
Pop-Location

# 2) Web & Admin: copy file tĩnh build từ Vite + web.config tương ứng
Write-Host "-- Deploy apps/web --"
New-Item -ItemType Directory -Force -Path $WebSitePath | Out-Null
Copy-Item "$RepoRoot\apps\web\dist\*" -Destination $WebSitePath -Recurse -Force
Copy-Item "$RepoRoot\deploy\iis\web.config.web" -Destination "$WebSitePath\web.config" -Force

Write-Host "-- Deploy apps/admin --"
New-Item -ItemType Directory -Force -Path $AdminSitePath | Out-Null
Copy-Item "$RepoRoot\apps\admin\dist\*" -Destination $AdminSitePath -Recurse -Force
Copy-Item "$RepoRoot\deploy\iis\web.config.admin" -Destination "$AdminSitePath\web.config" -Force

# 3) Reload PM2 cho API — không downtime (PM2 khởi động tiến trình mới rồi mới tắt tiến trình cũ)
Write-Host "-- Reload PM2 (congdoan-api) --"
Push-Location $RepoRoot
$pm2List = pm2 jlist | ConvertFrom-Json
if ($pm2List | Where-Object { $_.name -eq "congdoan-api" }) {
  pm2 reload deploy\ecosystem.config.js --env $Environment --update-env
} else {
  pm2 start deploy\ecosystem.config.js --env $Environment
  pm2 save
}
Pop-Location

Write-Host "== Deploy hoàn tất ==" -ForegroundColor Green
