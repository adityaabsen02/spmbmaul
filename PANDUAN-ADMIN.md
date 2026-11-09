# Panduan Fitur Admin SPMB

## 1. Salin file
Salin isi folder ini ke root project `spmb` (timpa kalau ditanya):
`app/`, `lib/`, `database/`, `storage/`.
(`lib/auth.js` dan `app/dashboard/admin/page.js` menggantikan versi lama. `lib/db.js` TIDAK ditimpa.)

## 2. Buat tabel (phpMyAdmin → database `spmb` → tab SQL)
1. Tempel isi `database/admin-schema.sql` → Go.
2. (Opsional, untuk mencoba) tempel isi `database/seed-contoh.sql` → Go.
3. Buka tabel `jurusan` dan ganti 4 jurusan awal dengan jurusan SMK Citra Negara yang sebenarnya.

## 3. Jalankan
`npm run dev` → buka `http://localhost:3000/login` → masuk sebagai admin.

## 4. Hapus data contoh kalau sudah tidak dipakai
```sql
DELETE FROM users WHERE email LIKE 'demo%@spmb.test';
DELETE FROM pengumuman WHERE judul LIKE '[CONTOH]%';
```
(Pendaftar, dokumen, pembayaran, dan nilai contoh ikut terhapus otomatis.)

## Catatan
- Berkas upload calon siswa disimpan di folder `storage/` (BUKAN `public/`),
  hanya bisa dibuka admin lewat `/api/admin/berkas/...`.
- Setiap API `/api/admin/*` memeriksa sesi + role admin di server.
