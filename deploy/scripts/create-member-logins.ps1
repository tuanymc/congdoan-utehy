# Create logins for union members who do not have a User yet.
# Default password: hyute123. Safe to re-run (skips members who already have accounts).
#
# On the VPS:
#   powershell -File C:\inetpub\congdoan-src\deploy\scripts\create-member-logins.ps1

param(
  [string]$RepoRoot = "",
  [string]$ApiEnvFile = "C:\inetpub\congdoan2026\shared\.env"
)

$ErrorActionPreference = "Stop"
# Windows PowerShell 5.1 reads .ps1 as ANSI unless this file is ASCII-only.
if (-not $RepoRoot) {
  $RepoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path
}

if (-not (Test-Path -LiteralPath $RepoRoot)) {
  throw "Repo folder not found: $RepoRoot. Pass -RepoRoot to the real git path."
}

Set-Location -LiteralPath $RepoRoot

if (-not (Test-Path -LiteralPath "$RepoRoot\prisma\create-missing-union-member-logins.ts")) {
  throw "Missing prisma/create-missing-union-member-logins.ts. git pull then retry."
}

if (-not (Test-Path -LiteralPath "$RepoRoot\.env")) {
  if (Test-Path -LiteralPath $ApiEnvFile) {
    Copy-Item -LiteralPath $ApiEnvFile -Destination "$RepoRoot\.env" -Force
    Write-Host "Copied $ApiEnvFile -> $RepoRoot\.env"
  } else {
    throw "Missing .env. Create $ApiEnvFile with DATABASE_URL then retry."
  }
}

Write-Host "== Create missing union-member logins (password hyute123, no email) ==" -ForegroundColor Cyan
pnpm create:member-logins
