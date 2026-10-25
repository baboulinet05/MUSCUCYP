# Compile l'appli Android. Usage :
#   .\build-android.ps1            -> APK de test (app-debug.apk)
#   .\build-android.ps1 release    -> bundle signé pour le Play Store (app-release.aab)
param([string]$mode = 'debug')
$ErrorActionPreference = 'Stop'
# Capacitor 8 demande Java 21 (Temurin portable dans %LOCALAPPDATA%\Programs)
$jdk = Get-ChildItem (Join-Path $env:LOCALAPPDATA 'Programs') -Directory -Filter 'jdk-21*' -ErrorAction SilentlyContinue | Select-Object -First 1
if (-not $jdk) { Write-Host 'Java 21 introuvable : installe Temurin 21 (adoptium.net)' -ForegroundColor Red; exit 1 }
$env:JAVA_HOME = $jdk.FullName
Set-Location (Join-Path $PSScriptRoot 'android')
if ($mode -eq 'release') { .\gradlew.bat bundleRelease --console=plain } else { .\gradlew.bat assembleDebug --console=plain }
if ($LASTEXITCODE -ne 0) { Write-Host 'ECHEC de la compilation' -ForegroundColor Red; exit 1 }
if ($mode -eq 'release') { Write-Host 'OK : android\app\build\outputs\bundle\release\app-release.aab' -ForegroundColor Green }
else { Write-Host 'OK : android\app\build\outputs\apk\debug\app-debug.apk' -ForegroundColor Green }
