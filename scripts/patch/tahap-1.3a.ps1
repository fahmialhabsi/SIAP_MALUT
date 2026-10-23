# Patch Tahap 1.3a: lapisan data (skema, migrasi, seed contoh, penjaga produksi, log audit, kamus data).
# Jalankan: powershell -ExecutionPolicy Bypass -File E:\SIAP_MALUT\scripts\patch\tahap-1.3a.ps1
# SEBELUM menjalankan: hentikan terminal "npm run dev" lama (Ctrl+C). Disarankan Node 22 (nvm use 22.22.0).
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
Set-Location $root

$nodeMajor = [int]((node -v).TrimStart('v').Split('.')[0])
if ($nodeMajor -lt 20) { throw "Node $(node -v) terlalu lama; butuh Node 20.19+ (disarankan 22)." }
if ($nodeMajor -lt 22) { Write-Host "[patch] Peringatan: Node $(node -v). Disarankan Node 22 (nvm use 22.22.0)." -ForegroundColor Yellow }

# 0. Pasang dependensi baru (drizzle, pglite, pg) bila belum
if (-not (Test-Path (Join-Path $root 'node_modules\@electric-sql\pglite'))) {
    Write-Host '[patch] Menjalankan npm ci ...'
    npm ci
    if ($LASTEXITCODE -ne 0) { throw 'npm ci gagal' }
}

# 1. Gate (audit-check, lint, test, build); keluaran disimpan sebagai bukti milik owner
#    Catatan: uji basis data memakai PGlite (memori); gate ±2-4 menit.
$buktiDir = Join-Path $root 'docs\audit\bukti-gate'
New-Item -ItemType Directory -Force $buktiDir | Out-Null
$bukti = Join-Path $buktiDir 'gate-tahap-1.3a-owner.txt'
$env:NO_COLOR = '1'; $env:FORCE_COLOR = '0'
@(
    'Bukti gate Tahap 1.3a (dijalankan owner lewat patch)',
    "Waktu: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss zzz')",
    "Node: $(node -v)  npm: $(npm -v)",
    '------------------------------------------'
) | Out-File $bukti -Encoding utf8
& (Join-Path $root 'scripts\gate.ps1') *>&1 | ForEach-Object { Write-Host $_; "$_" } | Out-File $bukti -Append -Encoding utf8
if (-not $?) { throw 'Gate gagal; lihat keluaran di atas.' }

# 2. SBOM dan ringkasan lisensi (dihasilkan dari berkas kunci)
node scripts/buat-sbom.mjs tahap-1.3a
if ($LASTEXITCODE -ne 0) { throw 'Pembuatan SBOM gagal' }

# 3. Add hanya berkas/folder tahap ini (node_modules, dist, .env, data/dev tidak ikut: lihat .gitignore)
$files = @(
    '.gitignore', '.dockerignore', '.env.example', '.prettierignore', 'docker-compose.yml',
    'CLAUDE.md', 'STATUS.md', 'package.json', 'package-lock.json',
    'apps', 'packages', 'scripts', 'src', 'docs', 'data'
)
git add -- $files
if ($LASTEXITCODE -ne 0) { throw 'git add gagal' }

# Pengaman: pastikan tidak ada rahasia atau basis data pengembangan yang ikut
$ikut = git diff --cached --name-only
if ($ikut -match '(^|/)\.env$' -or $ikut -match '^data/dev/' -or $ikut -match '^data/unggahan/') {
    throw 'Berkas rahasia/pengembangan ikut ter-stage; batalkan (git reset) dan periksa .gitignore.'
}

git diff --cached --quiet
if ($LASTEXITCODE -eq 0) { Write-Host 'Tidak ada perubahan untuk di-commit.' -ForegroundColor Yellow; return }

# 4. Commit
$msg = @'
feat(data): skema Drizzle, migrasi, seed data contoh, penjaga produksi, log audit append-only, kamus data. Tahap 1.3a

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>
'@
git commit -m $msg
if ($LASTEXITCODE -ne 0) { throw 'git commit gagal' }

# 5. Push
git push origin main
if ($LASTEXITCODE -ne 0) { throw 'git push gagal' }

Write-Host 'Tahap 1.3a selesai: commit dan push berhasil.' -ForegroundColor Green
git log --oneline -3

Write-Host ''
Write-Host 'Coba:  npm run dev   (start pertama mencetak kata sandi sementara admin.owner SEKALI; catat)' -ForegroundColor Cyan
