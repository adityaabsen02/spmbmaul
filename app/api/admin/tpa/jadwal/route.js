import pool from "@/lib/db";
import { requireAdminApi } from "@/lib/auth";

// POST /api/admin/tpa/jadwal
// body: { tanggal: "YYYY-MM-DD", jam: "HH:mm", cakupan: "belum" | "semua" }
export async function POST(request) {
  const auth = await requireAdminApi(request);
  if (auth.error) return auth.error;

  try {
    const body = await request.json().catch(() => null);
    if (!body) {
      return Response.json({ message: "Data tidak valid." }, { status: 400 });
    }

    const tanggal = String(body.tanggal || "");
    const jam = String(body.jam || "");
    const cakupan = body.cakupan === "semua" ? "semua" : "belum";

    const mt = /^(\d{4})-(\d{2})-(\d{2})$/.exec(tanggal);
    const mj = /^(\d{2}):(\d{2})$/.exec(jam);
    if (!mt || !mj) {
      return Response.json({ message: "Format tanggal atau jam tidak valid." }, { status: 400 });
    }

    const kalender = new Date(Date.UTC(Number(mt[1]), Number(mt[2]) - 1, Number(mt[3])));
    const tanggalAda =
      kalender.getUTCFullYear() === Number(mt[1]) &&
      kalender.getUTCMonth() === Number(mt[2]) - 1 &&
      kalender.getUTCDate() === Number(mt[3]);

    if (!tanggalAda || Number(mj[1]) > 23 || Number(mj[2]) > 59) {
      return Response.json({ message: "Tanggal atau jam tidak ada di kalender." }, { status: 400 });
    }

    const jadwal = `${tanggal} ${jam}:00`;

    const sql =
      cakupan === "semua"
        ? `INSERT INTO tes_tpa (pendaftar_id, jadwal)
           SELECT id, ? FROM pendaftar
           ON DUPLICATE KEY UPDATE jadwal = VALUES(jadwal)`
        : `INSERT INTO tes_tpa (pendaftar_id, jadwal)
           SELECT p.id, ? FROM pendaftar p
           LEFT JOIN tes_tpa t ON t.pendaftar_id = p.id
           WHERE t.jadwal IS NULL
           ON DUPLICATE KEY UPDATE jadwal = VALUES(jadwal)`;

    await pool.execute(sql, [jadwal]);

    return Response.json({ message: "Jadwal tes diterapkan." });
  } catch (error) {
    console.error("Atur jadwal TPA error:", error);
    return Response.json({ message: "Terjadi kesalahan pada server." }, { status: 500 });
  }
}
