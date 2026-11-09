import pool from "@/lib/db";
import { requireKepsekApi } from "@/lib/auth";
import { getKandidat, getKuotaProgram } from "@/lib/kepsek-data";

// POST /api/kepsek/keputusan   body: { ids: [pendaftarId...], aksi: "setujui" | "tolak" }
export async function POST(request) {
  const auth = await requireKepsekApi(request);
  if (auth.error) return auth.error;

  try {
    const body = await request.json().catch(() => null);
    const aksi = body?.aksi;
    const ids = Array.isArray(body?.ids) ? [...new Set(body.ids.map(Number))] : [];

    if (!["setujui", "tolak"].includes(aksi)) {
      return Response.json({ message: "Aksi tidak dikenali." }, { status: 400 });
    }
    if (ids.length === 0 || ids.length > 200 || ids.some((n) => !Number.isInteger(n) || n <= 0)) {
      return Response.json({ message: "Pilih minimal satu siswa." }, { status: 400 });
    }

    // Hanya calon yang memenuhi syarat yang boleh diputuskan.
    const kandidat = await getKandidat();
    const peta = new Map(kandidat.map((k) => [k.id, k]));
    const dipilih = ids.map((id) => peta.get(id));
    if (dipilih.some((k) => !k)) {
      return Response.json({ message: "Ada siswa yang belum memenuhi syarat untuk diputuskan." }, { status: 400 });
    }

    if (aksi === "setujui") {
      if (dipilih.some((k) => !k.jurusan_id)) {
        return Response.json({ message: "Ada siswa yang belum memilih program keahlian." }, { status: 400 });
      }
      // Jangan melebihi kuota program.
      const program = await getKuotaProgram();
      const tambah = {};
      for (const k of dipilih) if (k.keputusan !== "disetujui") tambah[k.jurusan_id] = (tambah[k.jurusan_id] || 0) + 1;
      for (const pr of program) {
        const n = tambah[pr.id] || 0;
        if (n > 0 && pr.diterima + n > pr.kuota) {
          return Response.json(
            { message: `Kuota ${pr.nama} tidak cukup (sisa ${pr.sisa}, dipilih ${n}).` },
            { status: 409 }
          );
        }
      }
    }

    const marks = ids.map(() => "?").join(",");
    await pool.execute(
      `UPDATE pendaftar SET keputusan = ?, keputusan_oleh = ?, keputusan_at = NOW() WHERE id IN (${marks})`,
      [aksi === "setujui" ? "disetujui" : "ditolak", Number(auth.session.sub), ...ids]
    );

    return Response.json({
      message: aksi === "setujui" ? `${ids.length} siswa disetujui.` : `${ids.length} siswa ditolak.`,
    });
  } catch (error) {
    console.error("Keputusan kepsek error:", error);
    return Response.json({ message: "Terjadi kesalahan pada server." }, { status: 500 });
  }
}
