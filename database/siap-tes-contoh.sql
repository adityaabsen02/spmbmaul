-- =====================================================================
-- UNTUK UJI COBA: membuat 1 akun siswa langsung memenuhi semua syarat tes
-- (data diri lengkap, berkas terverifikasi, pembayaran lunas, jadwal sudah tiba).
-- Ganti email di baris pertama dengan email akun siswa kamu, lalu jalankan semua.
-- Cara normal tanpa file ini: lengkapi sendiri sebagai siswa, lalu admin
-- memverifikasi berkas, melunasi pembayaran, dan mengatur jadwal tes.
-- =====================================================================
SET @email = 'aditmaul@gmail.com';
SET @pid = (SELECT p.id FROM pendaftar p JOIN users u ON u.id = p.user_id WHERE u.email = @email);

UPDATE pendaftar
SET nisn = '0091234567', asal_sekolah = 'SMP Negeri 5 Bekasi',
    jurusan_id = (SELECT id FROM jurusan WHERE kode = 'AK')
WHERE id = @pid;

INSERT INTO data_diri (pendaftar_id, nik, tempat_lahir, tanggal_lahir, jenis_kelamin, agama, anak_ke, telepon,
  alamat, rt_rw, kelurahan, kecamatan, kota, provinsi, kode_pos, nama_ayah, pekerjaan_ayah, nama_ibu,
  pekerjaan_ibu, telepon_ortu, penghasilan, npsn, tahun_lulus, rata_rapor)
VALUES (@pid, '3275016512100003', 'Bekasi', '2010-12-05', 'L', 'Islam', 2, '081234567890',
  'Jl. Melati No. 12', '004 / 009', 'Harapan Jaya', 'Bekasi Utara', 'Kota Bekasi', 'Jawa Barat', '17124',
  'Budi Santoso', 'Wiraswasta', 'Siti Aminah', 'Ibu rumah tangga', '085398765432',
  'Rp1.000.000 - Rp2.500.000', '20219876', '2026', 85.50)
ON DUPLICATE KEY UPDATE nik = VALUES(nik), tempat_lahir = VALUES(tempat_lahir), tanggal_lahir = VALUES(tanggal_lahir),
  jenis_kelamin = VALUES(jenis_kelamin), agama = VALUES(agama), anak_ke = VALUES(anak_ke), telepon = VALUES(telepon),
  alamat = VALUES(alamat), rt_rw = VALUES(rt_rw), kelurahan = VALUES(kelurahan), kecamatan = VALUES(kecamatan),
  kota = VALUES(kota), provinsi = VALUES(provinsi), kode_pos = VALUES(kode_pos), nama_ayah = VALUES(nama_ayah),
  pekerjaan_ayah = VALUES(pekerjaan_ayah), nama_ibu = VALUES(nama_ibu), pekerjaan_ibu = VALUES(pekerjaan_ibu),
  telepon_ortu = VALUES(telepon_ortu), penghasilan = VALUES(penghasilan), npsn = VALUES(npsn),
  tahun_lulus = VALUES(tahun_lulus), rata_rapor = VALUES(rata_rapor);

INSERT IGNORE INTO pilihan_program (pendaftar_id, urutan, jurusan_id)
SELECT @pid, 1, id FROM jurusan WHERE kode = 'AK';

INSERT INTO dokumen (pendaftar_id, jenis, file_path, status)
SELECT @pid, j.jenis, 'contoh/dokumen-contoh.png', 'terverifikasi'
FROM (SELECT 'kartu_keluarga' AS jenis UNION ALL SELECT 'akta_lahir' UNION ALL SELECT 'ijazah'
      UNION ALL SELECT 'pas_foto' UNION ALL SELECT 'rapor') j
ON DUPLICATE KEY UPDATE status = 'terverifikasi', catatan = NULL,
  file_path = COALESCE(file_path, 'contoh/dokumen-contoh.png');

INSERT INTO pembayaran (pendaftar_id, nominal, tanggal_bayar, bukti_path, status)
VALUES (@pid, 150000, CURDATE(), 'contoh/bukti-contoh.png', 'lunas')
ON DUPLICATE KEY UPDATE status = 'lunas', catatan = NULL;

DELETE FROM tpa_jawaban WHERE pendaftar_id = @pid;
DELETE FROM tpa_sesi WHERE pendaftar_id = @pid;
INSERT INTO tes_tpa (pendaftar_id, jadwal, nilai) VALUES (@pid, NOW() - INTERVAL 1 HOUR, NULL)
ON DUPLICATE KEY UPDATE jadwal = VALUES(jadwal), nilai = NULL;
