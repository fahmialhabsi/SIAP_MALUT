# Pembantu menjalankan perintah eksternal (npm, node, git, docker) dengan aman di Windows PowerShell 5.1 dan 7.
# Masalah yang dipecahkan: bila skrip memakai $ErrorActionPreference = 'Stop' dan keluarannya dialihkan (*>&1),
# PowerShell 5.1 menganggap SETIAP baris stderr (mis. peringatan Vite "[PLUGIN_TIMINGS]", EBADENGINE, kemajuan git push)
# sebagai galat yang menghentikan skrip, walau perintahnya sukses. Di sini stderr hanya dicetak; yang menentukan gagal
# atau tidak adalah KODE KELUAR perintah.
#
# Pemakaian (dot-source lalu panggil):
#   . (Join-Path $PSScriptRoot 'native.ps1')
#   Invoke-Native npm 'run','build'
#   Invoke-Native git 'diff','--cached','--quiet' -IzinkanGagal   # lalu baca $LASTEXITCODE

function Invoke-Native {
    param(
        [Parameter(Mandatory)][string]$Perintah,
        [string[]]$Argumen = @(),
        [switch]$IzinkanGagal
    )
    $lama = $ErrorActionPreference
    $ErrorActionPreference = 'Continue'
    try {
        & $Perintah @Argumen 2>&1 | ForEach-Object { "$_" }
        $kode = $LASTEXITCODE
    } finally {
        $ErrorActionPreference = $lama
    }
    if ($kode -ne 0 -and -not $IzinkanGagal) {
        throw "Perintah gagal (kode keluar $kode): $Perintah $($Argumen -join ' ')"
    }
}
