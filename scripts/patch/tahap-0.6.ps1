# Patch Tahap 0.6: cara kerja, struktur folder baku, data contoh, keputusan, register koreksi.
# Jalankan: powershell -ExecutionPolicy Bypass -File E:\SIAP_MALUT\scripts\patch\tahap-0.6.ps1
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
Set-Location $root

# 1. Gate (termasuk audit-check dan pemeriksaan struktur)
& (Join-Path $root 'scripts\gate.ps1')

# 2. Add hanya berkas/folder tahap ini
$files = @(
    'CLAUDE.md',
    'STATUS.md',
    'docs',
    'apps',
    'packages',
    'data',
    'scripts'
)
git add -- $files
if ($LASTEXITCODE -ne 0) { throw 'git add gagal' }

git diff --cached --quiet
if ($LASTEXITCODE -eq 0) { Write-Host 'Tidak ada perubahan untuk di-commit.' -ForegroundColor Yellow; return }

# 3. Commit
$msg = @'
docs(standar): cara kerja, struktur folder baku, data contoh, keputusan, register koreksi, STATUS. Tahap 0.6

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>
'@
git commit -m $msg
if ($LASTEXITCODE -ne 0) { throw 'git commit gagal' }

# 4. Push
git push origin main
if ($LASTEXITCODE -ne 0) { throw 'git push gagal' }

Write-Host 'Tahap 0.6 selesai: commit dan push berhasil.' -ForegroundColor Green
git log --oneline -3
