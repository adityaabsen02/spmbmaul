import pool from "@/lib/db";
import { requireSiswaApi } from "@/lib/auth";
import { getSiswa, getPengaturanSiswa } from "@/lib/siswa-data";
import { simpanBerkas, hapusBerkas, kirimBerkas } from "@/lib/upload";

// GET /api/siswa/bukti-du -> lihat bukti bayar daftar ulang MILIK SENDIRI
export async function GET(request) {
  const auth = await requireSiswaApi(request);
  if (auth.error) return auth.error;
  try {
    const s = await getSiswa(auth.session.sub);
    const [rows] = await pool.execute(
      "SELECT bukti_path FROM pembayaran WHERE pendaftar_id = ? AND jenis = 'daftar_ulang'",
      [s.id]
    );
    return await kirimBerkas(rows[0]?.bukti_path);
  } catch (error) {
    console.error("Baca bukti daftar ulang error:", error);
    return Response.json({ message: "Terjadi kesalahan pada server." }, { status: 500 });
  }
}

// POST /api/siswa/bukti-du (multipart, field "file") -> unggah bukti bayar daftar ulang
export async function POST(request) {
  const auth = await requireSiswaApi(request);
  if (auth.error) return auth.error;
  try {
    const s = await getSiswa(auth.session.sub);
    if (s.hasil !== "lulus") {
      return Response.json({ message: "Pembayaran daftar ulang hanya untuk peserta yang dinyatakan diterima." }, { status: 403 });
    }

    const form = await request.formData().catch(() => null);
    if (!form) return Response.json({ message: "Data tidak valid." }, { status: 400 });

    const [lama] = await pool.execute(
      "SELECT bukti_path, status FROM pembayaran WHERE pendaftar_id = ? AND jenis = 'daftar_ulang'",
      [s.id]
    );
    if (lama[0]?.status === "lunas") {
      return Response.json({ message: "Pembayaran daftar ulang sudah lunas." }, { status: 409 });
    }

    const hasil = await simpanBerkas(form.get("file"), `bukti/${s.id}`, "bukti-du");
    if (hasil.error) return Response.json({ message: hasil.error }, { status: 400 });

    // Nominal selalu dari pengaturan admin, bukan dari browser.
    const { biaya_du } = await getPengaturanSiswa();

    await pool.execute(
      `INSERT INTO pembayaran (pendaftar_id, jenis, nominal, tanggal_bayar, bukti_path, status, catatan)
       VALUES (?, 'daftar_ulang', ?, CURDATE(), ?, 'menunggu', NULL)
       ON DUPLICATE KEY UPDATE nominal = VALUES(nominal), tanggal_bayar = CURDATE(),
         bukti_path = VALUES(bukti_path), status = 'menunggu', catatan = NULL,
         diproses_oleh = NULL, diproses_at = NULL`,
      [s.id, biaya_du, hasil.path]
    );
    await hapusBerkas(lama[0]?.bukti_path);

    return Response.json({ message: "Bukti pembayaran daftar ulang terkirim. Menunggu konfirmasi admin." });
  } catch (error) {
    console.error("Unggah bukti daftar ulang error:", error);
    return Response.json({ message: "Terjadi kesalahan pada server." }, { status: 500 });
  }
}
