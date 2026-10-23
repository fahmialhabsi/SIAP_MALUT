# Pemeriksa kesiapan audit SIAP MALUT.
# Memastikan setiap dokumen berstatus "Ada" di docs/audit/DAFTAR_DOKUMEN_AUDIT.md benar-benar ada.
# Gagal (exit/throw) bila ada berkas hilang. Dipanggil oleh scripts/gate.ps1.
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$daftar = Join-Path $root 'docs\audit\DAFTAR_DOKUMEN_AUDIT.md'

if (-not (Test-Path $daftar)) { throw "[audit] GAGAL: $daftar tidak ditemukan" }

$ada = 0; $draf = 0; $belum = 0; $hilang = @()
foreach ($line in Get-Content $daftar -Encoding UTF8) {
    if ($line -notmatch '^\|\s*(TG|RK|MU|KM|OP|PG|AK|PL|PM)-\d+\s*\|') { continue }
    $cells = $line.Trim().Trim('|').Split('|') | ForEach-Object { $_.Trim() }
    if ($cells.Count -ne 7) { $hilang += "$($cells[0]) : jumlah kolom $($cells.Count), seharusnya 7"; continue }
    $id = $cells[0]
    $status = $cells[$cells.Count - 2]
    $berkas = $cells[$cells.Count - 1]
    switch ($status) {
        'Ada'   { $ada++ }
        'Draf'  { $draf++ }
        'Belum' { $belum++ }
        default { $hilang += "$id : status tidak dikenal '$status'" }
    }
    if ($status -eq 'Ada') {
        $m = [regex]::Match($berkas, '`([^`]+)`')
        if (-not $m.Success) { $hilang += "$id : kolom Berkas kosong"; continue }
        $path = Join-Path $root ($m.Groups[1].Value -replace '/', '\')
        if (-not (Test-Path $path)) { $hilang += "$id : berkas tidak ada: $($m.Groups[1].Value)" }
    }
}

if ($ada + $draf + $belum -eq 0) { throw '[audit] GAGAL: tidak ada baris dokumen terbaca' }
Write-Host "[audit] Dokumen: Ada=$ada, Draf=$draf, Belum=$belum" -ForegroundColor Cyan
if ($hilang.Count -gt 0) {
    $hilang | ForEach-Object { Write-Host "[audit] $_" -ForegroundColor Red }
    throw '[audit] GAGAL: ada dokumen berstatus Ada yang tidak sesuai'
}
Write-Host '[audit] LOLOS: semua dokumen berstatus Ada ditemukan.' -ForegroundColor Green
