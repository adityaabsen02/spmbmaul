import pool from "@/lib/db";
import { requireSiswaApi } from "@/lib/auth";
import { pastikanPendaftar, DURASI_TPA_MENIT } from "@/lib/siswa-data";

// PUT /api/siswa/tes/jawab  body: { soal_id, jawaban: "A".."D" }  (tersimpan otomatis)
export async function PUT(request) {
  const auth = await requireSiswaApi(request);
  if (auth.error) return auth.error;
  try {
    const b = await request.json().catch(() => null);
    const soalId = Number(b?.soal_id);
    const jawaban = typeof b?.jawaban === "string" ? b.jawaban.toUpperCase() : "";
    if (!Number.isInteger(soalId) || soalId <= 0 || !/^[A-D]$/.test(jawaban)) {
      return Response.json({ message: "Jawaban tidak valid." }, { status: 400 });
    }

    const pid = await pastikanPendaftar(auth.session.sub);
    const [sesi] = await pool.execute(
      "SELECT selesai_at, TIMESTAMPDIFF(SECOND, mulai_at, NOW()) AS detik FROM tpa_sesi WHERE pendaftar_id = ?",
      [pid]
    );
    if (!sesi[0] || sesi[0].selesai_at) {
      return Response.json({ message: "Tes tidak sedang berjalan." }, { status: 403 });
    }
    // toleransi 30 detik untuk jawaban terakhir yang sedang dikirim
    if (Number(sesi[0].detik) > DURASI_TPA_MENIT * 60 + 30) {
      return Response.json({ message: "Waktu tes sudah habis." }, { status: 403 });
    }

    const [soal] = await pool.execute("SELECT id FROM tpa_soal WHERE id = ?", [soalId]);
    if (!soal[0]) return Response.json({ message: "Soal tidak ditemukan." }, { status: 404 });

    await pool.execute(
      `INSERT INTO tpa_jawaban (pendaftar_id, soal_id, jawaban) VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE jawaban = VALUES(jawaban)`,
      [pid, soalId, jawaban]
    );
    return Response.json({ message: "Tersimpan." });
  } catch (error) {
    console.error("Simpan jawaban error:", error);
    return Response.json({ message: "Terjadi kesalahan pada server." }, { status: 500 });
  }
}
