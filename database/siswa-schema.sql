-- =====================================================================
-- SPMB SMK Citra Negara — tabel tambahan untuk fitur CALON SISWA
-- Jalankan SETELAH admin-schema.sql. Aman dijalankan berulang.
-- =====================================================================

-- Program keahlian sesuai desain (kalau belum ada)
INSERT IGNORE INTO jurusan (kode, nama, kuota) VALUES
  ('AK',  'Akuntansi', 72),
  ('MP',  'Manajemen Perkantoran', 72),
  ('PM',  'Pemasaran', 36),
  ('MM',  'Multimedia', 36),
  ('TKJ', 'Teknik Komputer dan Jaringan', 72);

-- Hapus program tebakan lama (RPL/AKL/OTKP) HANYA kalau belum dipakai siapa pun
DELETE FROM jurusan
WHERE kode IN ('RPL', 'AKL', 'OTKP', 'PH')
  AND id NOT IN (SELECT jurusan_id FROM pendaftar WHERE jurusan_id IS NOT NULL);

-- Jenis dokumen bertambah: rapor semester 1-5 (wajib) dan sertifikat prestasi (opsional)
ALTER TABLE dokumen MODIFY jenis ENUM('kartu_keluarga','akta_lahir','ijazah','pas_foto','rapor','sertifikat') NOT NULL;

CREATE TABLE IF NOT EXISTS data_diri (
  pendaftar_id INT PRIMARY KEY,
  jalur VARCHAR(20) NOT NULL DEFAULT 'Reguler',
  nik VARCHAR(20) NULL,
  tempat_lahir VARCHAR(80) NULL,
  tanggal_lahir DATE NULL,
  jenis_kelamin ENUM('L','P') NULL,
  agama VARCHAR(30) NULL,
  anak_ke TINYINT NULL,
  telepon VARCHAR(20) NULL,
  alamat VARCHAR(255) NULL,
  rt_rw VARCHAR(10) NULL,
  kelurahan VARCHAR(80) NULL,
  kecamatan VARCHAR(80) NULL,
  kota VARCHAR(80) NULL,
  provinsi VARCHAR(80) NULL,
  kode_pos VARCHAR(10) NULL,
  nama_ayah VARCHAR(100) NULL,
  pekerjaan_ayah VARCHAR(100) NULL,
  nama_ibu VARCHAR(100) NULL,
  pekerjaan_ibu VARCHAR(100) NULL,
  telepon_ortu VARCHAR(20) NULL,
  penghasilan VARCHAR(40) NULL,
  npsn VARCHAR(12) NULL,
  tahun_lulus VARCHAR(4) NULL,
  rata_rapor DECIMAL(5,2) NULL,
  no_ijazah VARCHAR(50) NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (pendaftar_id) REFERENCES pendaftar(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS pilihan_program (
  pendaftar_id INT NOT NULL,
  urutan TINYINT NOT NULL,
  jurusan_id INT NOT NULL,
  PRIMARY KEY (pendaftar_id, urutan),
  FOREIGN KEY (pendaftar_id) REFERENCES pendaftar(id) ON DELETE CASCADE,
  FOREIGN KEY (jurusan_id) REFERENCES jurusan(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS tpa_soal (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nomor INT NOT NULL UNIQUE,
  pertanyaan TEXT NOT NULL,
  opsi_a VARCHAR(200) NOT NULL,
  opsi_b VARCHAR(200) NOT NULL,
  opsi_c VARCHAR(200) NOT NULL,
  opsi_d VARCHAR(200) NOT NULL,
  kunci CHAR(1) NOT NULL
);

CREATE TABLE IF NOT EXISTS tpa_sesi (
  pendaftar_id INT PRIMARY KEY,
  mulai_at DATETIME NOT NULL,
  selesai_at DATETIME NULL,
  FOREIGN KEY (pendaftar_id) REFERENCES pendaftar(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS tpa_jawaban (
  pendaftar_id INT NOT NULL,
  soal_id INT NOT NULL,
  jawaban CHAR(1) NOT NULL,
  PRIMARY KEY (pendaftar_id, soal_id),
  FOREIGN KEY (pendaftar_id) REFERENCES pendaftar(id) ON DELETE CASCADE,
  FOREIGN KEY (soal_id) REFERENCES tpa_soal(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS daftar_ulang (
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

-- 10 soal TPA contoh (Verbal, Numerik, Logika) — silakan ganti lewat phpMyAdmin
INSERT IGNORE INTO tpa_soal (nomor, pertanyaan, opsi_a, opsi_b, opsi_c, opsi_d, kunci) VALUES
 (1, 'Sinonim dari kata "hipotesis" adalah ...', 'Kesimpulan akhir', 'Dugaan sementara', 'Fakta lapangan', 'Teori yang terbukti', 'B'),
 (2, 'Antonim dari kata "transparan" adalah ...', 'Jelas', 'Terbuka', 'Tertutup', 'Bening', 'C'),
 (3, 'Buku : Perpustakaan = Obat : ...', 'Dokter', 'Apotek', 'Pasien', 'Penyakit', 'B'),
 (4, 'Penggunaan energi surya terus meningkat karena harga panel semakin murah dan kesadaran akan lingkungan bertambah. Pernyataan yang sesuai dengan teks tersebut adalah ...', 'Energi surya semakin mahal', 'Panel surya semakin terjangkau', 'Masyarakat tidak peduli lingkungan', 'Panel surya tidak lagi digunakan', 'B'),
 (5, 'Lanjutkan deret angka: 2, 3, 5, 8, 12, 17, ...', '22', '23', '24', '25', 'B'),
 (6, 'Sebuah motor menempuh 180 km dalam 3 jam. Dengan kecepatan yang sama, berapa km jarak yang ditempuh dalam 5 jam?', '270 km', '300 km', '320 km', '360 km', 'B'),
 (7, 'Harga sebuah baju Rp150.000 mendapat diskon 20%. Berapa harga yang harus dibayar?', 'Rp110.000', 'Rp120.000', 'Rp125.000', 'Rp130.000', 'B'),
 (8, 'Semua siswa SMK wajib mengikuti praktik kerja. Dina adalah siswa SMK. Kesimpulan yang benar adalah ...', 'Dina tidak wajib praktik kerja', 'Dina wajib mengikuti praktik kerja', 'Dina bukan siswa', 'Sebagian siswa tidak praktik', 'B'),
 (9, 'Jika x + 7 = 15, maka nilai 2x − 3 adalah ...', '11', '12', '13', '14', 'C'),
 (10, 'Jika semua kucing adalah hewan dan sebagian hewan adalah liar, maka pernyataan yang pasti benar adalah ...', 'Semua kucing liar', 'Sebagian kucing liar', 'Semua kucing adalah hewan', 'Tidak ada kucing liar', 'C');

-- Tanggal yang tampil di halaman Status Seleksi (ubah lewat phpMyAdmin kalau perlu)
INSERT IGNORE INTO pengaturan (kunci, nilai) VALUES
  ('tanggal_pengumuman_hasil', '20 Oktober 2026'),
  ('periode_daftar_ulang', '22 - 28 Oktober 2026');

-- Perbaikan soal (aman diulang): soal 1 sesuai desain, kunci soal 5 = 23
UPDATE tpa_soal SET pertanyaan = 'Sinonim dari kata "hipotesis" adalah ...', opsi_a = 'Kesimpulan akhir', opsi_b = 'Dugaan sementara', opsi_c = 'Fakta lapangan', opsi_d = 'Teori yang terbukti', kunci = 'B' WHERE nomor = 1;
UPDATE tpa_soal SET kunci = 'B' WHERE nomor = 5;
