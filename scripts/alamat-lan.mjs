// Mencari alamat IPv4 komputer ini di jaringan lokal, untuk dibuka dari ponsel (npm run dev:lan).
import { networkInterfaces } from 'node:os';

const MAYBE_VIRTUAL =
  /vethernet|virtual|vmware|vbox|hyper-v|wsl|zerotier|docker|loopback|tailscale/i;

/** Daftar { antarmuka, alamat, kemungkinanFisik } untuk IPv4 pribadi, Wi-Fi/Ethernet fisik lebih dulu. */
export function alamatLan(antarmuka = networkInterfaces()) {
  const hasil = [];
  for (const [nama, daftar] of Object.entries(antarmuka)) {
    for (const a of daftar ?? []) {
      if (a.family !== 'IPv4' || a.internal) continue;
      if (!/^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(a.address)) continue;
      hasil.push({
        antarmuka: nama,
        alamat: a.address,
        kemungkinanFisik: !MAYBE_VIRTUAL.test(nama),
      });
    }
  }
  return hasil.sort((x, y) => Number(y.kemungkinanFisik) - Number(x.kemungkinanFisik));
}
