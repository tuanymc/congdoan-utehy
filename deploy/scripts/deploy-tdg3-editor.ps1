# deploy/scripts/deploy-tdg3-editor.ps1
# Deploy public web + admin + API to congdoan2026 (IIS + PM2).
# Run ON the server (needs C:\inetpub\congdoan2026 and C:\inetpub\congdoan-src).
#
#   powershell -File deploy/scripts/deploy-tdg3-editor.ps1
#
# This copies apps/web/dist to IIS. Without that step, /van-ban keeps the old
# bundle (index-tY2hlQHo.js) and has no search UI.

$ErrorActionPreference = "Stop"

$RepoRoot = "C:\inetpub\congdoan-src"
$WebSitePath = "C:\inetpub\congdoan2026\web"
$AdminSitePath = "C:\inetpub\congdoan2026\admin"
$ApiEnvFile = "C:\inetpub\congdoan\shared\.env"
if (-not (Test-Path $ApiEnvFile)) {
  $ApiEnvFile = "C:\inetpub\congdoan-src\apps\api\.env"
}

if (-not (Test-Path $RepoRoot)) {
  throw "Missing $RepoRoot - set `$RepoRoot in this script to the repo path on the server."
}
if (-not (Test-Path $WebSitePath)) {
  throw "Missing $WebSitePath - check IIS physical path for the public site."
}
if (-not (Test-Path $AdminSitePath)) {
  throw "Missing $AdminSitePath - check IIS physical path for /admin."
}

Set-Location $RepoRoot
Write-Host "== git pull ==" -ForegroundColor Cyan
git pull

Write-Host "== build ==" -ForegroundColor Cyan
pnpm install --frozen-lockfile
pnpm --filter @congdoan/types build
pnpm --filter @congdoan/web build
pnpm --filter @congdoan/admin build
pnpm --filter @congdoan/api build

Write-Host "== copy web -> IIS ==" -ForegroundColor Cyan
Copy-Item "$RepoRoot\apps\web\dist\*" -Destination $WebSitePath -Recurse -Force
Copy-Item "$RepoRoot\deploy\iis\web.config.web" -Destination "$WebSitePath\web.config" -Force

Write-Host "== copy admin -> IIS ==" -ForegroundColor Cyan
Copy-Item "$RepoRoot\apps\admin\dist\*" -Destination $AdminSitePath -Recurse -Force
Copy-Item "$RepoRoot\deploy\iis\web.config.admin" -Destination "$AdminSitePath\web.config" -Force

Write-Host "== ensure UPLOAD_IMAGES_DIR in API .env ==" -ForegroundColor Cyan
if (Test-Path $ApiEnvFile) {
  $envText = Get-Content $ApiEnvFile -Raw
  if ($envText -notmatch "UPLOAD_IMAGES_DIR") {
    Add-Content $ApiEnvFile "`r`nUPLOAD_IMAGES_DIR=C:\inetpub\congdoan2026\web\upload\images`r`n"
    Write-Host "Added UPLOAD_IMAGES_DIR to $ApiEnvFile"
  } else {
    Write-Host "UPLOAD_IMAGES_DIR already set in $ApiEnvFile"
  }
  if ((Test-Path "$RepoRoot\apps\api\.env") -and ($ApiEnvFile -ne "$RepoRoot\apps\api\.env")) {
    Copy-Item $ApiEnvFile -Destination "$RepoRoot\apps\api\.env" -Force
  }
} else {
  Write-Warning "API .env not found ($ApiEnvFile) - add UPLOAD_IMAGES_DIR manually."
}

Write-Host "== pm2 reload API ==" -ForegroundColor Cyan
pm2 reload deploy\ecosystem.config.js --update-env
pm2 status

Write-Host "== done. Open https://congdoan.utehy.edu.vn/van-ban and Ctrl+F5 ==" -ForegroundColor Green
Write-Host "View Source: JS hash must differ from index-tY2hlQHo.js. Search box must appear."
