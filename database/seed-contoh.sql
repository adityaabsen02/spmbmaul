-- =====================================================================
-- DATA CONTOH (DUMMY) supaya halaman admin bisa dicoba.
-- Jalankan SETELAH admin-schema.sql. Semua akun contoh TIDAK bisa login.
-- Untuk MENGHAPUS semua data contoh, jalankan dua baris ini saja:
--   DELETE FROM users WHERE email LIKE 'demo%@spmb.test';
--   DELETE FROM pengumuman WHERE judul LIKE '[CONTOH]%';
-- =====================================================================

INSERT IGNORE INTO users (nama, email, password, role) VALUES
  ('Ahmad Fauzi',    'demo1@spmb.test', '!akun-contoh-tidak-bisa-login', 'calon_siswa'),
  ('Siti Nurhaliza', 'demo2@spmb.test', '!akun-contoh-tidak-bisa-login', 'calon_siswa'),
  ('Budi Santoso',   'demo3@spmb.test', '!akun-contoh-tidak-bisa-login', 'calon_siswa'),
  ('Dewi Lestari',   'demo4@spmb.test', '!akun-contoh-tidak-bisa-login', 'calon_siswa'),
  ('Rizky Pratama',  'demo5@spmb.test', '!akun-contoh-tidak-bisa-login', 'calon_siswa'),
  ('Putri Ayu',      'demo6@spmb.test', '!akun-contoh-tidak-bisa-login', 'calon_siswa');

-- Pendaftar
INSERT IGNORE INTO pendaftar (user_id, no_daftar, nisn, asal_sekolah, jurusan_id)
SELECT id, 'SPMB-2026-0001', '0012345601', 'SMPN 1 Contoh', (SELECT id FROM jurusan WHERE kode = 'TKJ')
FROM users WHERE email = 'demo1@spmb.test';

INSERT IGNORE INTO pendaftar (user_id, no_daftar, nisn, asal_sekolah, jurusan_id)
SELECT id, 'SPMB-2026-0002', '0012345602', 'SMPN 2 Contoh', (SELECT id FROM jurusan WHERE kode = 'MM')
FROM users WHERE email = 'demo2@spmb.test';

INSERT IGNORE INTO pendaftar (user_id, no_daftar, nisn, asal_sekolah, jurusan_id)
SELECT id, 'SPMB-2026-0003', '0012345603', 'MTsN 1 Contoh', (SELECT id FROM jurusan WHERE kode = 'AK')
FROM users WHERE email = 'demo3@spmb.test';

INSERT IGNORE INTO pendaftar (user_id, no_daftar, nisn, asal_sekolah, jurusan_id)
SELECT id, 'SPMB-2026-0004', '0012345604', 'SMPN 3 Contoh', (SELECT id FROM jurusan WHERE kode = 'MP')
FROM users WHERE email = 'demo4@spmb.test';

INSERT IGNORE INTO pendaftar (user_id, no_daftar, nisn, asal_sekolah, jurusan_id)
SELECT id, 'SPMB-2026-0005', '0012345605', 'SMPS Contoh', (SELECT id FROM jurusan WHERE kode = 'TKJ')
FROM users WHERE email = 'demo5@spmb.test';

INSERT IGNORE INTO pendaftar (user_id, no_daftar, nisn, asal_sekolah, jurusan_id)
SELECT id, 'SPMB-2026-0006', '0012345606', 'SMPN 4 Contoh', (SELECT id FROM jurusan WHERE kode = 'MM')
FROM users WHERE email = 'demo6@spmb.test';

-- Dokumen: semua pendaftar contoh mengunggah 4 dokumen (berkas gambar contoh)
INSERT IGNORE INTO dokumen (pendaftar_id, jenis, file_path, status)
SELECT p.id, j.jenis, 'contoh/dokumen-contoh.png', 'menunggu'
FROM pendaftar p
JOIN (
  SELECT 'kartu_keluarga' AS jenis UNION ALL SELECT 'akta_lahir'
  UNION ALL SELECT 'ijazah' UNION ALL SELECT 'pas_foto' UNION ALL SELECT 'rapor'
) j
WHERE p.no_daftar LIKE 'SPMB-2026-000%';

UPDATE dokumen d JOIN pendaftar p ON p.id = d.pendaftar_id
SET d.status = 'terverifikasi'
WHERE p.no_daftar IN ('SPMB-2026-0001', 'SPMB-2026-0006');

UPDATE dokumen d JOIN pendaftar p ON p.id = d.pendaftar_id
SET d.status = 'terverifikasi'
WHERE p.no_daftar = 'SPMB-2026-0003' AND d.jenis IN ('kartu_keluarga', 'akta_lahir', 'rapor');

UPDATE dokumen d JOIN pendaftar p ON p.id = d.pendaftar_id
SET d.status = 'ditolak', d.catatan = 'Foto buram, mohon unggah ulang.'
WHERE p.no_daftar = 'SPMB-2026-0004' AND d.jenis = 'ijazah';

-- Pembayaran (nominal contoh Rp 150.000)
INSERT IGNORE INTO pembayaran (pendaftar_id, nominal, tanggal_bayar, bukti_path, status)
SELECT id, 150000, '2026-10-05', 'contoh/bukti-contoh.png', 'lunas' FROM pendaftar WHERE no_daftar = 'SPMB-2026-0001';

INSERT IGNORE INTO pembayaran (pendaftar_id, nominal, tanggal_bayar, bukti_path, status)
SELECT id, 150000, '2026-10-12', 'contoh/bukti-contoh.png', 'menunggu' FROM pendaftar WHERE no_daftar = 'SPMB-2026-0002';

INSERT IGNORE INTO pembayaran (pendaftar_id, nominal, tanggal_bayar, bukti_path, status)
SELECT id, 150000, '2026-10-08', 'contoh/bukti-contoh.png', 'lunas' FROM pendaftar WHERE no_daftar = 'SPMB-2026-0003';

INSERT IGNORE INTO pembayaran (pendaftar_id, nominal, tanggal_bayar, bukti_path, status)
SELECT id, 150000, '2026-10-09', 'contoh/bukti-contoh.png', 'ditolak' FROM pendaftar WHERE no_daftar = 'SPMB-2026-0004';

INSERT IGNORE INTO pembayaran (pendaftar_id, nominal, tanggal_bayar, bukti_path, status)
SELECT id, 150000, '2026-10-13', 'contoh/bukti-contoh.png', 'menunggu' FROM pendaftar WHERE no_daftar = 'SPMB-2026-0005';

INSERT IGNORE INTO pembayaran (pendaftar_id, nominal, tanggal_bayar, bukti_path, status)
SELECT id, 150000, '2026-10-06', 'contoh/bukti-contoh.png', 'lunas' FROM pendaftar WHERE no_daftar = 'SPMB-2026-0006';

-- Tes TPA
INSERT IGNORE INTO tes_tpa (pendaftar_id, jadwal, nilai)
SELECT id, '2026-10-20 08:00:00', 85.00 FROM pendaftar WHERE no_daftar = 'SPMB-2026-0001';

INSERT IGNORE INTO tes_tpa (pendaftar_id, jadwal, nilai)
SELECT id, '2026-10-20 08:00:00', NULL FROM pendaftar WHERE no_daftar = 'SPMB-2026-0002';

INSERT IGNORE INTO tes_tpa (pendaftar_id, jadwal, nilai)
SELECT id, '2026-10-20 10:00:00', 72.50 FROM pendaftar WHERE no_daftar = 'SPMB-2026-0003';

INSERT IGNORE INTO tes_tpa (pendaftar_id, jadwal, nilai)
SELECT id, '2026-10-21 08:00:00', NULL FROM pendaftar WHERE no_daftar = 'SPMB-2026-0005';

-- Pengumuman contoh
INSERT INTO pengumuman (judul, isi, status)
SELECT * FROM (
  SELECT '[CONTOH] Jadwal Tes TPA Gelombang 1' AS judul,
         'Tes TPA dilaksanakan pada 20-21 Oktober 2026 di SMK Citra Negara. Peserta dimohon hadir 30 menit sebelum tes dimulai.' AS isi,
         'terbit' AS status
  UNION ALL
  SELECT '[CONTOH] Pembayaran Biaya Pendaftaran',
         'Unggah bukti transfer melalui dashboard calon siswa paling lambat 3 hari setelah mendaftar.',
         'terbit'
  UNION ALL
  SELECT '[CONTOH] Pengumuman Hasil Seleksi',
         'Hasil seleksi akan diumumkan setelah seluruh rangkaian tes selesai.',
         'draf'
) t
WHERE NOT EXISTS (SELECT 1 FROM pengumuman WHERE judul LIKE '[CONTOH]%');
