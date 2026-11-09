-- Role Kepala Sekolah: keputusan kelulusan per pendaftar.
-- JALANKAN SEKALI SAJA di phpMyAdmin (database spmb, tab SQL).
ALTER TABLE pendaftar
  ADD COLUMN keputusan ENUM('menunggu','disetujui','ditolak') NOT NULL DEFAULT 'menunggu',
  ADD COLUMN keputusan_oleh INT NULL,
  ADD COLUMN keputusan_at DATETIME NULL;

-- (Opsional, untuk uji coba) setujui semua yang sudah punya nilai tes supaya
-- siswa yang sedang kamu tes tetap tampil "diterima":
-- UPDATE pendaftar p JOIN tes_tpa t ON t.pendaftar_id = p.id AND t.nilai IS NOT NULL
--   SET p.keputusan = 'disetujui', p.keputusan_at = NOW();
