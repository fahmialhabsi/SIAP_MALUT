# Kebutuhan Infrastruktur (OP-02)

**Versi:** Tahap 1.1 (kerangka). Nilai bersifat perkiraan awal dan diperbarui seiring basis data, berkas, dan pengguna bertambah.

| Komponen | Kebutuhan perkiraan (uji coba, < 50 pengguna) | Catatan |
|---|---|---|
| Server/VM | 2 vCPU, 2 GB RAM | API Node.js dan nginx ringan; ditambah PostgreSQL pada Tahap 1.3 (tambah ±1 GB RAM) |
| Penyimpanan | 20 GB awal | Foto/PDF undangan menambah; kompresi di sisi klien (maks. 1600 px); rencana kapasitas direvisi di Tahap 1.3 |
| Sistem operasi | Linux (kontainer) atau Windows dengan Docker | Gambar dasar: `node:22-alpine`, `nginx:1.27-alpine` |
| Runtime | Node.js 22 LTS (kontainer) | Node 20 sudah melewati akhir dukungan |
| Basis data | PostgreSQL 16 (layanan `db` di Compose, volume persisten); untuk produksi disarankan server terpisah, akun aplikasi tanpa hak DDL | Cadangan harian terjadwal (OP-03, Tahap 2) |
| Jaringan | Port 80/443 untuk web; API di belakang proksi; TLS wajib di produksi | Domain go.id dan sertifikat ditangani saat serah terima |
| Cadangan | Penyimpanan terpisah dari server | Rinci di OP-03 |
| Pemantauan | `/health`, `/ready`, log JSON | Runbook di OP-05 |
| Peramban pengguna | Peramban modern di ponsel/PC; PWA dapat dipasang | Ukuran halaman awal < 300 KB terkompresi (saat ini ±94 KB JS terkompresi) |
| Port bawaan | API 3000, web 8080 (Compose) | Dapat diubah lewat `.env` |
