# Gate SIAP MALUT: lint, test, build. Dipanggil oleh skrip patch tiap tahap.
# Selama belum ada package.json (Tahap 0), gate npm dilewati.
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

if (-not (Test-Path (Join-Path $root 'package.json'))) {
    Write-Host '[gate] package.json belum ada (Tahap 0): gate npm DILEWATI.' -ForegroundColor Yellow
    return
}

if (-not (Test-Path (Join-Path $root 'node_modules'))) {
    Write-Host '[gate] node_modules belum ada, menjalankan npm ci ...'
    npm ci
    if ($LASTEXITCODE -ne 0) { throw '[gate] GAGAL: npm ci' }
}

$pkg = Get-Content (Join-Path $root 'package.json') -Raw | ConvertFrom-Json
foreach ($step in @('lint', 'test', 'build')) {
    if ($pkg.scripts -and $pkg.scripts.PSObject.Properties.Name -contains $step) {
        Write-Host "[gate] npm run $step ..." -ForegroundColor Cyan
        npm run $step
        if ($LASTEXITCODE -ne 0) { throw "[gate] GAGAL: npm run $step" }
    } else {
        throw "[gate] GAGAL: script '$step' belum didefinisikan di package.json"
    }
}
Write-Host '[gate] LOLOS: lint, test, build.' -ForegroundColor Green
