# Role Calon Siswa — SPMB SMK Citra Negara (tahap 3: 8 halaman)

Sudah jadi: **Dashboard, Data Diri, Unggah Berkas, Pembayaran, Pilihan Program, Tes TPA (info + soal), Status Seleksi**.
Menu lain (Kartu peserta, Pengumuman, Daftar ulang) tampil sebagai halaman "sedang disiapkan" dan menyusul.

## Tes TPA
- Admin mengatur jadwal di menu Hasil Tes TPA (tombol atur jadwal). Tombol "Mulai tes" siswa aktif jika: data lengkap, semua berkas terverifikasi, pembayaran lunas, dan jadwal sudah tiba.
- Soal ada di tabel `tpa_soal` (10 soal contoh, bisa diubah di phpMyAdmin). Waktu 60 menit dihitung di server; nilai dihitung server dan masuk ke menu Hasil Tes TPA admin.
- Jalankan `database/perbarui-program.sql` sekali (memperbaiki soal & menambah tanggal untuk halaman Status Seleksi).

Pembayaran memakai transfer manual: siswa transfer ke rekening dari menu Pengaturan admin (isi format `BRI · 1234-5678`), lalu unggah bukti. Admin mengonfirmasi di menu Pembayaran admin.

Kalau sebelumnya sudah menjalankan siswa-schema.sql, jalankan juga `database/perbarui-program.sql` sekali.

## Cara pasang (gabung dengan admin)
1. Salin isi zip ini ke proyek (timpa file yang sama). Admin dan siswa memakai login, tabel `users`, dan database yang sama.
2. **HAPUS** file lama `app/dashboard/calon-siswa/page.js` (kalau ada) — sekarang halamannya ada di `app/dashboard/calon-siswa/(portal)/page.js`; kalau dibiarkan Next.js akan error "conflicting routes".
3. Di phpMyAdmin (database `spmb`) jalankan berurutan:
   - `database/admin-schema.sql` (aman diulang)
   - `database/siswa-schema.sql` (menambah tabel siswa + jenis dokumen rapor & sertifikat + 10 soal TPA contoh)
   - (opsional) `database/seed-contoh.sql` untuk data contoh admin
4. `npm run dev`, login dengan akun role `calon_siswa` (daftar lewat halaman Buat Akun) → otomatis masuk `/dashboard/calon-siswa`.

## Nyambung ke admin
- Siswa mengisi data diri → muncul di admin (Data Pendaftar: nama, NISN, asal sekolah).
- Siswa unggah berkas → muncul di admin **Verifikasi Dokumen** (status "menunggu"); admin menyetujui/menolak, hasilnya tampil di halaman siswa (termasuk catatan penolakan).
- Berkas wajib sekarang 5 (KK, Akta, Pas foto, Ijazah/SKL, Rapor semester 1-5); Sertifikat prestasi opsional. Admin otomatis mendapat tab baru untuk Rapor dan Sertifikat.
- Berkas disimpan di folder `storage/` (bukan `public/`), hanya bisa dibuka lewat API oleh pemiliknya dan admin.
- Program keahlian disesuaikan dengan Figma: Akuntansi, Manajemen Perkantoran, Perhotelan, Multimedia, TKJ (ubah di tabel `jurusan`).

## Catatan
- Teks yang buram di Figma ditebak (mis. isi pesan "berkas ditolak" memakai catatan dari admin).
- Batas waktu berkas dan pembayaran memakai satu tanggal: "Tanggal tutup" di Pengaturan admin.
- Font heading (Merriweather) dimuat dari Google Fonts, jadi butuh internet saat dibuka.
