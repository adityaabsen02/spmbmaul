import pool from "@/lib/db";
import { requireAdminApi } from "@/lib/auth";

async function ambilId(params) {
  const { id } = await params;
  const angka = Number(id);
  return Number.isInteger(angka) && angka > 0 ? angka : null;
}

// PATCH /api/admin/pengumuman/:id   body: { status: "draf" | "terbit" }
export async function PATCH(request, { params }) {
  const auth = await requireAdminApi(request);
  if (auth.error) return auth.error;

  try {
    const id = await ambilId(params);
    if (!id) {
      return Response.json({ message: "ID tidak valid." }, { status: 400 });
    }

    const body = await request.json().catch(() => null);
    if (!body || !["draf", "terbit"].includes(body.status)) {
      return Response.json({ message: "Status tidak valid." }, { status: 400 });
    }

    const [hasil] = await pool.execute(
      "UPDATE pengumuman SET status = ? WHERE id = ?",
      [body.status, id]
    );

    if (hasil.affectedRows === 0) {
      return Response.json({ message: "Pengumuman tidak ditemukan." }, { status: 404 });
    }

    return Response.json({ message: "Status pengumuman diperbarui." });
  } catch (error) {
    console.error("Ubah pengumuman error:", error);
    return Response.json({ message: "Terjadi kesalahan pada server." }, { status: 500 });
  }
}

// DELETE /api/admin/pengumuman/:id
export async function DELETE(request, { params }) {
  const auth = await requireAdminApi(request);
  if (auth.error) return auth.error;

  try {
    const id = await ambilId(params);
    if (!id) {
      return Response.json({ message: "ID tidak valid." }, { status: 400 });
    }

    const [hasil] = await pool.execute("DELETE FROM pengumuman WHERE id = ?", [id]);

    if (hasil.affectedRows === 0) {
      return Response.json({ message: "Pengumuman tidak ditemukan." }, { status: 404 });
    }

    return Response.json({ message: "Pengumuman dihapus." });
  } catch (error) {
    console.error("Hapus pengumuman error:", error);
    return Response.json({ message: "Terjadi kesalahan pada server." }, { status: 500 });
  }
}
