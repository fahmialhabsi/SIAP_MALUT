# Pemeriksa kesiapan audit dan struktur SIAP MALUT.
# 1) Dokumen berstatus "Ada" di docs/audit/DAFTAR_DOKUMEN_AUDIT.md harus benar-benar ada.
# 2) Struktur folder baku (docs/standar/FOLDER_STRUKTUR.md) harus ada dan tidak ada folder tingkat atas asing.
# Gagal (throw) bila ada pelanggaran. Dipanggil oleh scripts/gate.ps1.
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$daftar = Join-Path $root 'docs\audit\DAFTAR_DOKUMEN_AUDIT.md'
$masalah = @()

# --- 1. Dokumen audit ---
if (-not (Test-Path $daftar)) { throw "[audit] GAGAL: $daftar tidak ditemukan" }

$ada = 0; $draf = 0; $belum = 0; $ph = 0
foreach ($line in Get-Content $daftar -Encoding UTF8) {
    if ($line -notmatch '^\|\s*(TG|RK|MU|KM|OP|PG|AK|PL|PM)-\d+\s*\|') { continue }
    $cells = $line.Trim().Trim('|').Split('|') | ForEach-Object { $_.Trim() }
    if ($cells.Count -ne 7) { $masalah += "$($cells[0]) : jumlah kolom $($cells.Count), seharusnya 7"; continue }
    $id = $cells[0]
    $status = $cells[5]
    $berkas = $cells[6]
    switch ($status) {
        'Ada'         { $ada++ }
        'Draf'        { $draf++ }
        'Belum'       { $belum++ }
        'Placeholder' { $ph++ }
        default       { $masalah += "$id : status tidak dikenal '$status'" }
    }
    if ($status -eq 'Ada') {
        $m = [regex]::Match($berkas, '`([^`]+)`')
        if (-not $m.Success) { $masalah += "$id : kolom Berkas kosong"; continue }
        $path = Join-Path $root ($m.Groups[1].Value -replace '/', '\')
        if (-not (Test-Path $path)) { $masalah += "$id : berkas tidak ada: $($m.Groups[1].Value)" }
    }
}
if ($ada + $draf + $belum + $ph -eq 0) { throw '[audit] GAGAL: tidak ada baris dokumen terbaca' }
Write-Host "[audit] Dokumen: Ada=$ada, Draf=$draf, Placeholder=$ph, Belum=$belum" -ForegroundColor Cyan

# --- 2. Struktur folder ---
$wajib = @(
    'docs\rancangan','docs\standar','docs\sop','docs\keputusan','docs\perubahan','docs\handoff','docs\audit',
    'docs\rekayasa','docs\mutu','docs\keamanan','docs\operasi','docs\pengguna',
    'apps\web','apps\api','packages\domain','packages\shared','data\contoh',
    'src\styles','scripts\patch'
)
foreach ($w in $wajib) {
    if (-not (Test-Path (Join-Path $root $w))) { $masalah += "struktur: folder baku hilang: $w" }
}
$diizinkan = @('docs','apps','packages','data','src','scripts','node_modules','dist','coverage','.git','.github','.vscode','.claude')
Get-ChildItem $root -Directory -Force | ForEach-Object {
    if ($diizinkan -notcontains $_.Name) { $masalah += "struktur: folder tingkat atas tidak dikenal: $($_.Name) (butuh KEPUTUSAN owner)" }
}
foreach ($f in @('CLAUDE.md','STATUS.md')) {
    if (-not (Test-Path (Join-Path $root $f))) { $masalah += "struktur: berkas wajib hilang: $f" }
}

if ($masalah.Count -gt 0) {
    $masalah | ForEach-Object { Write-Host "[audit] $_" -ForegroundColor Red }
    throw '[audit] GAGAL: ada pelanggaran dokumen atau struktur'
}
Write-Host '[audit] LOLOS: dokumen berstatus Ada ditemukan dan struktur folder sesuai.' -ForegroundColor Green
