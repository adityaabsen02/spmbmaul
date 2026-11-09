-- Jalankan SEKALI kalau kamu sudah pernah menjalankan siswa-schema.sql versi sebelumnya
-- (menyesuaikan program keahlian dan kuota dengan desain Figma).
UPDATE jurusan SET kode = 'PM', nama = 'Pemasaran', kuota = 36 WHERE kode = 'PH';
INSERT IGNORE INTO jurusan (kode, nama, kuota) VALUES ('PM', 'Pemasaran', 36);
UPDATE jurusan SET kuota = 72 WHERE kode IN ('AK', 'MP', 'TKJ');
UPDATE jurusan SET kuota = 36 WHERE kode IN ('MM', 'PM');

-- Perbaikan soal TPA (soal 1 sesuai desain, kunci soal 5 = 23)
UPDATE tpa_soal SET pertanyaan = 'Sinonim dari kata "hipotesis" adalah ...', opsi_a = 'Kesimpulan akhir', opsi_b = 'Dugaan sementara', opsi_c = 'Fakta lapangan', opsi_d = 'Teori yang terbukti', kunci = 'B' WHERE nomor = 1;
UPDATE tpa_soal SET kunci = 'B' WHERE nomor = 5;
-- Tanggal untuk halaman Status Seleksi
INSERT IGNORE INTO pengaturan (kunci, nilai) VALUES
  ('tanggal_pengumuman_hasil', '20 Oktober 2026'),
  ('periode_daftar_ulang', '22 - 28 Oktober 2026');
