// Query database untuk halaman admin (hanya dipakai di server component).
import pool from "@/lib/db";

const DT = (kolom) => `DATE_FORMAT(${kolom}, '%Y-%m-%d %H:%i:%s')`;
const D = (kolom) => `DATE_FORMAT(${kolom}, '%Y-%m-%d')`;
const JUMLAH_JENIS = 5; // wajib: ijazah, kartu keluarga, akta lahir, pas foto, rapor (sertifikat = opsional)
const num = (v) => Number(v ?? 0);

function ekstensi(path) {
  const m = /\.([a-zA-Z0-9]+)$/.exec(path || "");
  return m ? m[1].toLowerCase() : "";
}

/* ------------------------------------------------------------------ */
/* Pendaftar (dasar untuk daftar & hitungan)                           */
/*  - dokumen : lengkap (4 terverifikasi) / ditolak / belum            */
/*  - status  : ditolak (ada berkas/bayar ditolak)                     */
/*              lulus   (dokumen lengkap + lunas + nilai TPA ada)      */
/*              menunggu (selain itu)                                  */
/* ------------------------------------------------------------------ */
const BASE_PENDAFTAR = `
  SELECT x.*,
    CASE
      WHEN x.dok_tolak > 0 THEN 'ditolak'
      WHEN x.dok_ok >= ${JUMLAH_JENIS} THEN 'lengkap'
      ELSE 'belum'
    END AS dokumen_label,
    CASE
      WHEN x.dok_tolak > 0 OR x.bayar = 'ditolak' THEN 'ditolak'
      WHEN x.dok_ok >= ${JUMLAH_JENIS} AND x.bayar = 'lunas' AND x.tpa_ada = 1 THEN 'lulus'
      ELSE 'menunggu'
    END AS status_label
  FROM (
    SELECT p.id, p.no_daftar, u.nama, j.kode AS jurusan, p.jurusan_id,
      COALESCE(d.ok, 0) AS dok_ok,
      COALESCE(d.tolak, 0) AS dok_tolak,
      COALESCE(pb.status, 'belum') AS bayar,
      CASE WHEN t.nilai IS NULL THEN 0 ELSE 1 END AS tpa_ada
    FROM pendaftar p
    JOIN users u ON u.id = p.user_id
    LEFT JOIN jurusan j ON j.id = p.jurusan_id
    LEFT JOIN (
      SELECT pendaftar_id,
        SUM(status = 'terverifikasi') AS ok,
        SUM(status = 'ditolak') AS tolak
      FROM dokumen GROUP BY pendaftar_id
    ) d ON d.pendaftar_id = p.id
    LEFT JOIN pembayaran pb ON pb.pendaftar_id = p.id AND pb.jenis = 'pendaftaran'
    LEFT JOIN tes_tpa t ON t.pendaftar_id = p.id
  ) x`;

const STATUS_VALID = ["menunggu", "lulus", "ditolak"];

/* ------------------------------------------------------------------ */
/* Ringkasan dashboard                                                 */
/* ------------------------------------------------------------------ */
export async function getRingkasan() {
  const [rows] = await pool.query(`
    SELECT
      (SELECT COUNT(*) FROM pendaftar) AS total_pendaftar,
      (SELECT COUNT(*) FROM dokumen WHERE status = 'menunggu') AS dokumen_menunggu,
      (SELECT COUNT(*) FROM pembayaran WHERE status = 'menunggu') AS bayar_menunggu,
      (SELECT COUNT(*) FROM pendaftar p LEFT JOIN tes_tpa t ON t.pendaftar_id = p.id WHERE t.nilai IS NULL) AS tpa_belum,
      (SELECT COUNT(*) FROM tes_tpa WHERE jadwal IS NOT NULL) AS tpa_terjadwal,
      (SELECT COUNT(*) FROM tes_tpa WHERE nilai IS NOT NULL) AS tpa_dinilai,
      (SELECT COUNT(*) FROM pengumuman WHERE status = 'draf') AS pengumuman_draf,
      (SELECT COUNT(*) FROM pengumuman WHERE status = 'terbit') AS pengumuman_terbit,
      (SELECT ${D("MIN(created_at)")} FROM dokumen WHERE status = 'menunggu') AS dokumen_sejak,
      (SELECT ${D("MIN(COALESCE(tanggal_bayar, created_at))")} FROM pembayaran WHERE status = 'menunggu') AS bayar_sejak
  `);
  const [lulus] = await pool.query(
    `SELECT COUNT(*) AS n FROM (${BASE_PENDAFTAR}) y WHERE y.status_label = 'lulus'`
  );
  const r = rows[0] || {};
  return {
    total_pendaftar: num(r.total_pendaftar),
    dokumen_menunggu: num(r.dokumen_menunggu),
    bayar_menunggu: num(r.bayar_menunggu),
    tpa_belum: num(r.tpa_belum),
    tpa_terjadwal: num(r.tpa_terjadwal),
    tpa_dinilai: num(r.tpa_dinilai),
    pengumuman_draf: num(r.pengumuman_draf),
    pengumuman_terbit: num(r.pengumuman_terbit),
    dokumen_sejak: r.dokumen_sejak || "",
    bayar_sejak: r.bayar_sejak || "",
    selesai: num(lulus[0]?.n),
  };
}

/* ------------------------------------------------------------------ */
/* Data pendaftar                                                      */
/* ------------------------------------------------------------------ */
export async function getPendaftar({ q = "", jurusan = "", status = "", page = 1, perPage = 10 }) {
  const where = [];
  const params = [];

  if (q) {
    where.push("(y.nama LIKE ? OR y.no_daftar LIKE ?)");
    params.push(`%${q}%`, `%${q}%`);
  }

  const jurusanId = Number(jurusan);
  if (Number.isInteger(jurusanId) && jurusanId > 0) {
    where.push("y.jurusan_id = ?");
    params.push(jurusanId);
  }

  if (STATUS_VALID.includes(status)) {
    where.push("y.status_label = ?");
    params.push(status);
  }

  const klausa = where.length ? `WHERE ${where.join(" AND ")}` : "";

  const [hitung] = await pool.query(
    `SELECT COUNT(*) AS total FROM (${BASE_PENDAFTAR}) y ${klausa}`,
    params
  );
  const total = num(hitung[0]?.total);
  const pages = Math.max(1, Math.ceil(total / perPage));
  const halaman = Math.min(Math.max(1, Number(page) || 1), pages);

  const [rows] = await pool.query(
    `SELECT y.* FROM (${BASE_PENDAFTAR}) y ${klausa}
     ORDER BY y.id DESC LIMIT ? OFFSET ?`,
    [...params, perPage, (halaman - 1) * perPage]
  );

  return { rows, total, pages, page: halaman, perPage };
}

export async function getJurusan() {
  const [rows] = await pool.query(
    "SELECT id, kode, nama, kuota FROM jurusan ORDER BY id"
  );
  return rows.map((r) => ({ ...r, kuota: num(r.kuota) }));
}

/* ------------------------------------------------------------------ */
/* Verifikasi dokumen                                                  */
/* ------------------------------------------------------------------ */
export async function getAntreanDokumen() {
  const [rows] = await pool.query(
    "SELECT DISTINCT pendaftar_id AS id FROM dokumen WHERE status = 'menunggu' ORDER BY pendaftar_id"
  );
  return rows.map((r) => r.id);
}

export async function getDetailPendaftar(id) {
  const [rows] = await pool.query(
    `SELECT p.id, p.no_daftar, p.nisn, p.asal_sekolah, u.nama, j.kode AS program, j.nama AS program_nama
     FROM pendaftar p
     JOIN users u ON u.id = p.user_id
     LEFT JOIN jurusan j ON j.id = p.jurusan_id
     WHERE p.id = ?`,
    [id]
  );
  if (!rows[0]) return null;

  const [dok] = await pool.query(
    "SELECT id, jenis, status, catatan, file_path FROM dokumen WHERE pendaftar_id = ?",
    [id]
  );

  return {
    pendaftar: rows[0],
    // path file di server tidak dikirim ke browser, hanya ada/tidaknya + jenis file
    dokumen: dok.map((d) => ({
      id: d.id,
      jenis: d.jenis,
      status: d.status,
      catatan: d.catatan,
      adaFile: Boolean(d.file_path),
      ext: ekstensi(d.file_path),
    })),
  };
}

/* ------------------------------------------------------------------ */
/* Hasil tes TPA                                                       */
/* ------------------------------------------------------------------ */
export async function getTpa() {
  const [rows] = await pool.query(
    `SELECT p.id, p.no_daftar, u.nama, t.nilai,
            ${DT("t.jadwal")} AS jadwal,
            DATE_FORMAT(t.jadwal, '%Y-%m-%dT%H:%i') AS jadwal_input
     FROM pendaftar p
     JOIN users u ON u.id = p.user_id
     LEFT JOIN tes_tpa t ON t.pendaftar_id = p.id
     ORDER BY p.id`
  );

  const data = rows.map((r) => ({
    id: r.id,
    no_daftar: r.no_daftar,
    nama: r.nama,
    jadwal: r.jadwal,
    jadwal_input: r.jadwal_input || "",
    nilai: r.nilai === null || r.nilai === undefined ? null : Number(r.nilai),
  }));

  const dinilai = data.filter((r) => r.nilai !== null);
  const rata =
    dinilai.length > 0
      ? dinilai.reduce((a, r) => a + r.nilai, 0) / dinilai.length
      : null;

  return {
    rows: data,
    stat: {
      terjadwal: data.filter((r) => r.jadwal).length,
      dinilai: dinilai.length,
      rata,
    },
  };
}

/* ------------------------------------------------------------------ */
/* Pembayaran                                                          */
/* ------------------------------------------------------------------ */
export async function getPembayaran() {
  const [rows] = await pool.query(
    `SELECT pb.id, pb.jenis, p.no_daftar, u.nama, pb.nominal, pb.status, pb.catatan,
            ${D("pb.tanggal_bayar")} AS tanggal, pb.bukti_path
     FROM pembayaran pb
     JOIN pendaftar p ON p.id = pb.pendaftar_id
     JOIN users u ON u.id = p.user_id
     ORDER BY (pb.status = 'menunggu') DESC, pb.tanggal_bayar DESC, pb.id DESC`
  );

  const data = rows.map((r) => ({
    id: r.id,
    jenis: r.jenis,
    no_daftar: r.no_daftar,
    nama: r.nama,
    nominal: num(r.nominal),
    status: r.status,
    catatan: r.catatan,
    tanggal: r.tanggal,
    adaBukti: Boolean(r.bukti_path),
    ext: ekstensi(r.bukti_path),
  }));

  return {
    rows: data,
    stat: {
      menunggu: data.filter((r) => r.status === "menunggu").length,
      lunas: data.filter((r) => r.status === "lunas").length,
      total: data
        .filter((r) => r.status === "lunas")
        .reduce((a, r) => a + r.nominal, 0),
    },
  };
}

/* ------------------------------------------------------------------ */
/* Pengumuman                                                          */
/* ------------------------------------------------------------------ */
export async function getPengumuman() {
  const [rows] = await pool.query(
    `SELECT id, judul, isi, status, ${D("created_at")} AS dibuat
     FROM pengumuman ORDER BY created_at DESC, id DESC`
  );
  return rows;
}

export async function getPengumumanTerbaru(batas = 3) {
  const [rows] = await pool.query(
    `SELECT id, judul, ${D("created_at")} AS dibuat
     FROM pengumuman WHERE status = 'terbit'
     ORDER BY created_at DESC, id DESC LIMIT ?`,
    [batas]
  );
  return rows;
}

/* ------------------------------------------------------------------ */
/* Pengaturan & akun admin                                             */
/* ------------------------------------------------------------------ */
export const PENGATURAN_DEFAULT = {
  tahun_ajaran: "",
  periode_buka: "",
  periode_tutup: "",
  biaya_pendaftaran: "0",
  rekening_pembayaran: "",
};

export async function getPengaturan() {
  const [rows] = await pool.query("SELECT kunci, nilai FROM pengaturan");
  const hasil = { ...PENGATURAN_DEFAULT };
  for (const r of rows) {
    if (r.kunci in hasil) hasil[r.kunci] = r.nilai ?? "";
  }
  return hasil;
}

export async function getAkunAdmin(id) {
  const [rows] = await pool.query("SELECT nama, email FROM users WHERE id = ?", [Number(id)]);
  return { nama: rows[0]?.nama ?? "", email: rows[0]?.email ?? "" };
}
