# Tạo tài khoản đăng nhập cho công đoàn viên chưa có user.
# Mật khẩu mặc định: hyute123. An toàn chạy lại (bỏ qua người đã có tài khoản).
#
# Trên VPS, PowerShell (Run as Administrator không bắt buộc):
#   powershell -File C:\inetpub\congdoan-src\deploy\scripts\create-member-logins.ps1

param(
  [string]$RepoRoot = "C:\inetpub\congdoan-src",
  [string]$ApiEnvFile = "C:\inetpub\congdoan\shared\.env"
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path $RepoRoot)) {
  throw "Không thấy thư mục nguồn $RepoRoot. Đổi -RepoRoot cho đúng path git trên VPS."
}

Set-Location $RepoRoot

if (-not (Test-Path "$RepoRoot\prisma\create-missing-union-member-logins.ts")) {
  throw "Thiếu script tạo tài khoản. Kéo code mới (git pull) rồi chạy lại."
}

if (-not (Test-Path "$RepoRoot\.env")) {
  if (Test-Path $ApiEnvFile) {
    Copy-Item $ApiEnvFile -Destination "$RepoRoot\.env" -Force
    Write-Host "Đã copy $ApiEnvFile -> $RepoRoot\.env"
  } else {
    throw "Không thấy .env. Tạo $ApiEnvFile (có DATABASE_URL) rồi chạy lại."
  }
}

Write-Host "== Tạo tài khoản công đoàn viên chưa có user (mật khẩu mặc định hyute123) ==" -ForegroundColor Cyan
pnpm create:member-logins
