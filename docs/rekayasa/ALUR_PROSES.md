# Alur Proses dan Status Agenda (RK-06)

> **Dihasilkan otomatis** dari `packages/domain` oleh `scripts/buat-diagram-status.mjs` (`npm run docs:status`). **Jangan diedit tangan.** Aturan syarat tiap perpindahan: `docs/rekayasa/ATURAN_BISNIS.md`.

Alur utama (empat langkah, Rancangan 11.2): Baru → Menunggu Arahan → Ditetapkan → Terkonfirmasi.

```mermaid
stateDiagram-v2
  [*] --> baru
  baru --> menunggu_arahan
  baru --> dibatalkan
  menunggu_arahan --> ditetapkan
  menunggu_arahan --> ditunda
  menunggu_arahan --> dibatalkan
  ditetapkan --> terkonfirmasi
  ditetapkan --> menunggu_arahan
  ditetapkan --> ditunda
  ditetapkan --> dibatalkan
  terkonfirmasi --> berlangsung
  terkonfirmasi --> ditetapkan
  terkonfirmasi --> ditunda
  terkonfirmasi --> dibatalkan
  berlangsung --> selesai
  ditunda --> menunggu_arahan
  ditunda --> dibatalkan
  selesai --> [*]
  dibatalkan --> [*]
```

| Dari | Boleh ke |
|---|---|
| Baru (`baru`) | Menunggu Arahan, Dibatalkan |
| Menunggu Arahan (`menunggu_arahan`) | Ditetapkan, Ditunda, Dibatalkan |
| Ditetapkan (`ditetapkan`) | Terkonfirmasi, Menunggu Arahan, Ditunda, Dibatalkan |
| Terkonfirmasi (`terkonfirmasi`) | Berlangsung, Ditetapkan, Ditunda, Dibatalkan |
| Berlangsung (`berlangsung`) | Selesai |
| Selesai (`selesai`) | (status akhir) |
| Dibatalkan (`dibatalkan`) | (status akhir) |
| Ditunda (`ditunda`) | Menunggu Arahan, Dibatalkan |
