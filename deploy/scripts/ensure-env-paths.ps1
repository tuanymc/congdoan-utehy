# deploy/scripts/ensure-env-paths.ps1
# ASCII-only (Windows PowerShell 5.1). Adds production upload/attachment dirs to a .env
# file when missing or still set to a relative path from .env.example (./document-files).
#
#   powershell -File deploy/scripts/ensure-env-paths.ps1 -EnvFile C:\inetpub\congdoan2026\shared\.env

param(
  [Parameter(Mandatory = $true)]
  [string]$EnvFile
)

$ErrorActionPreference = "Stop"

$Defaults = @{
  "DOCUMENT_FILES_DIR"      = "C:\inetpub\congdoan2026\document-files"
  "UPLOAD_IMAGES_DIR"       = "C:\inetpub\congdoan2026\web\upload\images"
  "PUBLIC_WEB_DIR"          = "C:\inetpub\congdoan2026\web"
  "UPLOAD_LEGAL_FILES_DIR"  = "C:\inetpub\congdoan2026\web\upload\legal-education"
}

function Get-EnvValue {
  param([string]$Line)
  $value = $Line -replace "^[ \t]*[A-Za-z0-9_]+=", ""
  return $value.Trim().Trim('"').Trim("'")
}

function Test-AbsoluteWindowsPath {
  param([string]$Value)
  return $Value -match '^[A-Za-z]:[\\/]'
}

if (-not (Test-Path -LiteralPath $EnvFile)) {
  Write-Warning "Missing $EnvFile - skip env path ensure."
  return
}

$lines = @(Get-Content -LiteralPath $EnvFile)
$changed = $false
$seen = @{}
$out = New-Object System.Collections.Generic.List[string]

foreach ($line in $lines) {
  $matchedName = $null
  foreach ($name in @($Defaults.Keys)) {
    if ($line -match ("^[ \t]*" + [regex]::Escape($name) + "=")) {
      $matchedName = $name
      break
    }
  }

  if ($null -eq $matchedName) {
    [void]$out.Add($line)
    continue
  }

  $seen[$matchedName] = $true
  $current = Get-EnvValue $line
  if (-not (Test-AbsoluteWindowsPath $current)) {
    [void]$out.Add("$matchedName=$($Defaults[$matchedName])")
    $changed = $true
    Write-Host "Set $matchedName to production path in $EnvFile"
  } else {
    [void]$out.Add($line)
  }
}

foreach ($name in @($Defaults.Keys)) {
  if (-not $seen[$name]) {
    [void]$out.Add("$name=$($Defaults[$name])")
    $changed = $true
    Write-Host "Added $name to $EnvFile"
  }
}

if ($changed) {
  $utf8 = New-Object System.Text.UTF8Encoding $false
  [System.IO.File]::WriteAllLines((Resolve-Path -LiteralPath $EnvFile), $out.ToArray(), $utf8)
}
