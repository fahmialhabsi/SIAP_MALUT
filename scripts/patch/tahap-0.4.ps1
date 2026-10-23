# Patch Tahap 0.4: verifikasi tabel rancangan terhadap PDF dan keputusan teknologi purwarupa.
# Jalankan: powershell -ExecutionPolicy Bypass -File E:\SIAP_MALUT\scripts\patch\tahap-0.4.ps1
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
Set-Location $root

# 1. Gate
& (Join-Path $root 'scripts\gate.ps1')

# 2. Add hanya berkas tahap ini
$files = @(
    'CLAUDE.md',
    'docs/rancangan/Rancangan_Awal_Sistem_Aplikasi_Biro_Adpim_Malut.md',
    'docs/standar/KEPUTUSAN_TEKNOLOGI_PURWARUPA.md',
    'docs/handoff/HANDOFF_TAHAP-0.4_Verifikasi-Tabel-dan-Teknologi.md',
    'scripts/patch/tahap-0.4.ps1'
)
git add -- $files
if ($LASTEXITCODE -ne 0) { throw 'git add gagal' }

git diff --cached --quiet
if ($LASTEXITCODE -eq 0) { Write-Host 'Tidak ada perubahan untuk di-commit.' -ForegroundColor Yellow; return }

# 3. Commit
$msg = @'
docs(rancangan): koreksi tabel terhadap PDF dan putuskan teknologi purwarupa. Tahap 0.4

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>
'@
git commit -m $msg
if ($LASTEXITCODE -ne 0) { throw 'git commit gagal' }

# 4. Push
git push origin main
if ($LASTEXITCODE -ne 0) { throw 'git push gagal' }

Write-Host 'Tahap 0.4 selesai: commit dan push berhasil.' -ForegroundColor Green
git log --oneline -3
