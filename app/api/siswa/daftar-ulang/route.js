import pool from "@/lib/db";
import { requireSiswaApi } from "@/lib/auth";
import { getSiswa } from "@/lib/siswa-data";
import { UKURAN_BAJU, UKURAN_CELANA, UKURAN_SEPATU } from "@/lib/siswa-konst";

// PUT /api/siswa/daftar-ulang
// body: { ukuran_baju, ukuran_celana, ukuran_sepatu, telepon_wali, setuju, draft }
// draft = true -> simpan sebagian (tanpa validasi lengkap); draft = false -> kirim final.
async function simpan(request) {
  const auth = await requireSiswaApi(request);
  if (auth.error) return auth.error;
  try {
    const s = await getSiswa(auth.session.sub);
    if (s.hasil !== "lulus") {
      return Response.json({ message: "Daftar ulang hanya untuk peserta yang dinyatakan diterima." }, { status: 403 });
    }
    if (s.daftarUlang?.status === "terkirim") {
      return Response.json({ message: "Formulir daftar ulang sudah terkirim." }, { status: 409 });
    }

    const b = await request.json().catch(() => null);
    if (!b || typeof b !== "object") return Response.json({ message: "Data tidak valid." }, { status: 400 });
    const draft = b.draft === true;

    const baju = b.ukuran_baju || null;
    const celana = b.ukuran_celana || null;
    const sepatu = b.ukuran_sepatu || null;
    const telp = typeof b.telepon_wali === "string" ? b.telepon_wali.trim().slice(0, 20) : "";

    if (baju && !UKURAN_BAJU.includes(baju)) return Response.json({ message: "Ukuran baju tidak valid." }, { status: 400 });
    if (celana && !UKURAN_CELANA.includes(celana)) return Response.json({ message: "Ukuran celana / rok tidak valid." }, { status: 400 });
    if (sepatu && !UKURAN_SEPATU.includes(sepatu)) return Response.json({ message: "Ukuran sepatu tidak valid." }, { status: 400 });
    if (telp && !/^[0-9+\-\s]{8,20}$/.test(telp)) return Response.json({ message: "Nomor HP orang tua / wali tidak valid." }, { status: 400 });

    if (!draft) {
      if (!baju) return Response.json({ message: "Pilih ukuran baju seragam." }, { status: 400 });
      if (!celana) return Response.json({ message: "Pilih ukuran celana / rok." }, { status: 400 });
      if (!sepatu) return Response.json({ message: "Pilih ukuran sepatu." }, { status: 400 });
      if (!telp) return Response.json({ message: "Nomor HP orang tua / wali wajib diisi." }, { status: 400 });
      if (b.setuju !== true) return Response.json({ message: "Centang pernyataan kesediaan mengikuti tata tertib." }, { status: 400 });
    }

    await pool.execute(
      `INSERT INTO daftar_ulang (pendaftar_id, ukuran_baju, ukuran_celana, ukuran_sepatu, telepon_wali, setuju, status)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE ukuran_baju = VALUES(ukuran_baju), ukuran_celana = VALUES(ukuran_celana),
         ukuran_sepatu = VALUES(ukuran_sepatu), telepon_wali = VALUES(telepon_wali),
         setuju = VALUES(setuju), status = VALUES(status)`,
      [s.id, baju, celana, sepatu, telp || null, b.setuju === true ? 1 : 0, draft ? "draft" : "terkirim"]
    );
    return Response.json({ message: draft ? "Draft tersimpan." : "Formulir daftar ulang terkirim." });
  } catch (error) {
    console.error("Daftar ulang error:", error);
    return Response.json({ message: "Terjadi kesalahan pada server." }, { status: 500 });
  }
}

export const PUT = simpan;
export const POST = simpan;
