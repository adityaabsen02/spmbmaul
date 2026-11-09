import pool from "@/lib/db";
import { requireSiswaApi } from "@/lib/auth";
import { pastikanPendaftar } from "@/lib/siswa-data";
import { simpanBerkas, hapusBerkas, kirimBerkas } from "@/lib/upload";

const JENIS = ["ijazah", "kartu_keluarga", "akta_lahir", "pas_foto", "rapor", "sertifikat"];

// GET /api/siswa/berkas/:jenis  -> lihat berkas MILIK SENDIRI
export async function GET(request, { params }) {
  const auth = await requireSiswaApi(request);
  if (auth.error) return auth.error;
  try {
    const { jenis } = await params;
    if (!JENIS.includes(jenis)) return Response.json({ message: "Permintaan tidak valid." }, { status: 400 });
    const pid = await pastikanPendaftar(auth.session.sub);
    const [rows] = await pool.execute("SELECT file_path FROM dokumen WHERE pendaftar_id = ? AND jenis = ?", [pid, jenis]);
    return await kirimBerkas(rows[0]?.file_path);
  } catch (error) {
    console.error("Baca berkas siswa error:", error);
    return Response.json({ message: "Terjadi kesalahan pada server." }, { status: 500 });
  }
}

// POST /api/siswa/berkas/:jenis  (multipart, field "file")
export async function POST(request, { params }) {
  const auth = await requireSiswaApi(request);
  if (auth.error) return auth.error;
  try {
    const { jenis } = await params;
    if (!JENIS.includes(jenis)) return Response.json({ message: "Permintaan tidak valid." }, { status: 400 });

    const form = await request.formData().catch(() => null);
    if (!form) return Response.json({ message: "Data tidak valid." }, { status: 400 });

    const pid = await pastikanPendaftar(auth.session.sub);
    const [lama] = await pool.execute("SELECT file_path FROM dokumen WHERE pendaftar_id = ? AND jenis = ?", [pid, jenis]);
    const hasil = await simpanBerkas(form.get("file"), `dokumen/${pid}`, jenis);
    if (hasil.error) return Response.json({ message: hasil.error }, { status: 400 });

    await pool.execute(
      `INSERT INTO dokumen (pendaftar_id, jenis, file_path, status, catatan)
       VALUES (?, ?, ?, 'menunggu', NULL)
       ON DUPLICATE KEY UPDATE file_path = VALUES(file_path), status = 'menunggu', catatan = NULL,
                               diverifikasi_oleh = NULL, diverifikasi_at = NULL`,
      [pid, jenis, hasil.path]
    );
    await hapusBerkas(lama[0]?.file_path);

    return Response.json({ message: "Berkas terunggah. Menunggu verifikasi admin." });
  } catch (error) {
    console.error("Unggah berkas error:", error);
    return Response.json({ message: "Terjadi kesalahan pada server." }, { status: 500 });
  }
}
