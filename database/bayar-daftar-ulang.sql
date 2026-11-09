-- Pembayaran biaya daftar ulang memakai tabel pembayaran yang sama (kolom baru: jenis).
-- JALANKAN SEKALI SAJA. Urutan perintah penting, jangan diubah.
ALTER TABLE pembayaran
  ADD COLUMN jenis ENUM('pendaftaran','daftar_ulang') NOT NULL DEFAULT 'pendaftaran' AFTER pendaftar_id;
ALTER TABLE pembayaran ADD UNIQUE KEY uq_pembayaran_jenis (pendaftar_id, jenis);
ALTER TABLE pembayaran DROP INDEX pendaftar_id;

INSERT IGNORE INTO pengaturan (kunci, nilai) VALUES
  ('tanggal_pengumuman_hasil', '20 Oktober 2026'),
  ('periode_daftar_ulang', '22 - 28 Oktober 2026'),
  ('biaya_daftar_ulang', '650000'),
  ('batas_bayar_daftar_ulang', '26 Oktober 2026'),
  ('lokasi_daftar_ulang', 'Ruang TU, SMK Citra Negara'),
  ('jam_daftar_ulang', '08.00 - 14.00 WIB');
