import pool from "@/lib/db";
import { requireSiswaApi } from "@/lib/auth";
import { pastikanPendaftar, getPengaturanSiswa } from "@/lib/siswa-data";
import { simpanBerkas, hapusBerkas, kirimBerkas } from "@/lib/upload";

// GET /api/siswa/bukti -> lihat bukti bayar MILIK SENDIRI
export async function GET(request) {
  const auth = await requireSiswaApi(request);
  if (auth.error) return auth.error;
  try {
    const pid = await pastikanPendaftar(auth.session.sub);
    const [rows] = await pool.execute("SELECT bukti_path FROM pembayaran WHERE pendaftar_id = ? AND jenis = 'pendaftaran'", [pid]);
    return await kirimBerkas(rows[0]?.bukti_path);
  } catch (error) {
    console.error("Baca bukti error:", error);
    return Response.json({ message: "Terjadi kesalahan pada server." }, { status: 500 });
  }
}

// POST /api/siswa/bukti (multipart, field "file") -> unggah bukti transfer
export async function POST(request) {
  const auth = await requireSiswaApi(request);
  if (auth.error) return auth.error;
  try {
    const form = await request.formData().catch(() => null);
    if (!form) return Response.json({ message: "Data tidak valid." }, { status: 400 });

    const pid = await pastikanPendaftar(auth.session.sub);
    const [lama] = await pool.execute("SELECT bukti_path, status FROM pembayaran WHERE pendaftar_id = ? AND jenis = 'pendaftaran'", [pid]);
    if (lama[0]?.status === "lunas") {
      return Response.json({ message: "Pembayaran sudah lunas." }, { status: 409 });
    }

    const hasil = await simpanBerkas(form.get("file"), `bukti/${pid}`, "bukti");
    if (hasil.error) return Response.json({ message: hasil.error }, { status: 400 });

    // Nominal selalu diambil dari pengaturan admin, bukan dari browser.
    const { biaya } = await getPengaturanSiswa();

    await pool.execute(
      `INSERT INTO pembayaran (pendaftar_id, jenis, nominal, tanggal_bayar, bukti_path, status, catatan)
       VALUES (?, 'pendaftaran', ?, CURDATE(), ?, 'menunggu', NULL)
       ON DUPLICATE KEY UPDATE nominal = VALUES(nominal), tanggal_bayar = CURDATE(),
         bukti_path = VALUES(bukti_path), status = 'menunggu', catatan = NULL,
         diproses_oleh = NULL, diproses_at = NULL`,
      [pid, biaya, hasil.path]
    );
    await hapusBerkas(lama[0]?.bukti_path);

    return Response.json({ message: "Bukti pembayaran terkirim. Menunggu konfirmasi admin." });
  } catch (error) {
    console.error("Unggah bukti error:", error);
    return Response.json({ message: "Terjadi kesalahan pada server." }, { status: 500 });
  }
}
