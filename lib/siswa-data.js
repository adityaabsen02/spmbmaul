// Query database untuk area calon siswa (hanya dipakai di server).
// SEMUA query diikat ke id pendaftar milik pengguna yang sedang login —
// siswa tidak pernah bisa membaca / mengubah data siswa lain.
import pool from "@/lib/db";
import { namaTampil, ukuranBerkas } from "@/lib/upload";
import { tanggalPanjang, tanggalPendek, hariTanggalJam } from "@/lib/format";

export const DURASI_TPA_MENIT = 60;
import { BERKAS, JALUR, WAJIB_DATA } from "@/lib/siswa-konst";
export { BERKAS, JALUR, WAJIB_DATA };
const WAJIB = BERKAS.filter((b) => b.wajib);


const DT = (k) => `DATE_FORMAT(${k}, '%Y-%m-%d %H:%i:%s')`;
const D = (k) => `DATE_FORMAT(${k}, '%Y-%m-%d')`;

function ekstensi(path) {
  const m = /\.([a-zA-Z0-9]+)$/.exec(path || "");
  return m ? m[1].toLowerCase() : "";
}

// Buat baris pendaftar saat siswa pertama kali membuka dashboard.
export async function pastikanPendaftar(userId) {
  const id = Number(userId);
  const [ada] = await pool.execute("SELECT id FROM pendaftar WHERE user_id = ?", [id]);
  if (ada[0]) return ada[0].id;

  const sementara = `TMP-${id}-${Date.now()}`;
  try {
    const [hasil] = await pool.execute(
      "INSERT INTO pendaftar (user_id, no_daftar) VALUES (?, ?)",
      [id, sementara]
    );
    const baru = hasil.insertId;
    const nomor = `SPMB-${new Date().getFullYear()}-${String(baru).padStart(4, "0")}`;
    await pool.execute("UPDATE pendaftar SET no_daftar = ? WHERE id = ?", [nomor, baru]);
    return baru;
  } catch (e) {
    if (e.code === "ER_DUP_ENTRY") {
      const [lagi] = await pool.execute("SELECT id FROM pendaftar WHERE user_id = ?", [id]);
      if (lagi[0]) return lagi[0].id;
    }
    throw e;
  }
}

export async function getPengaturanSiswa() {
  const [rows] = await pool.query("SELECT kunci, nilai FROM pengaturan");
  const p = Object.fromEntries(rows.map((r) => [r.kunci, r.nilai]));
  return {
    tahun_ajaran: p.tahun_ajaran || "",
    periode_buka: p.periode_buka || "",
    periode_tutup: p.periode_tutup || "",
    biaya: Number(p.biaya_pendaftaran || 0),
    rekening: p.rekening_pembayaran || "",
    tgl_pengumuman: p.tanggal_pengumuman_hasil || "20 Oktober 2026",
    tgl_daftar_ulang: p.periode_daftar_ulang || "22 - 28 Oktober 2026",
    kontak_wa: p.kontak_wa || "",
    kontak_email: p.kontak_email || "",
    biaya_du: Number(p.biaya_daftar_ulang || 650000),
    batas_bayar_du: p.batas_bayar_daftar_ulang || "26 Oktober 2026",
    lokasi_du: p.lokasi_daftar_ulang || "Ruang TU, SMK Citra Negara",
    jam_du: p.jam_daftar_ulang || "08.00 - 14.00 WIB",
    lokasi_tes: p.lokasi_tes || "Lab Komputer 1, SMK Citra Negara",
    batas_bayar: p.batas_pembayaran || "1 Oktober 2026",
    batas_berkas: p.batas_unggah_berkas || "5 Oktober 2026",
  };
}

/* Seluruh status calon siswa dalam satu objek. */
export async function getSiswa(userId) {
  const pid = await pastikanPendaftar(userId);

  const [[u], [pend], [dd], [dok], [by], [pil], [tpa], [sesi], [du], pengaturan] = await Promise.all([
    pool.execute("SELECT nama, email FROM users WHERE id = ?", [Number(userId)]),
    pool.execute(`SELECT id, no_daftar, nisn, asal_sekolah, keputusan, ${D("created_at")} AS dibuat FROM pendaftar WHERE id = ?`, [pid]),
    pool.execute(`SELECT jalur, nik, tempat_lahir, ${D("tanggal_lahir")} AS tanggal_lahir, jenis_kelamin, agama, anak_ke, telepon,
                         alamat, rt_rw, kelurahan, kecamatan, kota, provinsi, kode_pos, nama_ayah, pekerjaan_ayah,
                         nama_ibu, pekerjaan_ibu, telepon_ortu, penghasilan, npsn, tahun_lulus, rata_rapor, no_ijazah,
                         ${D("updated_at")} AS diperbarui
                  FROM data_diri WHERE pendaftar_id = ?`, [pid]),
    pool.execute("SELECT id, jenis, status, catatan, file_path FROM dokumen WHERE pendaftar_id = ?", [pid]),
    pool.execute(`SELECT id, nominal, status, catatan, bukti_path, ${D("tanggal_bayar")} AS tanggal FROM pembayaran WHERE pendaftar_id = ? AND jenis = 'pendaftaran'`, [pid]),
    pool.execute(`SELECT pp.urutan, j.id, j.kode, j.nama FROM pilihan_program pp JOIN jurusan j ON j.id = pp.jurusan_id
                  WHERE pp.pendaftar_id = ? ORDER BY pp.urutan`, [pid]),
    pool.execute(`SELECT ${DT("jadwal")} AS jadwal, nilai FROM tes_tpa WHERE pendaftar_id = ?`, [pid]),
    pool.execute(`SELECT ${DT("mulai_at")} AS mulai, ${DT("selesai_at")} AS selesai, TIMESTAMPDIFF(SECOND, mulai_at, NOW()) AS detik FROM tpa_sesi WHERE pendaftar_id = ?`, [pid]),
    pool.execute(`SELECT ukuran_baju, ukuran_celana, ukuran_sepatu, telepon_wali, setuju, status, ${D("created_at")} AS dibuat FROM daftar_ulang WHERE pendaftar_id = ?`, [pid]),
    getPengaturanSiswa(),
  ]);

  const data = { ...(dd[0] || {}), nisn: pend[0].nisn || "", asal_sekolah: pend[0].asal_sekolah || "" };
  const terisi = WAJIB_DATA.filter((k) => data[k] !== null && data[k] !== undefined && String(data[k]).trim() !== "").length;
  const persenData = Math.round((terisi / WAJIB_DATA.length) * 100);
  const dataLengkap = terisi === WAJIB_DATA.length;

  const dokumen = {};
  for (const j of BERKAS) {
    const r = dok.find((d) => d.jenis === j.key);
    dokumen[j.key] = r
      ? {
          id: r.id,
          status: r.status,
          catatan: r.catatan,
          ada: Boolean(r.file_path),
          ext: ekstensi(r.file_path),
          nama: r.file_path ? namaTampil(r.file_path) : "",
          ukuran: r.file_path ? await ukuranBerkas(r.file_path) : 0,
        }
      : { id: null, status: "kosong", catatan: null, ada: false, ext: "", nama: "", ukuran: 0 };
  }
  const wajibDok = WAJIB.map((b) => dokumen[b.key]);
  // berkas yang ditolak dihitung belum terunggah (harus diunggah ulang)
  const dokTerunggah = BERKAS.filter((b) => dokumen[b.key].ada && dokumen[b.key].status !== "ditolak").length;
  const dokOk = wajibDok.filter((d) => d.status === "terverifikasi").length;
  const dokTolak = BERKAS.filter((b) => dokumen[b.key].status === "ditolak").length;

  const bayar = by[0]
    ? { status: by[0].status, nominal: by[0].nominal, tanggal: by[0].tanggal, ada: Boolean(by[0].bukti_path), catatan: by[0].catatan }
    : null;

  const tes = {
    jadwal: tpa[0]?.jadwal || null,
    nilai: tpa[0]?.nilai === null || tpa[0]?.nilai === undefined ? null : Number(tpa[0].nilai),
    mulai: sesi[0]?.mulai || null,
    detik: sesi[0] ? Number(sesi[0].detik) : null,
    selesai: sesi[0]?.selesai || null,
  };

  let hasil = "menunggu";
  if (dokTolak > 0 || bayar?.status === "ditolak") hasil = "ditolak";
  else if (dokOk >= WAJIB.length && bayar?.status === "lunas" && tes.nilai !== null) {
    // Layak diputuskan; hasil baru terlihat siswa setelah Kepala Sekolah memutuskan.
    if (pend[0].keputusan === "disetujui") hasil = "lulus";
    else if (pend[0].keputusan === "ditolak") hasil = "ditolak";
  }

  const sudahDaftarUlang = du[0]?.status === "terkirim";

  // Tahapan seleksi (Frame 15) — urut, tiap tahap: done | now | todo
  const batas = pengaturan.periode_tutup ? tanggalPanjang(pengaturan.periode_tutup) : "";
  const tolakBerkas = BERKAS.find((x) => dokumen[x.key].status === "ditolak");
  const selesaiFlags = [
    true,
    dataLengkap,
    dokOk >= WAJIB.length,
    bayar?.status === "lunas",
    tes.nilai !== null,
    hasil === "lulus" || hasil === "ditolak",
    sudahDaftarUlang,
  ];
  const label = [
    ["Buat akun", "buat akun", `${pend[0].dibuat ? tanggalPanjang(pend[0].dibuat) : "-"} · Selesai`],
    ["Lengkapi data diri", "lengkapi data diri", dataLengkap ? `${data.diperbarui ? tanggalPanjang(data.diperbarui) : "-"} · Selesai` : `Kelengkapan biodata ${persenData}%`],
    ["Unggah dan verifikasi berkas", "verifikasi berkas",
      dokOk >= WAJIB.length ? "Semua berkas terverifikasi · Selesai"
        : tolakBerkas ? `${tolakBerkas.pendek.replace(/^\w/, (c) => c.toUpperCase())} perlu diunggah ulang${batas ? ` sebelum ${batas}` : ""}`
          : dokOk + dokTolak === 0 && !wajibDok.every((d) => d.ada) ? `Unggah semua berkas wajib${batas ? ` sebelum ${batas}` : ""}` : "Berkas sedang diperiksa panitia"],
    ["Pembayaran biaya pendaftaran", "pembayaran",
      bayar?.status === "lunas" ? "Pembayaran lunas · Selesai"
        : bayar?.status === "menunggu" ? "Bukti bayar sedang diperiksa panitia"
          : bayar?.status === "ditolak" ? "Bukti bayar ditolak, unggah ulang"
            : `Menunggu pembayaran${batas ? ` sebelum ${batas}` : ""}`],
    ["Tes Potensi Akademik", "tes TPA",
      tes.nilai !== null ? `Nilai kamu ${tes.nilai.toLocaleString("id-ID", { maximumFractionDigits: 1 })} · Selesai`
        : tes.jadwal ? hariTanggalJam(tes.jadwal).replace(/, (\d{2}\.\d{2}) WIB$/, " · $1 WIB") : "Jadwal akan diumumkan panitia"],
    ["Pengumuman hasil seleksi", "pengumuman hasil",
      hasil !== "menunggu" ? "Hasil seleksi sudah tersedia · Selesai" : pengaturan.tgl_pengumuman || "Setelah seluruh tahap selesai"],
    ["Daftar ulang", "daftar ulang",
      sudahDaftarUlang ? "Formulir daftar ulang terkirim · Selesai" : pengaturan.tgl_daftar_ulang || "Untuk peserta yang dinyatakan lulus"],
  ];
  const pertama = selesaiFlags.findIndex((x) => !x);
  const langkah = label.map(([judul, ringkas, sub], i) => ({
    judul,
    ringkas,
    sub,
    state: selesaiFlags[i] ? "done" : i === pertama ? "now" : "todo",
  }));
  const persen = Math.round((selesaiFlags.filter(Boolean).length / selesaiFlags.length) * 100);

  return {
    id: pid,
    no_daftar: pend[0].no_daftar,
    dibuat: pend[0].dibuat,
    nisn: pend[0].nisn || "",
    asal_sekolah: pend[0].asal_sekolah || "",
    nama: u[0].nama,
    email: u[0].email,
    data,
    dataLengkap,
    persenData,
    dokumen,
    dokTerunggah,
    totalBerkas: BERKAS.length,
    dokOk,
    dokTolak,
    semuaOk: dokOk >= WAJIB.length,
    semuaWajibAda: wajibDok.every((d) => d.ada),
    bayar,
    pilihan: pil,
    tes,
    hasil,
    daftarUlang: du[0] || null,
    pengaturan,
    langkah,
    persen,
    kartuTerbit: dokOk >= WAJIB.length && bayar?.status === "lunas",
  };
}

/* Program keahlian + jumlah peminat (pilihan 1 atau 2) untuk badge kuota. */
export async function getProgramSiswa() {
  const [rows] = await pool.query(
    `SELECT j.id, j.kode, j.nama, j.kuota,
            (SELECT COUNT(*) FROM pilihan_program pp WHERE pp.jurusan_id = j.id AND pp.urutan = 1) AS peminat
     FROM jurusan j ORDER BY j.nama`
  );
  return rows.map((r) => ({ ...r, kuota: Number(r.kuota), peminat: Number(r.peminat) }));
}

const KATEGORI = [
  [/hasil|lulus|seleksi/i, "Hasil seleksi"],
  [/jadwal|tes|tpa|batas|perpanjang/i, "Jadwal"],
];
export function kategoriPengumuman(judul) {
  for (const [re, nama] of KATEGORI) if (re.test(judul || "")) return nama;
  return "Informasi";
}

export async function getPengumumanSiswa() {
  const [rows] = await pool.query(
    `SELECT id, judul, isi, ${D("created_at")} AS tanggal FROM pengumuman
     WHERE status = 'terbit' ORDER BY created_at DESC, id DESC LIMIT 50`
  );
  return rows.map((r) => ({ ...r, kategori: kategoriPengumuman(r.judul) }));
}

/* Soal TPA TANPA kunci jawaban (kunci tidak boleh sampai ke browser). */
export async function getSoalTpa() {
  const [rows] = await pool.query(
    "SELECT id, nomor, pertanyaan, opsi_a, opsi_b, opsi_c, opsi_d FROM tpa_soal ORDER BY nomor"
  );
  return rows;
}

export async function getJawabanTpa(pendaftarId) {
  const [rows] = await pool.execute("SELECT soal_id, jawaban FROM tpa_jawaban WHERE pendaftar_id = ?", [pendaftarId]);
  return Object.fromEntries(rows.map((r) => [r.soal_id, r.jawaban]));
}

export async function jumlahSoalTpa() {
  const [rows] = await pool.query("SELECT COUNT(*) AS n FROM tpa_soal");
  return Number(rows[0].n);
}

/* Syarat sebelum boleh mengikuti tes (Frame 11). [label, "ok" | "wait" | "no"] */
export function syaratTes(s) {
  const semuaAda = s.semuaWajibAda;
  return [
    ["Data lengkap", s.dataLengkap && s.pilihan.length > 0 ? "ok" : "no"],
    ["Berkas terverifikasi", s.semuaOk ? "ok" : semuaAda && s.dokTolak === 0 ? "wait" : "no"],
    ["Pembayaran lunas", s.bayar?.status === "lunas" ? "ok" : s.bayar?.status === "menunggu" ? "wait" : "no"],
    ["Kartu peserta", s.kartuTerbit ? "ok" : "no"],
  ];
}

// Pemeriksaan di SERVER sebelum tes dimulai (tombol di browser hanya tampilan).
export async function cekBolehMulaiTes(s) {
  if (syaratTes(s).some(([, st]) => st !== "ok")) {
    return { ok: false, pesan: "Syarat mengikuti tes belum terpenuhi." };
  }
  if (s.tes.selesai || s.tes.nilai !== null) {
    return { ok: false, pesan: "Tes sudah kamu selesaikan." };
  }
  const [rows] = await pool.execute(
    "SELECT (jadwal IS NOT NULL AND jadwal <= NOW()) AS buka FROM tes_tpa WHERE pendaftar_id = ?",
    [s.id]
  );
  if (!rows[0] || !Number(rows[0].buka)) {
    return { ok: false, pesan: "Tes belum dibuka. Tunggu sampai jadwal yang ditentukan." };
  }
  return { ok: true };
}

/* Pembayaran biaya daftar ulang (baris pembayaran dengan jenis = daftar_ulang). */
export async function getBayarDaftarUlang(pendaftarId) {
  const [rows] = await pool.execute(
    "SELECT id, nominal, status, catatan, bukti_path FROM pembayaran WHERE pendaftar_id = ? AND jenis = 'daftar_ulang'",
    [pendaftarId]
  );
  const r = rows[0];
  return r ? { status: r.status, catatan: r.catatan, ada: Boolean(r.bukti_path) } : null;
}
