/**
 * Skema basis data (Drizzle, PostgreSQL). Sumber tunggal: migrasi di apps/api/drizzle/ dibuat dari berkas ini
 * (npm run db:generate -w apps/api) dan kamus data dihasilkan darinya (npm run docs:data).
 * Berkas ini sengaja tidak mengimpor berkas lain agar dapat dibaca drizzle-kit.
 *
 * Aturan: setiap kolom wajib memiliki entri di SENSITIVITAS (diuji). Tabel yang memuat orang/agenda
 * memiliki `is_contoh` (STANDAR_DATA_CONTOH.md); `log_audit` tidak (append-only, dipisahkan per basis data).
 */
import { sql } from 'drizzle-orm';
import {
  bigint,
  boolean,
  check,
  index,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';

const waktu = (nama: string) => timestamp(nama, { withTimezone: true, mode: 'date' });

export const GOLONGAN = ['pimpinan', 'pejabat', 'petugas'] as const;
export const KEDUDUKAN = ['diundang', 'ditugaskan', 'diterima', 'ditolak'] as const;
export const PERAN_PIHAK = ['utama', 'mewakili', 'pendamping'] as const;
export const STATUS = [
  'baru',
  'menunggu_arahan',
  'ditetapkan',
  'terkonfirmasi',
  'berlangsung',
  'selesai',
  'dibatalkan',
  'ditunda',
] as const;
/** Peran pengguna aplikasi (matriks hak akses di tabel peran_izin; Placeholder sampai Tahap P). */
export const PERAN_PENGGUNA = [
  'admin',
  'kepala_biro',
  'kabag_protokol',
  'protokol',
  'ajudan',
  'pimpinan',
  'pejabat',
  'pemohon',
  'publik',
] as const;

const daftar = (nilai: readonly string[]) => sql.raw(nilai.map((n) => `'${n}'`).join(', '));

/** Direktori pihak (pimpinan, pejabat, petugas). */
export const pejabat = pgTable(
  'pejabat',
  {
    id: text('id').primaryKey(),
    nama: text('nama').notNull(),
    golongan: text('golongan').notNull(),
    jabatan: text('jabatan'),
    instansi: text('instansi'),
    kontak: text('kontak'),
    urutanTataTempat: integer('urutan_tata_tempat'),
    aktif: boolean('aktif').notNull().default(true),
    isContoh: boolean('is_contoh').notNull().default(false),
    dibuat: waktu('dibuat').notNull().defaultNow(),
  },
  (t) => [check('pejabat_golongan_sah', sql`${t.golongan} in (${daftar(GOLONGAN)})`)],
);

export const pengguna = pgTable(
  'pengguna',
  {
    id: text('id').primaryKey(),
    username: text('username').notNull().unique(),
    nama: text('nama').notNull(),
    peran: text('peran').notNull(),
    pejabatId: text('pejabat_id').references(() => pejabat.id),
    hashSandi: text('hash_sandi'),
    aktif: boolean('aktif').notNull().default(true),
    gagalMasuk: integer('gagal_masuk').notNull().default(0),
    terkunciSampai: waktu('terkunci_sampai'),
    isContoh: boolean('is_contoh').notNull().default(false),
    dibuat: waktu('dibuat').notNull().defaultNow(),
  },
  (t) => [check('pengguna_peran_sah', sql`${t.peran} in (${daftar(PERAN_PENGGUNA)})`)],
);

/** Matriks hak akses sebagai data (diisi di Tahap 1.3b). */
export const peranIzin = pgTable(
  'peran_izin',
  {
    peran: text('peran').notNull(),
    izin: text('izin').notNull(),
    isContoh: boolean('is_contoh').notNull().default(false),
  },
  (t) => [primaryKey({ columns: [t.peran, t.izin] })],
);

/** Sesi masuk: hanya hash token yang disimpan. */
export const sesi = pgTable('sesi', {
  idHash: text('id_hash').primaryKey(),
  penggunaId: text('pengguna_id')
    .notNull()
    .references(() => pengguna.id),
  dibuat: waktu('dibuat').notNull().defaultNow(),
  kedaluwarsa: waktu('kedaluwarsa').notNull(),
  ip: text('ip'),
  agen: text('agen'),
});

export const kegiatan = pgTable(
  'kegiatan',
  {
    id: text('id').primaryKey(),
    judul: text('judul').notNull(),
    jenis: text('jenis'),
    mulai: waktu('mulai').notNull(),
    selesai: waktu('selesai'),
    lokasiNama: text('lokasi_nama'),
    lokasiPulau: text('lokasi_pulau'),
    status: text('status').notNull().default('baru'),
    penyelenggara: text('penyelenggara'),
    picProtokolId: text('pic_protokol_id').references(() => pejabat.id),
    picPengundangNama: text('pic_pengundang_nama'),
    picPengundangKontak: text('pic_pengundang_kontak'),
    tautanRapat: text('tautan_rapat'),
    catatan: text('catatan'),
    isContoh: boolean('is_contoh').notNull().default(false),
    dibuat: waktu('dibuat').notNull().defaultNow(),
    diubah: waktu('diubah').notNull().defaultNow(),
  },
  (t) => [
    check('kegiatan_status_sah', sql`${t.status} in (${daftar(STATUS)})`),
    check('kegiatan_selesai_setelah_mulai', sql`${t.selesai} is null or ${t.selesai} > ${t.mulai}`),
    index('kegiatan_mulai_idx').on(t.mulai),
  ],
);

export const kegiatanPihak = pgTable(
  'kegiatan_pihak',
  {
    kegiatanId: text('kegiatan_id')
      .notNull()
      .references(() => kegiatan.id),
    pihakId: text('pihak_id')
      .notNull()
      .references(() => pejabat.id),
    kedudukan: text('kedudukan').notNull(),
    peran: text('peran'),
  },
  (t) => [
    primaryKey({ columns: [t.kegiatanId, t.pihakId] }),
    check('kegiatan_pihak_kedudukan_sah', sql`${t.kedudukan} in (${daftar(KEDUDUKAN)})`),
    check(
      'kegiatan_pihak_peran_sah',
      sql`${t.peran} is null or ${t.peran} in (${daftar(PERAN_PIHAK)})`,
    ),
  ],
);

/** Lampiran undangan (diisi di Tahap 1.3b). */
export const lampiran = pgTable('lampiran', {
  id: text('id').primaryKey(),
  kegiatanId: text('kegiatan_id')
    .notNull()
    .references(() => kegiatan.id),
  namaBerkas: text('nama_berkas').notNull(),
  tipe: text('tipe').notNull(),
  ukuran: integer('ukuran').notNull(),
  hashIsi: text('hash_isi').notNull(),
  jalur: text('jalur').notNull(),
  diunggahOleh: text('diunggah_oleh'),
  dibuat: waktu('dibuat').notNull().defaultNow(),
});

/** Pengaturan yang dikelola admin (KB-036): mis. durasiBawaanMenit. */
export const pengaturan = pgTable('pengaturan', {
  kunci: text('kunci').primaryKey(),
  nilai: jsonb('nilai').notNull(),
  diubah: waktu('diubah').notNull().defaultNow(),
});

/** Log audit append-only: pemicu di migrasi menolak UPDATE, DELETE, dan TRUNCATE (KB-044). */
export const logAudit = pgTable(
  'log_audit',
  {
    id: bigint('id', { mode: 'number' }).primaryKey().generatedAlwaysAsIdentity(),
    waktu: waktu('waktu').notNull().defaultNow(),
    aktor: text('aktor').notNull(),
    aktorPeran: text('aktor_peran'),
    aksi: text('aksi').notNull(),
    entitas: text('entitas'),
    entitasId: text('entitas_id'),
    sebelum: jsonb('sebelum'),
    sesudah: jsonb('sesudah'),
    alasan: text('alasan'),
    reqId: text('req_id'),
    ip: text('ip'),
  },
  (t) => [
    index('log_audit_waktu_idx').on(t.waktu),
    index('log_audit_entitas_idx').on(t.entitas, t.entitasId),
  ],
);

export type Sensitivitas = 'biasa' | 'pribadi' | 'rahasia' | 'audit';

/**
 * Sensitivitas tiap kolom (kamus data dan inventaris data pribadi dihasilkan dari sini).
 * biasa = tidak mengandung data pribadi; pribadi = data pribadi (UU 27/2022); rahasia = kredensial/akses;
 * audit = jejak audit. Kunci: `tabel.kolom`.
 */
export const SENSITIVITAS: Readonly<Record<string, Sensitivitas>> = {
  'pejabat.id': 'biasa',
  'pejabat.nama': 'pribadi',
  'pejabat.golongan': 'biasa',
  'pejabat.jabatan': 'biasa',
  'pejabat.instansi': 'biasa',
  'pejabat.kontak': 'pribadi',
  'pejabat.urutan_tata_tempat': 'biasa',
  'pejabat.aktif': 'biasa',
  'pejabat.is_contoh': 'biasa',
  'pejabat.dibuat': 'biasa',
  'pengguna.id': 'biasa',
  'pengguna.username': 'pribadi',
  'pengguna.nama': 'pribadi',
  'pengguna.peran': 'biasa',
  'pengguna.pejabat_id': 'biasa',
  'pengguna.hash_sandi': 'rahasia',
  'pengguna.aktif': 'biasa',
  'pengguna.gagal_masuk': 'biasa',
  'pengguna.terkunci_sampai': 'biasa',
  'pengguna.is_contoh': 'biasa',
  'pengguna.dibuat': 'biasa',
  'peran_izin.peran': 'biasa',
  'peran_izin.izin': 'biasa',
  'peran_izin.is_contoh': 'biasa',
  'sesi.id_hash': 'rahasia',
  'sesi.pengguna_id': 'biasa',
  'sesi.dibuat': 'biasa',
  'sesi.kedaluwarsa': 'biasa',
  'sesi.ip': 'pribadi',
  'sesi.agen': 'pribadi',
  'kegiatan.id': 'biasa',
  'kegiatan.judul': 'biasa',
  'kegiatan.jenis': 'biasa',
  'kegiatan.mulai': 'biasa',
  'kegiatan.selesai': 'biasa',
  'kegiatan.lokasi_nama': 'biasa',
  'kegiatan.lokasi_pulau': 'biasa',
  'kegiatan.status': 'biasa',
  'kegiatan.penyelenggara': 'biasa',
  'kegiatan.pic_protokol_id': 'biasa',
  'kegiatan.pic_pengundang_nama': 'pribadi',
  'kegiatan.pic_pengundang_kontak': 'pribadi',
  'kegiatan.tautan_rapat': 'rahasia',
  'kegiatan.catatan': 'biasa',
  'kegiatan.is_contoh': 'biasa',
  'kegiatan.dibuat': 'biasa',
  'kegiatan.diubah': 'biasa',
  'kegiatan_pihak.kegiatan_id': 'biasa',
  'kegiatan_pihak.pihak_id': 'biasa',
  'kegiatan_pihak.kedudukan': 'biasa',
  'kegiatan_pihak.peran': 'biasa',
  'lampiran.id': 'biasa',
  'lampiran.kegiatan_id': 'biasa',
  'lampiran.nama_berkas': 'biasa',
  'lampiran.tipe': 'biasa',
  'lampiran.ukuran': 'biasa',
  'lampiran.hash_isi': 'biasa',
  'lampiran.jalur': 'biasa',
  'lampiran.diunggah_oleh': 'pribadi',
  'lampiran.dibuat': 'biasa',
  'pengaturan.kunci': 'biasa',
  'pengaturan.nilai': 'biasa',
  'pengaturan.diubah': 'biasa',
  'log_audit.id': 'audit',
  'log_audit.waktu': 'audit',
  'log_audit.aktor': 'audit',
  'log_audit.aktor_peran': 'audit',
  'log_audit.aksi': 'audit',
  'log_audit.entitas': 'audit',
  'log_audit.entitas_id': 'audit',
  'log_audit.sebelum': 'audit',
  'log_audit.sesudah': 'audit',
  'log_audit.alasan': 'audit',
  'log_audit.req_id': 'audit',
  'log_audit.ip': 'audit',
};

export const SEMUA_TABEL = {
  pejabat,
  pengguna,
  peranIzin,
  sesi,
  kegiatan,
  kegiatanPihak,
  lampiran,
  pengaturan,
  logAudit,
} as const;

/** Tabel yang diperiksa penjaga produksi (memuat kolom is_contoh). */
export const TABEL_BERPENANDA_CONTOH = [pejabat, pengguna, peranIzin, kegiatan] as const;

/** Keterangan tabel untuk kamus data (wajib untuk setiap tabel; diuji). */
export const KETERANGAN_TABEL: Readonly<Record<string, string>> = {
  pejabat: 'Direktori pihak: pimpinan, pejabat, dan petugas yang dapat diundang atau ditugaskan.',
  pengguna: 'Akun pengguna aplikasi beserta peran; kata sandi hanya berupa hash (scrypt).',
  peran_izin:
    'Matriks hak akses sebagai data: izin yang dimiliki tiap peran (diisi di Tahap 1.3b).',
  sesi: 'Sesi masuk; hanya hash token yang disimpan (diisi di Tahap 1.3b).',
  kegiatan:
    'Kegiatan/undangan pada agenda pimpinan beserta status, waktu, lokasi, PIC, dan tautan rapat.',
  kegiatan_pihak:
    'Kedudukan setiap pihak pada kegiatan: diundang, ditugaskan, diterima, atau ditolak.',
  lampiran:
    'Berkas lampiran undangan (metadata; isi berkas di penyimpanan berkas) (diisi di Tahap 1.3b).',
  pengaturan: 'Pengaturan yang dikelola admin, mis. durasi bawaan kegiatan tanpa jam selesai.',
  log_audit: 'Jejak audit append-only: siapa melakukan apa, kapan, nilai sebelum dan sesudah.',
};
