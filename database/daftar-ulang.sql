-- Formulir daftar ulang versi baru (ukuran baju/celana/sepatu + simpan draft).
-- Tabel lama belum pernah dipakai, jadi aman dibuat ulang.
DROP TABLE IF EXISTS daftar_ulang;
CREATE TABLE daftar_ulang (
  pendaftar_id INT PRIMARY KEY,
  ukuran_baju VARCHAR(5) NULL,
  ukuran_celana VARCHAR(5) NULL,
  ukuran_sepatu VARCHAR(5) NULL,
  telepon_wali VARCHAR(20) NULL,
  setuju TINYINT(1) NOT NULL DEFAULT 0,
  status ENUM('draft','terkirim') NOT NULL DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (pendaftar_id) REFERENCES pendaftar(id) ON DELETE CASCADE
);

-- Pengaturan tambahan (boleh diubah lewat phpMyAdmin)
INSERT IGNORE INTO pengaturan (kunci, nilai) VALUES
  ('biaya_daftar_ulang', '650000'),
  ('batas_bayar_daftar_ulang', '26 Oktober 2026'),
  ('lokasi_daftar_ulang', 'Ruang TU, SMK Citra Negara'),
  ('jam_daftar_ulang', '08.00 - 14.00 WIB'),
  ('lokasi_tes', 'Lab Komputer 1, SMK Citra Negara'),
  ('batas_pembayaran', '1 Oktober 2026'),
  ('batas_unggah_berkas', '5 Oktober 2026');
