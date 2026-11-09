import { readFile } from "node:fs/promises";
import path from "node:path";
import pool from "@/lib/db";
import { requireAdminApi } from "@/lib/auth";

// Berkas upload disimpan DI LUAR folder public (folder `storage/`),
// sehingga hanya bisa dibuka lewat endpoint ini oleh admin.
const ROOT = path.resolve(process.cwd(), "storage");

const TIPE = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".pdf": "application/pdf",
};

const QUERY = {
  dokumen: "SELECT file_path FROM dokumen WHERE id = ?",
  bukti: "SELECT bukti_path AS file_path FROM pembayaran WHERE id = ?",
};

// GET /api/admin/berkas/dokumen/:id   atau   /api/admin/berkas/bukti/:id
export async function GET(request, { params }) {
  const auth = await requireAdminApi(request);
  if (auth.error) return auth.error;

  try {
    const { jenis, id } = await params;
    const angka = Number(id);

    if (!QUERY[jenis] || !Number.isInteger(angka) || angka <= 0) {
      return Response.json({ message: "Permintaan tidak valid." }, { status: 400 });
    }

    const [rows] = await pool.execute(QUERY[jenis], [angka]);
    const relatif = rows[0]?.file_path;

    if (!relatif) {
      return Response.json({ message: "Berkas tidak ditemukan." }, { status: 404 });
    }

    const lengkap = path.resolve(ROOT, relatif);

    // Cegah path traversal (../) keluar dari folder storage.
    if (!lengkap.startsWith(ROOT + path.sep)) {
      return Response.json({ message: "Lokasi berkas tidak valid." }, { status: 400 });
    }

    const tipe = TIPE[path.extname(lengkap).toLowerCase()];
    if (!tipe) {
      return Response.json({ message: "Jenis berkas tidak didukung." }, { status: 415 });
    }

    let isi;
    try {
      isi = await readFile(lengkap);
    } catch {
      return Response.json({ message: "Berkas tidak ada di server." }, { status: 404 });
    }

    return new Response(isi, {
      headers: {
        "Content-Type": tipe,
        "Content-Disposition": "inline",
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("Baca berkas error:", error);
    return Response.json({ message: "Terjadi kesalahan pada server." }, { status: 500 });
  }
}
