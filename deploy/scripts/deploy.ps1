# deploy/scripts/deploy.ps1
# Run on Windows Server AFTER pnpm build in the git checkout (congdoan-src).
#
# Windows PowerShell 5.1 reads .ps1 as ANSI unless this file is ASCII-only.
#
# PM2 runs apps/api from the git checkout (see deploy/ecosystem.config.js).
# IIS /api is only a reverse-proxy folder: copy web.config, never dist or node_modules.
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
$RepoRoot = (Resolve-Path "$PSScriptRoot\..\..").Path
$ApiAppPath = Join-Path $RepoRoot "apps\api"

function Assert-LastExitCode {
  param([string]$Step)
  if ($null -ne $LASTEXITCODE -and $LASTEXITCODE -ne 0) {
    throw "$Step failed with exit code $LASTEXITCODE"
  }
}

Write-Host "== Deploy union site HYUTE - env: $Environment ==" -ForegroundColor Cyan

# 1) API: env next to dist/main.js (PM2 cwd), prisma from the monorepo (has the lockfile)
Write-Host "-- Deploy apps/api --"
if (Test-Path $ApiEnvFile) {
  Copy-Item $ApiEnvFile -Destination (Join-Path $ApiAppPath ".env") -Force
  Copy-Item $ApiEnvFile -Destination (Join-Path $RepoRoot ".env") -Force
} else {
  Write-Warning "Missing $ApiEnvFile - create the real .env on the server before the first deploy."
}

if (Test-Path $ApiSitePath) {
  Copy-Item "$RepoRoot\deploy\iis\web.config.api" -Destination (Join-Path $ApiSitePath "web.config") -Force
} else {
  Write-Warning "Missing $ApiSitePath - skip IIS /api web.config copy."
}

Push-Location $RepoRoot
pnpm prisma generate --schema=.\prisma\schema.prisma
Assert-LastExitCode "prisma generate"
pnpm prisma migrate deploy --schema=.\prisma\schema.prisma
Assert-LastExitCode "prisma migrate deploy"
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

# 3) Reload PM2 - do not parse `pm2 jlist` (Windows extra output breaks ConvertFrom-Json)
Write-Host "-- Reload PM2 (congdoan-api) --"
Push-Location $RepoRoot
pm2 reload deploy\ecosystem.config.js --update-env
if ($null -ne $LASTEXITCODE -and $LASTEXITCODE -ne 0) {
  Write-Host "PM2 reload did not find a process; starting congdoan-api"
  pm2 start deploy\ecosystem.config.js --env $Environment
  Assert-LastExitCode "pm2 start"
  pm2 save
}
pm2 status
Pop-Location

Write-Host "== Deploy done ==" -ForegroundColor Green
