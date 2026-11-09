import pool from "@/lib/db";
import { requireKepsekApi } from "@/lib/auth";
import { getLaporan } from "@/lib/kepsek-data";
import { buatXlsx } from "@/lib/xlsx";

// GET /api/kepsek/laporan -> unduh laporan-penerimaan.xlsx
export async function GET(request) {
  const auth = await requireKepsekApi(request);
  if (auth.error) return auth.error;

  try {
    const lap = await getLaporan();
    const [diterima] = await pool.query(
      `SELECT p.no_daftar, u.nama, j.nama AS program, t.nilai
       FROM pendaftar p JOIN users u ON u.id = p.user_id
       LEFT JOIN jurusan j ON j.id = p.jurusan_id
       LEFT JOIN tes_tpa t ON t.pendaftar_id = p.id
       WHERE p.keputusan = 'disetujui' ORDER BY j.nama, t.nilai DESC, u.nama`
    );

    const B = (v) => ({ v, b: true });
    const baris = [
      [B("Laporan Penerimaan SPMB SMK Citra Negara"), `Tahun ajaran ${lap.tahunAjaran || "-"}`],
      ["Total pendaftar", lap.total],
      ["Diterima", lap.diterima],
      ["Ditolak", lap.ditolak],
      [],
      ["Program Keahlian", "Kuota", "Pendaftar", "Diterima", "Sisa Kuota"].map(B),
      ...lap.program.map((p) => [p.nama, p.kuota, p.pendaftar, p.diterima, p.sisa]),
      [],
      [B("Daftar siswa diterima")],
      ["No. Daftar", "Nama", "Program", "Nilai TPA"].map(B),
      ...diterima.map((r) => [r.no_daftar, r.nama, r.program || "", r.nilai === null || r.nilai === undefined ? "" : Number(r.nilai)]),
    ];

    const berkas = buatXlsx({ nama: "Laporan", lebar: [38, 22, 32, 12, 12], baris });
    return new Response(berkas, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": 'attachment; filename="laporan-penerimaan.xlsx"',
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    console.error("Ekspor laporan error:", error);
    return Response.json({ message: "Terjadi kesalahan pada server." }, { status: 500 });
  }
}
