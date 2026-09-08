# deploy/scripts/deploy.ps1
# Run by the self-hosted GitHub Actions runner on Windows Server AFTER pnpm build.
# Copies the latest build into the IIS site paths, then reloads the API via PM2.
#
# Windows PowerShell 5.1 reads .ps1 as ANSI unless this file is ASCII-only.
#
# Manual: powershell -File deploy/scripts/deploy.ps1 -Environment production

param(
  [ValidateSet("staging", "production")]
  [string]$Environment = "staging",

  [string]$ApiSitePath = "C:\inetpub\congdoan\api",
  [string]$WebSitePath = "C:\inetpub\congdoan\web",
  [string]$AdminSitePath = "C:\inetpub\congdoan\admin",

  # Real .env is NOT in the repo. Keep it on the server; this script only copies it.
  [string]$ApiEnvFile = "C:\inetpub\congdoan\shared\.env"
)

$ErrorActionPreference = "Stop"
$RepoRoot = Resolve-Path "$PSScriptRoot\..\.."

Write-Host "== Deploy union site HYUTE - env: $Environment ==" -ForegroundColor Cyan

# 1) API: copy dist + package.json + prisma, keep the server .env
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
  Write-Warning "Missing $ApiEnvFile - create the real .env on the server before the first deploy."
}
pnpm install --prod --frozen-lockfile
npx prisma generate --schema=.\prisma\schema.prisma
npx prisma migrate deploy --schema=.\prisma\schema.prisma
Pop-Location

# 2) Web and Admin: copy Vite static files + matching web.config
Write-Host "-- Deploy apps/web --"
New-Item -ItemType Directory -Force -Path $WebSitePath | Out-Null
Copy-Item "$RepoRoot\apps\web\dist\*" -Destination $WebSitePath -Recurse -Force
Copy-Item "$RepoRoot\deploy\iis\web.config.web" -Destination "$WebSitePath\web.config" -Force

Write-Host "-- Deploy apps/admin --"
New-Item -ItemType Directory -Force -Path $AdminSitePath | Out-Null
Copy-Item "$RepoRoot\apps\admin\dist\*" -Destination $AdminSitePath -Recurse -Force
Copy-Item "$RepoRoot\deploy\iis\web.config.admin" -Destination "$AdminSitePath\web.config" -Force

# 3) Reload PM2 for the API - no downtime
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

Write-Host "== Deploy done ==" -ForegroundColor Green
