-- Isi biaya pendaftaran dan nomor tujuan pembayaran (bisa diubah lagi lewat menu Pengaturan admin).
INSERT INTO pengaturan (kunci, nilai) VALUES ('biaya_pendaftaran', '150000')
  ON DUPLICATE KEY UPDATE nilai = VALUES(nilai);
INSERT INTO pengaturan (kunci, nilai) VALUES ('rekening_pembayaran', '8877 0812 3456 7890')
  ON DUPLICATE KEY UPDATE nilai = VALUES(nilai);

-- Tanggal di halaman Status Seleksi
INSERT IGNORE INTO pengaturan (kunci, nilai) VALUES
  ('tanggal_pengumuman_hasil', '20 Oktober 2026'),
  ('periode_daftar_ulang', '22 - 28 Oktober 2026');
