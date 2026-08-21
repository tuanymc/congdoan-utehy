# deploy/scripts/deploy-tdg3-editor.ps1
# Deploy TipTap editor + image upload to tdg3 (congdoan2026).
# Run ON the server that hosts tdg3 (needs C:\inetpub\congdoan2026 and C:\inetpub\congdoan-src).
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
  throw "Missing $RepoRoot - set `$RepoRoot in this script to the repo path on the server."
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
pnpm --filter @congdoan/admin build
pnpm --filter @congdoan/api build

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

Write-Host "== done. Open https://tdg3.utehy.edu.vn/admin/posts/create and Ctrl+F5 ==" -ForegroundColor Green
Write-Host "New asset must differ from index-BGT6U-5a.js (View Source of /admin/)."
