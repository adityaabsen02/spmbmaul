// Konstanta area calon siswa — TIDAK menyentuh database, aman diimpor komponen client.

// Urutan & nama berkas persis seperti di desain (Frame 7).
export const BERKAS = [
  { key: "kartu_keluarga", judul: "Kartu Keluarga (KK)", pendek: "Kartu Keluarga", wajib: true },
  { key: "akta_lahir", judul: "Akta Kelahiran", pendek: "Akta Kelahiran", wajib: true },
  { key: "pas_foto", judul: "Pas foto 3x4 (latar merah)", pendek: "Pas foto", wajib: true },
  { key: "ijazah", judul: "Ijazah / Surat Keterangan Lulus", pendek: "Ijazah / SKL", wajib: true },
  { key: "rapor", judul: "Rapor semester 1-5", pendek: "rapor semester 1-5", wajib: true },
  { key: "sertifikat", judul: "Sertifikat prestasi (opsional)", pendek: "Sertifikat prestasi", wajib: false },
];

export const JALUR = ["Reguler", "Prestasi", "Afirmasi", "Mutasi"];

// Kolom wajib (kolom bertanda * di Frame 8). no_ijazah tidak wajib.
export const WAJIB_DATA = [
  "nisn", "nik", "tempat_lahir", "tanggal_lahir", "jenis_kelamin", "agama", "anak_ke", "telepon",
  "alamat", "rt_rw", "kelurahan", "kecamatan", "kota", "provinsi", "kode_pos",
  "nama_ayah", "pekerjaan_ayah", "nama_ibu", "pekerjaan_ibu", "telepon_ortu", "penghasilan",
  "asal_sekolah", "npsn", "tahun_lulus", "rata_rapor",
];

export const AGAMA = ["Islam", "Kristen", "Katolik", "Hindu", "Buddha", "Konghucu"];

export const PENGHASILAN = [
  "Kurang dari Rp1.000.000",
  "Rp1.000.000 - Rp2.500.000",
  "Rp2.500.000 - Rp5.000.000",
  "Rp5.000.000 - Rp10.000.000",
  "Lebih dari Rp10.000.000",
];

export const PROVINSI = [
  "Aceh", "Sumatera Utara", "Sumatera Barat", "Riau", "Kepulauan Riau", "Jambi", "Sumatera Selatan",
  "Bangka Belitung", "Bengkulu", "Lampung", "DKI Jakarta", "Jawa Barat", "Banten", "Jawa Tengah",
  "DI Yogyakarta", "Jawa Timur", "Bali", "Nusa Tenggara Barat", "Nusa Tenggara Timur", "Kalimantan Barat",
  "Kalimantan Tengah", "Kalimantan Selatan", "Kalimantan Timur", "Kalimantan Utara", "Sulawesi Utara",
  "Gorontalo", "Sulawesi Tengah", "Sulawesi Barat", "Sulawesi Selatan", "Sulawesi Tenggara", "Maluku",
  "Maluku Utara", "Papua", "Papua Barat", "Papua Selatan", "Papua Tengah", "Papua Pegunungan", "Papua Barat Daya",
];

// Urutan kartu & keterangan program (Frame 13). Kunci = kolom `kode` di tabel jurusan.
export const URUTAN_PROGRAM = ["AK", "MP", "PM", "MM", "TKJ"];
export const PROGRAM_INFO = {
  AK: { deskripsi: "Belajar pencatatan keuangan, perpajakan, dan aplikasi akuntansi.", prospek: "Staf akuntansi, kasir, admin keuangan" },
  MP: { deskripsi: "Belajar administrasi, kearsipan, dan layanan bisnis perkantoran.", prospek: "Sekretaris, staf administrasi, resepsionis" },
  PM: { deskripsi: "Belajar strategi penjualan, bisnis online, dan layanan pelanggan.", prospek: "Sales, admin toko online, wirausaha" },
  MM: { deskripsi: "Belajar desain grafis, editing video, dan animasi.", prospek: "Desainer grafis, editor video, content creator" },
  TKJ: { deskripsi: "Belajar merakit komputer, jaringan, dan pengelolaan server.", prospek: "Teknisi jaringan, admin server, IT support" },
};

// Pilihan formulir daftar ulang (Frame 16)
export const UKURAN_BAJU = ["XS", "S", "M", "L", "XL", "XXL"];
export const UKURAN_CELANA = ["26", "27", "28", "29", "30", "31", "32", "33", "34", "36", "38"];
export const UKURAN_SEPATU = ["36", "37", "38", "39", "40", "41", "42", "43", "44", "45"];
