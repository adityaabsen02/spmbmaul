
## Tahap 3 fitur: Kartu peserta, Pengumuman, Daftar ulang
1. Jalankan `database/daftar-ulang.sql` di phpMyAdmin (membuat ulang tabel daftar_ulang + pengaturan baru).
2. Kartu peserta muncul setelah semua berkas wajib terverifikasi dan pembayaran lunas.
3. Pengumuman diambil dari menu Pengumuman admin (yang berstatus terbit). Kategori ditentukan dari kata di judul (jadwal/tes -> Jadwal, hasil/lulus/seleksi -> Hasil seleksi, lainnya -> Info).
4. Daftar ulang hanya terbuka untuk siswa yang hasilnya lulus (berkas OK + lunas + sudah ada nilai TPA).
