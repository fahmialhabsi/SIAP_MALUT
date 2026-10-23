# Patch Tahap 0.3: draf SOP layanan, aturan kewenangan mewakili, dan aturan kerja baru.
# Jalankan dari mana saja:  powershell -ExecutionPolicy Bypass -File E:\SIAP_MALUT\scripts\patch\tahap-0.3.ps1
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
Set-Location $root

# 1. Gate
& (Join-Path $root 'scripts\gate.ps1')

# 2. Add hanya berkas tahap ini
$files = @(
    'CLAUDE.md',
    'docs/sop/SOP_LAYANAN_DRAF.md',
    'docs/standar/ATURAN_KEWENANGAN_MEWAKILI_DRAF.md',
    'docs/rancangan/Rancangan_Awal_Sistem_Aplikasi_Biro_Adpim_Malut.md',
    'docs/handoff/HANDOFF_TAHAP-0.3_SOP-dan-Kewenangan.md',
    'scripts/gate.ps1',
    'scripts/patch/tahap-0.3.ps1'
)
git add -- $files
if ($LASTEXITCODE -ne 0) { throw 'git add gagal' }

git diff --cached --quiet
if ($LASTEXITCODE -eq 0) { Write-Host 'Tidak ada perubahan untuk di-commit.' -ForegroundColor Yellow; return }

# 3. Commit
$msg = @'
docs(sop): draf SOP layanan, aturan kewenangan mewakili, dan aturan kerja patch. Tahap 0.3

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>
'@
git commit -m $msg
if ($LASTEXITCODE -ne 0) { throw 'git commit gagal' }

# 4. Push
git push origin main
if ($LASTEXITCODE -ne 0) { throw 'git push gagal' }

Write-Host 'Tahap 0.3 selesai: commit dan push berhasil.' -ForegroundColor Green
git log --oneline -3
