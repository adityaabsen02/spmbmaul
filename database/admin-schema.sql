-- =====================================================================
-- SPMB SMK Citra Negara — tabel untuk fitur ADMIN
-- Jalankan di phpMyAdmin: pilih database `spmb` > tab SQL > tempel > Go.
-- Aman dijalankan berulang (pakai IF NOT EXISTS / INSERT IGNORE).
-- Tabel `users` sudah ada dari tugas sebelumnya.
-- =====================================================================

CREATE TABLE IF NOT EXISTS jurusan (
  id INT AUTO_INCREMENT PRIMARY KEY,
  kode VARCHAR(10) NOT NULL UNIQUE,
  nama VARCHAR(100) NOT NULL,
  kuota INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS pendaftar (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  no_daftar VARCHAR(30) NOT NULL UNIQUE,
  nisn VARCHAR(20) NULL,
  asal_sekolah VARCHAR(150) NULL,
  jurusan_id INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (jurusan_id) REFERENCES jurusan(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS dokumen (
  id INT AUTO_INCREMENT PRIMARY KEY,
  pendaftar_id INT NOT NULL,
  jenis ENUM('kartu_keluarga','akta_lahir','ijazah','pas_foto','rapor','sertifikat') NOT NULL,
  file_path VARCHAR(255) NULL,
  status ENUM('menunggu','terverifikasi','ditolak') NOT NULL DEFAULT 'menunggu',
  catatan VARCHAR(255) NULL,
  diverifikasi_oleh INT NULL,
  diverifikasi_at DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_dokumen (pendaftar_id, jenis),
  FOREIGN KEY (pendaftar_id) REFERENCES pendaftar(id) ON DELETE CASCADE,
  FOREIGN KEY (diverifikasi_oleh) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS pembayaran (
  id INT AUTO_INCREMENT PRIMARY KEY,
  pendaftar_id INT NOT NULL UNIQUE,
  nominal INT NOT NULL DEFAULT 0,
  tanggal_bayar DATE NULL,
  bukti_path VARCHAR(255) NULL,
  status ENUM('menunggu','lunas','ditolak') NOT NULL DEFAULT 'menunggu',
  catatan VARCHAR(255) NULL,
  diproses_oleh INT NULL,
  diproses_at DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (pendaftar_id) REFERENCES pendaftar(id) ON DELETE CASCADE,
  FOREIGN KEY (diproses_oleh) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS tes_tpa (
  id INT AUTO_INCREMENT PRIMARY KEY,
  pendaftar_id INT NOT NULL UNIQUE,
  jadwal DATETIME NULL,
  nilai DECIMAL(5,2) NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (pendaftar_id) REFERENCES pendaftar(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS pengumuman (
  id INT AUTO_INCREMENT PRIMARY KEY,
  judul VARCHAR(150) NOT NULL,
  isi TEXT NOT NULL,
  status ENUM('draf','terbit') NOT NULL DEFAULT 'draf',
  dibuat_oleh INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (dibuat_oleh) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS pengaturan (
  kunci VARCHAR(50) PRIMARY KEY,
  nilai TEXT NULL
);

-- Nilai awal pengaturan (bisa diubah dari menu Pengaturan)
INSERT IGNORE INTO pengaturan (kunci, nilai) VALUES
  ('tahun_ajaran', '2026/2027'),
  ('periode_buka', ''),
  ('periode_tutup', ''),
  ('biaya_pendaftaran', '150000'),
  ('rekening_pembayaran', '8877 0812 3456 7890'),
  ('kontak_wa', ''),
  ('kontak_email', '');

-- Program keahlian AWAL (sesuai desain Figma) — GANTI sesuai jurusan SMK Citra Negara
-- yang sebenarnya (ubah langsung di tabel `jurusan` lewat phpMyAdmin).
INSERT IGNORE INTO jurusan (kode, nama, kuota) VALUES
  ('AK',  'Akuntansi', 72),
  ('MP',  'Manajemen Perkantoran', 72),
  ('PM',  'Pemasaran', 36),
  ('MM',  'Multimedia', 36),
  ('TKJ', 'Teknik Komputer dan Jaringan', 72);
