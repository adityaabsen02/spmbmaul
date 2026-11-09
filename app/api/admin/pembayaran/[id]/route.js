import pool from "@/lib/db";
import { requireAdminApi } from "@/lib/auth";

// POST /api/admin/pembayaran/:id   body: { aksi: "konfirmasi" | "tolak", catatan }
export async function POST(request, { params }) {
  const auth = await requireAdminApi(request);
  if (auth.error) return auth.error;

  try {
    const { id } = await params;
    const pembayaranId = Number(id);

    if (!Number.isInteger(pembayaranId) || pembayaranId <= 0) {
      return Response.json({ message: "ID pembayaran tidak valid." }, { status: 400 });
    }

    const body = await request.json().catch(() => null);
    if (!body) {
      return Response.json({ message: "Data tidak valid." }, { status: 400 });
    }

    const catatan =
      typeof body.catatan === "string" ? body.catatan.trim().slice(0, 255) : "";

    let status;
    if (body.aksi === "konfirmasi") {
      status = "lunas";
    } else if (body.aksi === "tolak") {
      if (!catatan) {
        return Response.json(
          { message: "Catatan wajib diisi saat menolak pembayaran." },
          { status: 400 }
        );
      }
      status = "ditolak";
    } else {
      return Response.json({ message: "Aksi tidak dikenali." }, { status: 400 });
    }

    const [hasil] = await pool.execute(
      `UPDATE pembayaran
       SET status = ?, catatan = ?, diproses_oleh = ?, diproses_at = NOW()
       WHERE id = ?`,
      [status, catatan || null, Number(auth.session.sub), pembayaranId]
    );

    if (hasil.affectedRows === 0) {
      return Response.json({ message: "Pembayaran tidak ditemukan." }, { status: 404 });
    }

    return Response.json({ message: "Pembayaran diperbarui.", status });
  } catch (error) {
    console.error("Konfirmasi pembayaran error:", error);
    return Response.json({ message: "Terjadi kesalahan pada server." }, { status: 500 });
  }
}
