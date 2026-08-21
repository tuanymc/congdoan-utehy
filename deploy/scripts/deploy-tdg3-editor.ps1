# deploy/scripts/deploy-tdg3-editor.ps1
# Deploy nhanh TipTap editor + upload ảnh lên tdg3 (congdoan2026).
# CHẠY TRÊN SERVER hosting tdg3 (có C:\inetpub\congdoan2026 và C:\inetpub\congdoan-src).
#
#   powershell -File deploy/scripts/deploy-tdg3-editor.ps1

$ErrorActionPreference = "Stop"

$RepoRoot = "C:\inetpub\congdoan-src"
$AdminSitePath = "C:\inetpub\congdoan2026\admin"
$ApiEnvFile = "C:\inetpub\congdoan\shared\.env"
if (-not (Test-Path $ApiEnvFile)) {
  $ApiEnvFile = "C:\inetpub\congdoan-src\apps\api\.env"
}

if (-not (Test-Path $RepoRoot)) {
  throw "Khong tim thay $RepoRoot — sua `$RepoRoot trong script cho dung thu muc repo tren server."
}
if (-not (Test-Path $AdminSitePath)) {
  throw "Khong tim thay $AdminSitePath — kiem tra IIS physical path cua /admin."
}

Set-Location $RepoRoot
Write-Host "== git pull ==" -ForegroundColor Cyan
git pull

Write-Host "== build ==" -ForegroundColor Cyan
pnpm install --frozen-lockfile
pnpm --filter @congdoan/types build
pnpm --filter @congdoan/admin build
pnpm --filter @congdoan/api build

Write-Host "== copy admin -> IIS ==" -ForegroundColor Cyan
Copy-Item "$RepoRoot\apps\admin\dist\*" -Destination $AdminSitePath -Recurse -Force
Copy-Item "$RepoRoot\deploy\iis\web.config.admin" -Destination "$AdminSitePath\web.config" -Force

Write-Host "== dam bao UPLOAD_IMAGES_DIR trong .env API ==" -ForegroundColor Cyan
if (Test-Path $ApiEnvFile) {
  $envText = Get-Content $ApiEnvFile -Raw
  if ($envText -notmatch "UPLOAD_IMAGES_DIR") {
    Add-Content $ApiEnvFile "`r`nUPLOAD_IMAGES_DIR=C:\inetpub\congdoan2026\web\upload\images`r`n"
    Write-Host "Da them UPLOAD_IMAGES_DIR vao $ApiEnvFile"
  } else {
    Write-Host "UPLOAD_IMAGES_DIR da co trong $ApiEnvFile"
  }
  if ((Test-Path "$RepoRoot\apps\api\.env") -and ($ApiEnvFile -ne "$RepoRoot\apps\api\.env")) {
    Copy-Item $ApiEnvFile -Destination "$RepoRoot\apps\api\.env" -Force
  }
} else {
  Write-Warning "Khong tim thay .env API ($ApiEnvFile) — them thu cong UPLOAD_IMAGES_DIR."
}

Write-Host "== pm2 reload API ==" -ForegroundColor Cyan
pm2 reload deploy\ecosystem.config.js --update-env
pm2 status

Write-Host "== xong. Mo https://tdg3.utehy.edu.vn/admin/posts/create va Ctrl+F5 ==" -ForegroundColor Green
Write-Host "Asset moi phai khac index-BGT6U-5a.js (View Source trang /admin/)."
