import pool from "@/lib/db";
import { requireAdminApi } from "@/lib/auth";

// PUT /api/admin/tpa/:pendaftarId   body: { jadwal: "YYYY-MM-DDTHH:mm" | "", nilai: 0-100 | "" }
export async function PUT(request, { params }) {
  const auth = await requireAdminApi(request);
  if (auth.error) return auth.error;

  try {
    const { pendaftarId } = await params;
    const id = Number(pendaftarId);

    if (!Number.isInteger(id) || id <= 0) {
      return Response.json({ message: "ID pendaftar tidak valid." }, { status: 400 });
    }

    const body = await request.json().catch(() => null);
    if (!body) {
      return Response.json({ message: "Data tidak valid." }, { status: 400 });
    }

    // Jadwal (boleh kosong)
    let jadwal = null;
    if (body.jadwal) {
      const m = /^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})$/.exec(String(body.jadwal));
      if (!m) {
        return Response.json({ message: "Format jadwal tidak valid." }, { status: 400 });
      }
      jadwal = `${m[1]} ${m[2]}:00`;
    }

    // Nilai (boleh kosong = belum dinilai)
    let nilai = null;
    if (body.nilai !== "" && body.nilai !== null && body.nilai !== undefined) {
      nilai = Number(body.nilai);
      if (!Number.isFinite(nilai) || nilai < 0 || nilai > 100) {
        return Response.json(
          { message: "Nilai harus berupa angka 0 sampai 100." },
          { status: 400 }
        );
      }
      nilai = Math.round(nilai * 100) / 100;
    }

    const [ada] = await pool.execute("SELECT id FROM pendaftar WHERE id = ?", [id]);
    if (ada.length === 0) {
      return Response.json({ message: "Pendaftar tidak ditemukan." }, { status: 404 });
    }

    await pool.execute(
      `INSERT INTO tes_tpa (pendaftar_id, jadwal, nilai) VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE jadwal = VALUES(jadwal), nilai = VALUES(nilai)`,
      [id, jadwal, nilai]
    );

    return Response.json({ message: "Hasil tes tersimpan." });
  } catch (error) {
    console.error("Simpan TPA error:", error);
    return Response.json({ message: "Terjadi kesalahan pada server." }, { status: 500 });
  }
}
