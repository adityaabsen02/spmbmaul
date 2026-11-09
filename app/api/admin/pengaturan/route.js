import pool from "@/lib/db";
import { SignJWT } from "jose";
import { requireAdminApi } from "@/lib/auth";

const TANGGAL = /^\d{4}-\d{2}-\d{2}$/;

// PUT /api/admin/pengaturan
// body: { periode_buka, periode_tutup, tahun_ajaran, biaya_pendaftaran,
//         rekening_pembayaran, kuota: {idJurusan: jumlah}, akun: {nama, email} }
export async function PUT(request) {
  const auth = await requireAdminApi(request);
  if (auth.error) return auth.error;

  let koneksi;

  try {
    const body = await request.json().catch(() => null);
    if (!body) {
      return Response.json({ message: "Data tidak valid." }, { status: 400 });
    }

    const teks = (v, maks) => (typeof v === "string" ? v.trim().slice(0, maks) : "");

    const periodeBuka = teks(body.periode_buka, 10);
    const periodeTutup = teks(body.periode_tutup, 10);
    const tahunAjaran = teks(body.tahun_ajaran, 20);
    const rekening = teks(body.rekening_pembayaran, 150);
    const biaya = Number(body.biaya_pendaftaran);

    if ((periodeBuka && !TANGGAL.test(periodeBuka)) || (periodeTutup && !TANGGAL.test(periodeTutup))) {
      return Response.json({ message: "Format tanggal tidak valid." }, { status: 400 });
    }
    if (periodeBuka && periodeTutup && periodeTutup < periodeBuka) {
      return Response.json(
        { message: "Tanggal tutup tidak boleh sebelum tanggal buka." },
        { status: 400 }
      );
    }
    if (!tahunAjaran) {
      return Response.json({ message: "Tahun ajaran wajib diisi." }, { status: 400 });
    }
    if (!Number.isInteger(biaya) || biaya < 0 || biaya > 100000000) {
      return Response.json(
        { message: "Biaya pendaftaran harus berupa angka bulat 0 atau lebih." },
        { status: 400 }
      );
    }

    // --- Akun admin (nama + email milik admin yang sedang login)
    const namaAdmin = teks(body.akun?.nama, 100);
    const emailAdmin = teks(body.akun?.email, 150).toLowerCase();

    if (!namaAdmin) {
      return Response.json({ message: "Nama admin wajib diisi." }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailAdmin)) {
      return Response.json({ message: "Format email tidak valid." }, { status: 400 });
    }

    const idAdmin = Number(auth.session.sub);

    const [dipakai] = await pool.execute(
      "SELECT id FROM users WHERE email = ? AND id <> ?",
      [emailAdmin, idAdmin]
    );
    if (dipakai.length > 0) {
      return Response.json({ message: "Email sudah dipakai akun lain." }, { status: 409 });
    }

    // --- Kuota per program
    const kuota = {};
    for (const [id, nilai] of Object.entries(body.kuota || {})) {
      const idJurusan = Number(id);
      const jumlah = Number(nilai);
      if (
        !Number.isInteger(idJurusan) ||
        idJurusan <= 0 ||
        !Number.isInteger(jumlah) ||
        jumlah < 0 ||
        jumlah > 9999
      ) {
        return Response.json(
          { message: "Kuota harus berupa angka bulat 0 sampai 9999." },
          { status: 400 }
        );
      }
      kuota[idJurusan] = jumlah;
    }

    const data = {
      periode_buka: periodeBuka,
      periode_tutup: periodeTutup,
      tahun_ajaran: tahunAjaran,
      biaya_pendaftaran: String(biaya),
      rekening_pembayaran: rekening,
    };

    koneksi = await pool.getConnection();
    await koneksi.beginTransaction();

    for (const [kunci, nilai] of Object.entries(data)) {
      await koneksi.execute(
        `INSERT INTO pengaturan (kunci, nilai) VALUES (?, ?)
         ON DUPLICATE KEY UPDATE nilai = VALUES(nilai)`,
        [kunci, nilai]
      );
    }

    for (const [id, jumlah] of Object.entries(kuota)) {
      await koneksi.execute("UPDATE jurusan SET kuota = ? WHERE id = ?", [jumlah, Number(id)]);
    }

    await koneksi.execute(
      "UPDATE users SET nama = ?, email = ? WHERE id = ? AND role = 'admin'",
      [namaAdmin, emailAdmin, idAdmin]
    );

    await koneksi.commit();

    const respons = Response.json({ message: "Perubahan tersimpan." });

    // Nama di sesi (cookie) ikut diperbarui supaya topbar langsung berganti.
    const secret = process.env.SESSION_SECRET;
    if (secret && secret.length >= 32 && namaAdmin !== auth.session.nama) {
      const token = await new SignJWT({ nama: namaAdmin, role: "admin" })
        .setProtectedHeader({ alg: "HS256" })
        .setSubject(String(idAdmin))
        .setIssuedAt()
        .setExpirationTime("8h")
        .sign(new TextEncoder().encode(secret));

      const cookie = [`spmb_session=${token}`, "HttpOnly", "Path=/", "SameSite=Lax", "Max-Age=28800"];
      if (process.env.NODE_ENV === "production") cookie.push("Secure");
      respons.headers.append("Set-Cookie", cookie.join("; "));
    }

    return respons;
  } catch (error) {
    if (koneksi) await koneksi.rollback().catch(() => {});
    if (error.code === "ER_DUP_ENTRY") {
      return Response.json({ message: "Email sudah dipakai akun lain." }, { status: 409 });
    }
    console.error("Simpan pengaturan error:", error);
    return Response.json({ message: "Terjadi kesalahan pada server." }, { status: 500 });
  } finally {
    if (koneksi) koneksi.release();
  }
}
