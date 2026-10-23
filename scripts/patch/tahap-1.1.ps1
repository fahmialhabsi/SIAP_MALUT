# Patch Tahap 1.1: kerangka repo, gate npm pertama, kontainer, dokumen audit ringkas.
# Jalankan: powershell -ExecutionPolicy Bypass -File E:\SIAP_MALUT\scripts\patch\tahap-1.1.ps1
# Disarankan Node 22:  nvm use 22.22.0   (Node 20.19+ juga berjalan, dengan peringatan dependensi)
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
Set-Location $root

$nodeMajor = [int]((node -v).TrimStart('v').Split('.')[0])
if ($nodeMajor -lt 20) { throw "Node $(node -v) terlalu lama; butuh Node 20.19+ (disarankan 22)." }
if ($nodeMajor -lt 22) { Write-Host "[patch] Peringatan: Node $(node -v). Disarankan Node 22 (nvm use 22.22.0)." -ForegroundColor Yellow }

# 1. Gate (audit-check, lint, test, build); keluaran disimpan sebagai bukti milik owner
$buktiDir = Join-Path $root 'docs\audit\bukti-gate'
New-Item -ItemType Directory -Force $buktiDir | Out-Null
$bukti = Join-Path $buktiDir 'gate-tahap-1.1-owner.txt'
$env:NO_COLOR = '1'; $env:FORCE_COLOR = '0'
@(
    'Bukti gate Tahap 1.1 (dijalankan owner lewat patch)',
    "Waktu: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss zzz')",
    "Node: $(node -v)  npm: $(npm -v)",
    '------------------------------------------'
) | Out-File $bukti -Encoding utf8
& (Join-Path $root 'scripts\gate.ps1') *>&1 | ForEach-Object { Write-Host $_; "$_" } | Out-File $bukti -Append -Encoding utf8
if (-not $?) { throw 'Gate gagal; lihat keluaran di atas.' }

# 2. SBOM dan ringkasan lisensi (dihasilkan dari berkas kunci)
node scripts/buat-sbom.mjs tahap-1.1
if ($LASTEXITCODE -ne 0) { throw 'Pembuatan SBOM gagal' }

# 3. Add hanya berkas/folder tahap ini (node_modules, dist, .env tidak ikut: lihat .gitignore)
$files = @(
    '.gitignore', '.dockerignore', '.editorconfig', '.env.example', '.prettierignore', '.prettierrc.json',
    'CLAUDE.md', 'STATUS.md', 'docker-compose.yml', 'eslint.config.js',
    'package.json', 'package-lock.json', 'tsconfig.base.json',
    'apps', 'packages', 'scripts', 'src', 'docs', 'data'
)
git add -- $files
if ($LASTEXITCODE -ne 0) { throw 'git add gagal' }

git diff --cached --quiet
if ($LASTEXITCODE -eq 0) { Write-Host 'Tidak ada perubahan untuk di-commit.' -ForegroundColor Yellow; return }

# 4. Commit
$msg = @'
feat(kerangka): monorepo TypeScript (web PWA, api Fastify, shared, domain), gate npm, kontainer, dokumen audit ringkas. Tahap 1.1

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>
'@
git commit -m $msg
if ($LASTEXITCODE -ne 0) { throw 'git commit gagal' }

# 5. Push
git push origin main
if ($LASTEXITCODE -ne 0) { throw 'git push gagal' }

Write-Host 'Tahap 1.1 selesai: commit dan push berhasil.' -ForegroundColor Green
git log --oneline -3

Write-Host ''
Write-Host 'Opsional (belum diverifikasi asisten): docker compose build' -ForegroundColor Cyan
