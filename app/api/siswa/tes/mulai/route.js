import pool from "@/lib/db";
import { requireSiswaApi } from "@/lib/auth";
import { getSiswa, cekBolehMulaiTes, DURASI_TPA_MENIT } from "@/lib/siswa-data";

// POST /api/siswa/tes/mulai -> mulai (atau lanjutkan) tes. Waktu dihitung di server.
export async function POST(request) {
  const auth = await requireSiswaApi(request);
  if (auth.error) return auth.error;
  try {
    const s = await getSiswa(auth.session.sub);

    // Sesi yang masih berjalan boleh dilanjutkan (misalnya setelah refresh).
    if (s.tes.mulai && !s.tes.selesai) {
      const [r] = await pool.execute(
        "SELECT TIMESTAMPDIFF(SECOND, mulai_at, NOW()) AS detik FROM tpa_sesi WHERE pendaftar_id = ?",
        [s.id]
      );
      if (Number(r[0].detik) < DURASI_TPA_MENIT * 60) return Response.json({ message: "Tes dilanjutkan." });
    }

    const cek = await cekBolehMulaiTes(s);
    if (!cek.ok) return Response.json({ message: cek.pesan }, { status: 403 });

    await pool.execute(
      "INSERT INTO tpa_sesi (pendaftar_id, mulai_at) VALUES (?, NOW()) ON DUPLICATE KEY UPDATE mulai_at = mulai_at",
      [s.id]
    );
    return Response.json({ message: "Tes dimulai." });
  } catch (error) {
    console.error("Mulai tes error:", error);
    return Response.json({ message: "Terjadi kesalahan pada server." }, { status: 500 });
  }
}
