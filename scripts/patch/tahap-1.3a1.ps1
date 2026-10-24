# Patch Tahap 1.3a.1 (perbaikan KOR-004): gate dan patch tahan stderr di Windows PowerShell 5.1.
# Jalankan: powershell -ExecutionPolicy Bypass -File E:\SIAP_MALUT\scripts\patch\tahap-1.3a1.ps1
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
Set-Location $root
. (Join-Path $root 'scripts\native.ps1')   # Invoke-Native: stderr tidak dianggap galat (kode keluar yang menentukan)

$nodeMajor = [int]((node -v).TrimStart('v').Split('.')[0])
if ($nodeMajor -lt 20) { throw "Node $(node -v) terlalu lama; butuh Node 20.19+ (disarankan 22)." }
if ($nodeMajor -lt 22) { Write-Host "[patch] Peringatan: Node $(node -v). Disarankan Node 22 (nvm use 22.22.0)." -ForegroundColor Yellow }

# 1. Gate (audit-check, lint, test, build); keluaran disimpan sebagai bukti milik owner
$buktiDir = Join-Path $root 'docs\audit\bukti-gate'
New-Item -ItemType Directory -Force $buktiDir | Out-Null
$bukti = Join-Path $buktiDir 'gate-tahap-1.3a1-owner.txt'
$env:NO_COLOR = '1'; $env:FORCE_COLOR = '0'
@(
    'Bukti gate Tahap 1.3a.1 (dijalankan owner lewat patch)',
    "Waktu: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss zzz')",
    "Node: $(node -v)  npm: $(npm -v)  PowerShell: $($PSVersionTable.PSVersion)",
    '------------------------------------------'
) | Out-File $bukti -Encoding utf8
& (Join-Path $root 'scripts\gate.ps1') *>&1 | ForEach-Object { Write-Host $_; "$_" } | Out-File $bukti -Append -Encoding utf8
# Jangan percaya $? setelah pipeline; yang menentukan adalah penanda LOLOS dari gate.
if (-not (Select-String -Path $bukti -Pattern '\[gate\] LOLOS' -Quiet)) { throw 'Gate tidak melaporkan LOLOS; commit dibatalkan. Lihat keluaran di atas.' }

# 2. Add hanya berkas tahap ini
$files = @('CLAUDE.md', 'STATUS.md', 'scripts', 'docs')
Invoke-Native git (@('add', '--') + $files)

$ikut = git diff --cached --name-only
if ($ikut -match '(^|/)\.env$' -or $ikut -match '^data/dev/' -or $ikut -match '^data/unggahan/') {
    throw 'Berkas rahasia/pengembangan ikut ter-stage; batalkan (git reset) dan periksa .gitignore.'
}

Invoke-Native git 'diff', '--cached', '--quiet' -IzinkanGagal
if ($LASTEXITCODE -eq 0) { Write-Host 'Tidak ada perubahan untuk di-commit.' -ForegroundColor Yellow; return }

# 3. Commit
$msg = @'
fix(patch): gate dan skrip patch tahan stderr di Windows PowerShell 5.1 (Invoke-Native), pemeriksaan LOLOS. Tahap 1.3a.1

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>
'@
Invoke-Native git 'commit', '-m', $msg

# 4. Push
Invoke-Native git 'push', 'origin', 'main'

Write-Host 'Tahap 1.3a.1 selesai: commit dan push berhasil.' -ForegroundColor Green
Invoke-Native git 'log', '--oneline', '-3'
