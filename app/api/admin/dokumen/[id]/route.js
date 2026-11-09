import pool from "@/lib/db";
import { requireAdminApi } from "@/lib/auth";

// POST /api/admin/dokumen/:id   body: { aksi: "verifikasi" | "tolak", catatan }
export async function POST(request, { params }) {
  const auth = await requireAdminApi(request);
  if (auth.error) return auth.error;

  try {
    const { id } = await params;
    const dokumenId = Number(id);

    if (!Number.isInteger(dokumenId) || dokumenId <= 0) {
      return Response.json({ message: "ID dokumen tidak valid." }, { status: 400 });
    }

    const body = await request.json().catch(() => null);
    if (!body) {
      return Response.json({ message: "Data tidak valid." }, { status: 400 });
    }

    const catatan =
      typeof body.catatan === "string" ? body.catatan.trim().slice(0, 255) : "";

    let status;
    if (body.aksi === "verifikasi") {
      status = "terverifikasi";
    } else if (body.aksi === "tolak") {
      if (!catatan) {
        return Response.json(
          { message: "Catatan wajib diisi saat menolak dokumen." },
          { status: 400 }
        );
      }
      status = "ditolak";
    } else {
      return Response.json({ message: "Aksi tidak dikenali." }, { status: 400 });
    }

    const [hasil] = await pool.execute(
      `UPDATE dokumen
       SET status = ?, catatan = ?, diverifikasi_oleh = ?, diverifikasi_at = NOW()
       WHERE id = ?`,
      [status, catatan || null, Number(auth.session.sub), dokumenId]
    );

    if (hasil.affectedRows === 0) {
      return Response.json({ message: "Dokumen tidak ditemukan." }, { status: 404 });
    }

    return Response.json({ message: "Dokumen diperbarui.", status });
  } catch (error) {
    console.error("Verifikasi dokumen error:", error);
    return Response.json({ message: "Terjadi kesalahan pada server." }, { status: 500 });
  }
}
