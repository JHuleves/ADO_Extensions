
param(
  [string]$ManifestPath = "vss-extension.json",
  [string]$OutputDir = "dist",
  [switch]$RevPatch
)

if (-not (Get-Command tfx -ErrorAction SilentlyContinue)) {
  npm i -g tfx-cli
}

if (-not (Test-Path $OutputDir)) {
  New-Item -ItemType Directory -Path $OutputDir | Out-Null
}

$revParam = $null
if ($RevPatch) { $revParam = "--rev-version" }

# Empaquetar
& tfx extension create --manifest-globs $ManifestPath --output-path $OutputDir $revParam

if ($LASTEXITCODE -ne 0) { throw "Fallo empaquetando extensión." }

$vsix = Get-ChildItem $OutputDir -Filter *.vsix | Sort-Object LastWriteTime | Select-Object -Last 1
Write-Host "VSIX generado: $($vsix.FullName)"
