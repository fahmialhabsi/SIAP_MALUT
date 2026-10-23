CREATE TABLE "kegiatan" (
	"id" text PRIMARY KEY NOT NULL,
	"judul" text NOT NULL,
	"jenis" text,
	"mulai" timestamp with time zone NOT NULL,
	"selesai" timestamp with time zone,
	"lokasi_nama" text,
	"lokasi_pulau" text,
	"status" text DEFAULT 'baru' NOT NULL,
	"penyelenggara" text,
	"pic_protokol_id" text,
	"pic_pengundang_nama" text,
	"pic_pengundang_kontak" text,
	"tautan_rapat" text,
	"catatan" text,
	"is_contoh" boolean DEFAULT false NOT NULL,
	"dibuat" timestamp with time zone DEFAULT now() NOT NULL,
	"diubah" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "kegiatan_status_sah" CHECK ("kegiatan"."status" in ('baru', 'menunggu_arahan', 'ditetapkan', 'terkonfirmasi', 'berlangsung', 'selesai', 'dibatalkan', 'ditunda')),
	CONSTRAINT "kegiatan_selesai_setelah_mulai" CHECK ("kegiatan"."selesai" is null or "kegiatan"."selesai" > "kegiatan"."mulai")
);
--> statement-breakpoint
CREATE TABLE "kegiatan_pihak" (
	"kegiatan_id" text NOT NULL,
	"pihak_id" text NOT NULL,
	"kedudukan" text NOT NULL,
	"peran" text,
	CONSTRAINT "kegiatan_pihak_kegiatan_id_pihak_id_pk" PRIMARY KEY("kegiatan_id","pihak_id"),
	CONSTRAINT "kegiatan_pihak_kedudukan_sah" CHECK ("kegiatan_pihak"."kedudukan" in ('diundang', 'ditugaskan', 'diterima', 'ditolak')),
	CONSTRAINT "kegiatan_pihak_peran_sah" CHECK ("kegiatan_pihak"."peran" is null or "kegiatan_pihak"."peran" in ('utama', 'mewakili', 'pendamping'))
);
--> statement-breakpoint
CREATE TABLE "lampiran" (
	"id" text PRIMARY KEY NOT NULL,
	"kegiatan_id" text NOT NULL,
	"nama_berkas" text NOT NULL,
	"tipe" text NOT NULL,
	"ukuran" integer NOT NULL,
	"hash_isi" text NOT NULL,
	"jalur" text NOT NULL,
	"diunggah_oleh" text,
	"dibuat" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "log_audit" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "log_audit_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"waktu" timestamp with time zone DEFAULT now() NOT NULL,
	"aktor" text NOT NULL,
	"aktor_peran" text,
	"aksi" text NOT NULL,
	"entitas" text,
	"entitas_id" text,
	"sebelum" jsonb,
	"sesudah" jsonb,
	"alasan" text,
	"req_id" text,
	"ip" text
);
--> statement-breakpoint
CREATE TABLE "pejabat" (
	"id" text PRIMARY KEY NOT NULL,
	"nama" text NOT NULL,
	"golongan" text NOT NULL,
	"jabatan" text,
	"instansi" text,
	"kontak" text,
	"urutan_tata_tempat" integer,
	"aktif" boolean DEFAULT true NOT NULL,
	"is_contoh" boolean DEFAULT false NOT NULL,
	"dibuat" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "pejabat_golongan_sah" CHECK ("pejabat"."golongan" in ('pimpinan', 'pejabat', 'petugas'))
);
--> statement-breakpoint
CREATE TABLE "pengaturan" (
	"kunci" text PRIMARY KEY NOT NULL,
	"nilai" jsonb NOT NULL,
	"diubah" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pengguna" (
	"id" text PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"nama" text NOT NULL,
	"peran" text NOT NULL,
	"pejabat_id" text,
	"hash_sandi" text,
	"aktif" boolean DEFAULT true NOT NULL,
	"gagal_masuk" integer DEFAULT 0 NOT NULL,
	"terkunci_sampai" timestamp with time zone,
	"is_contoh" boolean DEFAULT false NOT NULL,
	"dibuat" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "pengguna_username_unique" UNIQUE("username"),
	CONSTRAINT "pengguna_peran_sah" CHECK ("pengguna"."peran" in ('admin', 'kepala_biro', 'kabag_protokol', 'protokol', 'ajudan', 'pimpinan', 'pejabat', 'pemohon', 'publik'))
);
--> statement-breakpoint
CREATE TABLE "peran_izin" (
	"peran" text NOT NULL,
	"izin" text NOT NULL,
	"is_contoh" boolean DEFAULT false NOT NULL,
	CONSTRAINT "peran_izin_peran_izin_pk" PRIMARY KEY("peran","izin")
);
--> statement-breakpoint
CREATE TABLE "sesi" (
	"id_hash" text PRIMARY KEY NOT NULL,
	"pengguna_id" text NOT NULL,
	"dibuat" timestamp with time zone DEFAULT now() NOT NULL,
	"kedaluwarsa" timestamp with time zone NOT NULL,
	"ip" text,
	"agen" text
);
--> statement-breakpoint
ALTER TABLE "kegiatan" ADD CONSTRAINT "kegiatan_pic_protokol_id_pejabat_id_fk" FOREIGN KEY ("pic_protokol_id") REFERENCES "public"."pejabat"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kegiatan_pihak" ADD CONSTRAINT "kegiatan_pihak_kegiatan_id_kegiatan_id_fk" FOREIGN KEY ("kegiatan_id") REFERENCES "public"."kegiatan"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kegiatan_pihak" ADD CONSTRAINT "kegiatan_pihak_pihak_id_pejabat_id_fk" FOREIGN KEY ("pihak_id") REFERENCES "public"."pejabat"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lampiran" ADD CONSTRAINT "lampiran_kegiatan_id_kegiatan_id_fk" FOREIGN KEY ("kegiatan_id") REFERENCES "public"."kegiatan"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pengguna" ADD CONSTRAINT "pengguna_pejabat_id_pejabat_id_fk" FOREIGN KEY ("pejabat_id") REFERENCES "public"."pejabat"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sesi" ADD CONSTRAINT "sesi_pengguna_id_pengguna_id_fk" FOREIGN KEY ("pengguna_id") REFERENCES "public"."pengguna"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "kegiatan_mulai_idx" ON "kegiatan" USING btree ("mulai");--> statement-breakpoint
CREATE INDEX "log_audit_waktu_idx" ON "log_audit" USING btree ("waktu");--> statement-breakpoint
CREATE INDEX "log_audit_entitas_idx" ON "log_audit" USING btree ("entitas","entitas_id");