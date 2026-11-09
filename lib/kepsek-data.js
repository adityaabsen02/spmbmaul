// Query database untuk area Kepala Sekolah (hanya dipakai di server).
import pool from "@/lib/db";

const num = (v) => Number(v ?? 0);

// Calon yang LAYAK diputuskan: semua berkas wajib terverifikasi, pembayaran lunas, nilai TPA ada.
const SQL_KANDIDAT = `
  SELECT p.id, p.no_daftar, u.nama, p.jurusan_id, j.nama AS program, t.nilai, p.keputusan
  FROM pendaftar p
  JOIN users u ON u.id = p.user_id
  JOIN tes_tpa t ON t.pendaftar_id = p.id AND t.nilai IS NOT NULL
  JOIN pembayaran pb ON pb.pendaftar_id = p.id AND pb.jenis = 'pendaftaran' AND pb.status = 'lunas'
  LEFT JOIN jurusan j ON j.id = p.jurusan_id
  WHERE (SELECT COUNT(*) FROM dokumen d
         WHERE d.pendaftar_id = p.id AND d.status = 'terverifikasi' AND d.jenis <> 'sertifikat') >= 5
  ORDER BY t.nilai DESC, u.nama ASC`;

export async function getKandidat() {
  const [rows] = await pool.query(SQL_KANDIDAT);
  return rows.map((r, i) => ({
    id: r.id,
    peringkat: i + 1,
    no_daftar: r.no_daftar,
    nama: r.nama,
    jurusan_id: r.jurusan_id,
    program: r.program || "-",
    nilai: num(r.nilai),
    keputusan: r.keputusan,
  }));
}

export async function getKuotaProgram() {
  const [rows] = await pool.query(
    `SELECT j.id, j.kode, j.nama, j.kuota,
            (SELECT COUNT(*) FROM pendaftar p WHERE p.jurusan_id = j.id) AS pendaftar,
            (SELECT COUNT(*) FROM pendaftar p WHERE p.jurusan_id = j.id AND p.keputusan = 'disetujui') AS diterima
     FROM jurusan j ORDER BY j.nama`
  );
  return rows.map((r) => ({
    id: r.id,
    kode: r.kode,
    nama: r.nama,
    kuota: num(r.kuota),
    pendaftar: num(r.pendaftar),
    diterima: num(r.diterima),
    sisa: Math.max(0, num(r.kuota) - num(r.diterima)),
  }));
}

async function getPengaturanKepsek() {
  const [rows] = await pool.query("SELECT kunci, nilai FROM pengaturan");
  const p = Object.fromEntries(rows.map((r) => [r.kunci, r.nilai]));
  return { tgl_pengumuman: p.tanggal_pengumuman_hasil || "20 Oktober 2026", tahun_ajaran: p.tahun_ajaran || "" };
}

export async function getDashboardKepsek() {
  const [kandidat, program, [[tot]], set] = await Promise.all([
    getKandidat(),
    getKuotaProgram(),
    pool.query("SELECT COUNT(*) AS n FROM pendaftar"),
    getPengaturanKepsek(),
  ]);
  const kuotaTotal = program.reduce((a, x) => a + x.kuota, 0);
  const diterima = program.reduce((a, x) => a + x.diterima, 0);
  return {
    totalPendaftar: num(tot.n),
    lulusSeleksi: kandidat.length,
    menunggu: kandidat.filter((k) => k.keputusan === "menunggu").length,
    persenKuota: kuotaTotal > 0 ? Math.round((diterima / kuotaTotal) * 100) : 0,
    program,
    tglPengumuman: set.tgl_pengumuman,
  };
}

export async function getLaporan() {
  const [program, [[tot]], [[dit]], set] = await Promise.all([
    getKuotaProgram(),
    pool.query("SELECT COUNT(*) AS n FROM pendaftar"),
    pool.query("SELECT COUNT(*) AS n FROM pendaftar WHERE keputusan = 'ditolak'"),
    getPengaturanKepsek(),
  ]);
  return {
    total: num(tot.n),
    diterima: program.reduce((a, x) => a + x.diterima, 0),
    ditolak: num(dit.n),
    program,
    tahunAjaran: set.tahun_ajaran,
  };
}
