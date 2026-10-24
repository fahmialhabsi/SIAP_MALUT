# Patch Tahap 1.4c: akses peninjau jarak jauh (akun demo bersandi, terowongan sementara) dan perbaikan admin:sandi. Bila patch 1.4b belum dijalankan, patch ini ikut memuatnya.
# Jalankan: powershell -ExecutionPolicy Bypass -File E:\SIAP_MALUT\scripts\patch\tahap-1.4c.ps1
# SEBELUM menjalankan: hentikan terminal "npm run dev" lama (Ctrl+C). Disarankan Node 22 (nvm use 22.22.0).
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
Set-Location $root
. (Join-Path $root 'scripts\native.ps1')   # Invoke-Native: stderr tidak dianggap galat (kode keluar yang menentukan)

$nodeMajor = [int]((node -v).TrimStart('v').Split('.')[0])
if ($nodeMajor -lt 20) { throw "Node $(node -v) terlalu lama; butuh Node 20.19+ (disarankan 22)." }
if ($nodeMajor -lt 22) { Write-Host "[patch] Peringatan: Node $(node -v). Disarankan Node 22 (nvm use 22.22.0)." -ForegroundColor Yellow }

# 0. Pasang dependensi baru (react-router, openapi-typescript, Playwright, axe) bila belum
if (-not (Test-Path (Join-Path $root 'node_modules\react-router'))) {
    Write-Host '[patch] Menjalankan npm ci ...'
    Invoke-Native npm 'ci'
}

# 1. Gate (audit-check, lint, test, build); keluaran disimpan sebagai bukti milik owner
#    Catatan: uji API memakai PGlite (memori); gate +-3-6 menit pada komputer yang lambat.
$buktiDir = Join-Path $root 'docs\audit\bukti-gate'
New-Item -ItemType Directory -Force $buktiDir | Out-Null
$bukti = Join-Path $buktiDir 'gate-tahap-1.4c-owner.txt'
$env:NO_COLOR = '1'; $env:FORCE_COLOR = '0'
@(
    'Bukti gate Tahap 1.4c (dijalankan owner lewat patch)',
    "Waktu: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss zzz')",
    "Node: $(node -v)  npm: $(npm -v)  PowerShell: $($PSVersionTable.PSVersion)",
    '------------------------------------------'
) | Out-File $bukti -Encoding utf8
& (Join-Path $root 'scripts\gate.ps1') *>&1 | ForEach-Object { Write-Host $_; "$_" } | Out-File $bukti -Append -Encoding utf8
# Jangan percaya $? setelah pipeline; yang menentukan adalah penanda LOLOS dari gate.
if (-not (Select-String -Path $bukti -Pattern '\[gate\] LOLOS' -Quiet)) { throw 'Gate tidak melaporkan LOLOS; commit dibatalkan. Lihat keluaran di atas.' }

# 2. SBOM dan ringkasan lisensi (dihasilkan dari berkas kunci)
Invoke-Native node 'scripts/buat-sbom.mjs', 'tahap-1.4c'

# 3. Add hanya berkas/folder tahap ini (node_modules, dist, .env, data/dev, data/unggahan tidak ikut: lihat .gitignore)
$files = @(
    '.gitignore', '.dockerignore', '.env.example', '.prettierignore', 'docker-compose.yml',
    'CLAUDE.md', 'STATUS.md', 'package.json', 'package-lock.json',
    'apps', 'packages', 'scripts', 'src', 'docs', 'data'
)
Invoke-Native git (@('add', '--') + $files)

# Pengaman: pastikan tidak ada rahasia, basis data pengembangan, atau unggahan yang ikut
$ikut = git diff --cached --name-only
if ($ikut -match '(^|/)\.env$' -or $ikut -match '^data/dev/' -or $ikut -match '^data/unggahan/') {
    throw 'Berkas rahasia/pengembangan ikut ter-stage; batalkan (git reset) dan periksa .gitignore.'
}

Invoke-Native git 'diff', '--cached', '--quiet' -IzinkanGagal
if ($LASTEXITCODE -eq 0) { Write-Host 'Tidak ada perubahan untuk di-commit.' -ForegroundColor Yellow; return }

# 4. Commit
$msg = @'
feat(demo): akun demo bersandi (akun:sandi) dan terowongan sementara (dev:tunnel) bagi peninjau jarak jauh; perbaikan admin:sandi (KOR-005..007). Tahap 1.4c

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>
'@
Invoke-Native git 'commit', '-m', $msg

# 5. Push
Invoke-Native git 'push', 'origin', 'main'

Write-Host 'Tahap 1.4c selesai: commit dan push berhasil.' -ForegroundColor Green
Invoke-Native git 'log', '--oneline', '-3'

Write-Host ''
Write-Host 'Peninjau jarak jauh: npm run akun:sandi -- demo.kabag-protokol  lalu  npm run dev:tunnel  (lihat docs/operasi/PEMASANGAN.md bagian 6e)' -ForegroundColor Cyan
