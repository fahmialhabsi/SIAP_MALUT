# Patch Tahap 1.4a: antarmuka ponsel (masuk, agenda, rincian, bentrok, dasbor per peran, persona demo), tipe API dari OpenAPI, uji ponsel.
# Jalankan: powershell -ExecutionPolicy Bypass -File E:\SIAP_MALUT\scripts\patch\tahap-1.4a.ps1
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
$bukti = Join-Path $buktiDir 'gate-tahap-1.4a-owner.txt'
$env:NO_COLOR = '1'; $env:FORCE_COLOR = '0'
@(
    'Bukti gate Tahap 1.4a (dijalankan owner lewat patch)',
    "Waktu: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss zzz')",
    "Node: $(node -v)  npm: $(npm -v)  PowerShell: $($PSVersionTable.PSVersion)",
    '------------------------------------------'
) | Out-File $bukti -Encoding utf8
& (Join-Path $root 'scripts\gate.ps1') *>&1 | ForEach-Object { Write-Host $_; "$_" } | Out-File $bukti -Append -Encoding utf8
# Jangan percaya $? setelah pipeline; yang menentukan adalah penanda LOLOS dari gate.
if (-not (Select-String -Path $bukti -Pattern '\[gate\] LOLOS' -Quiet)) { throw 'Gate tidak melaporkan LOLOS; commit dibatalkan. Lihat keluaran di atas.' }

# 2. SBOM dan ringkasan lisensi (dihasilkan dari berkas kunci)
Invoke-Native node 'scripts/buat-sbom.mjs', 'tahap-1.4a'

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
feat(web): antarmuka ponsel (masuk, agenda, rincian, bentrok, dasbor per peran, persona demo), tipe API dari OpenAPI, uji ponsel Playwright + axe. Tahap 1.4a

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>
'@
Invoke-Native git 'commit', '-m', $msg

# 5. Push
Invoke-Native git 'push', 'origin', 'main'

Write-Host 'Tahap 1.4a selesai: commit dan push berhasil.' -ForegroundColor Green
Invoke-Native git 'log', '--oneline', '-3'

Write-Host ''
Write-Host 'Coba:  npm run dev   (web http://localhost:5180; masuk sebagai admin.owner; sandi sementara tercetak di terminal pada start pertama). Ponsel: npm run dev:lan' -ForegroundColor Cyan
