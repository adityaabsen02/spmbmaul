import pool from "@/lib/db";
import { requireSiswaApi } from "@/lib/auth";
import { pastikanPendaftar, jumlahSoalTpa } from "@/lib/siswa-data";

// POST /api/siswa/tes/selesai -> kumpulkan jawaban; nilai dihitung di server.
export async function POST(request) {
  const auth = await requireSiswaApi(request);
  if (auth.error) return auth.error;
  try {
    const pid = await pastikanPendaftar(auth.session.sub);
    const [sesi] = await pool.execute("SELECT selesai_at FROM tpa_sesi WHERE pendaftar_id = ?", [pid]);
    if (!sesi[0]) return Response.json({ message: "Tes belum dimulai." }, { status: 403 });
    if (sesi[0].selesai_at) return Response.json({ message: "Tes sudah dikumpulkan." }, { status: 409 });

    const [r] = await pool.execute(
      `SELECT COUNT(*) AS benar FROM tpa_jawaban j
       JOIN tpa_soal s ON s.id = j.soal_id AND s.kunci = j.jawaban
       WHERE j.pendaftar_id = ?`,
      [pid]
    );
    const total = await jumlahSoalTpa();
    const nilai = total > 0 ? Math.round((Number(r[0].benar) / total) * 10000) / 100 : 0;

    await pool.execute("UPDATE tpa_sesi SET selesai_at = NOW() WHERE pendaftar_id = ?", [pid]);
    await pool.execute(
      "INSERT INTO tes_tpa (pendaftar_id, nilai) VALUES (?, ?) ON DUPLICATE KEY UPDATE nilai = VALUES(nilai)",
      [pid, nilai]
    );
    return Response.json({ message: "Jawaban terkumpul.", nilai });
  } catch (error) {
    console.error("Kumpulkan tes error:", error);
    return Response.json({ message: "Terjadi kesalahan pada server." }, { status: 500 });
  }
}
