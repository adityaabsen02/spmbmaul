import pool from "@/lib/db";
import { requireAdminApi } from "@/lib/auth";

// POST /api/admin/pengumuman   body: { judul, isi, status: "draf" | "terbit" }
export async function POST(request) {
  const auth = await requireAdminApi(request);
  if (auth.error) return auth.error;

  try {
    const body = await request.json().catch(() => null);
    if (!body) {
      return Response.json({ message: "Data tidak valid." }, { status: 400 });
    }

    const judul = typeof body.judul === "string" ? body.judul.trim() : "";
    const isi = typeof body.isi === "string" ? body.isi.trim() : "";
    const status = body.status === "terbit" ? "terbit" : "draf";

    if (!judul || !isi) {
      return Response.json({ message: "Judul dan isi wajib diisi." }, { status: 400 });
    }
    if (judul.length > 150) {
      return Response.json({ message: "Judul maksimal 150 karakter." }, { status: 400 });
    }
    if (isi.length > 5000) {
      return Response.json({ message: "Isi maksimal 5000 karakter." }, { status: 400 });
    }

    await pool.execute(
      "INSERT INTO pengumuman (judul, isi, status, dibuat_oleh) VALUES (?, ?, ?, ?)",
      [judul, isi, status, Number(auth.session.sub)]
    );

    return Response.json(
      { message: status === "terbit" ? "Pengumuman diterbitkan." : "Draf tersimpan." },
      { status: 201 }
    );
  } catch (error) {
    console.error("Buat pengumuman error:", error);
    return Response.json({ message: "Terjadi kesalahan pada server." }, { status: 500 });
  }
}
