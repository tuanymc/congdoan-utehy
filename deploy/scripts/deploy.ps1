# deploy/scripts/deploy.ps1
# Run on Windows Server AFTER pnpm build in the git checkout (congdoan-src).
#
# Windows PowerShell 5.1 reads .ps1 as ANSI unless this file is ASCII-only.
#
# PM2 runs apps/api from the git checkout (see deploy/ecosystem.config.js).
# IIS /api is only a reverse-proxy folder: copy web.config, never dist or node_modules.
#
# prisma generate is SKIPPED by default: Windows locks query_engine-windows.dll.node
# while PM2 is running (EPERM rename). Pass -GeneratePrisma after a schema change;
# the script then stops PM2, generates, and starts again.
#
# Manual: powershell -File deploy/scripts/deploy.ps1 -Environment production

param(
  [ValidateSet("staging", "production")]
  [string]$Environment = "staging",

  [string]$ApiSitePath = "C:\inetpub\congdoan\api",
  [string]$WebSitePath = "C:\inetpub\congdoan\web",
  [string]$AdminSitePath = "C:\inetpub\congdoan\admin",

  # Real .env is NOT in the repo. Keep it on the server; this script only copies it.
  [string]$ApiEnvFile = "C:\inetpub\congdoan\shared\.env",

  [switch]$GeneratePrisma
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

# 1) API env next to dist/main.js (PM2 cwd)
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

# 2) Web and Admin first so IIS gets the new bundle even if Prisma/PM2 fails later
Write-Host "-- Deploy apps/web --"
New-Item -ItemType Directory -Force -Path $WebSitePath | Out-Null
Copy-Item "$RepoRoot\apps\web\dist\*" -Destination $WebSitePath -Recurse -Force
Copy-Item "$RepoRoot\deploy\iis\web.config.web" -Destination "$WebSitePath\web.config" -Force

Write-Host "-- Deploy apps/admin --"
New-Item -ItemType Directory -Force -Path $AdminSitePath | Out-Null
Copy-Item "$RepoRoot\apps\admin\dist\*" -Destination $AdminSitePath -Recurse -Force
Copy-Item "$RepoRoot\deploy\iis\web.config.admin" -Destination "$AdminSitePath\web.config" -Force

# 3) Migrations do not replace the Windows query-engine DLL. Generate does, so only
#    run generate when asked, and stop PM2 first so the file is not locked.
Push-Location $RepoRoot
if ($GeneratePrisma) {
  Write-Host "-- Stop PM2 then prisma generate (Windows file lock) --"
  pm2 stop congdoan-api
  pnpm prisma generate --schema=.\prisma\schema.prisma
  Assert-LastExitCode "prisma generate"
}

Write-Host "-- prisma migrate deploy --"
pnpm prisma migrate deploy --schema=.\prisma\schema.prisma
Assert-LastExitCode "prisma migrate deploy"
Pop-Location

# 4) Reload PM2 - do not parse `pm2 jlist` (Windows extra output breaks ConvertFrom-Json)
Write-Host "-- Reload PM2 (congdoan-api) --"
Push-Location $RepoRoot
if ($GeneratePrisma) {
  pm2 start congdoan-api --update-env
  if ($null -ne $LASTEXITCODE -and $LASTEXITCODE -ne 0) {
    pm2 start deploy\ecosystem.config.js --env $Environment
    Assert-LastExitCode "pm2 start"
    pm2 save
  }
} else {
  pm2 reload deploy\ecosystem.config.js --update-env
  if ($null -ne $LASTEXITCODE -and $LASTEXITCODE -ne 0) {
    Write-Host "PM2 reload did not find a process; starting congdoan-api"
    pm2 start deploy\ecosystem.config.js --env $Environment
    Assert-LastExitCode "pm2 start"
    pm2 save
  }
}
pm2 status
Pop-Location

Write-Host "== Deploy done ==" -ForegroundColor Green
