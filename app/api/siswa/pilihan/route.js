import pool from "@/lib/db";
import { requireSiswaApi } from "@/lib/auth";
import { pastikanPendaftar, JALUR } from "@/lib/siswa-data";

// PUT /api/siswa/pilihan  body: { jalur, pilihan: [idJurusan1, idJurusan2?] }
export async function PUT(request) {
  const auth = await requireSiswaApi(request);
  if (auth.error) return auth.error;

  let koneksi;
  try {
    const b = await request.json().catch(() => null);
    const ids = Array.isArray(b?.pilihan) ? [...new Set(b.pilihan.map(Number))] : [];
    if (ids.length < 1 || ids.length > 2 || ids.some((n) => !Number.isInteger(n) || n <= 0)) {
      return Response.json({ message: "Pilih 1 sampai 2 program keahlian." }, { status: 400 });
    }
    const jalur = JALUR.includes(b.jalur) ? b.jalur : "Reguler";

    const [ada] = await pool.query("SELECT id FROM jurusan WHERE id IN (?)", [ids]);
    if (ada.length !== ids.length) {
      return Response.json({ message: "Program keahlian tidak ditemukan." }, { status: 400 });
    }

    const pid = await pastikanPendaftar(auth.session.sub);

    koneksi = await pool.getConnection();
    await koneksi.beginTransaction();
    await koneksi.execute("DELETE FROM pilihan_program WHERE pendaftar_id = ?", [pid]);
    for (let i = 0; i < ids.length; i++) {
      await koneksi.execute(
        "INSERT INTO pilihan_program (pendaftar_id, urutan, jurusan_id) VALUES (?, ?, ?)",
        [pid, i + 1, ids[i]]
      );
    }
    // pilihan pertama dipakai admin sebagai "program" pendaftar
    await koneksi.execute("UPDATE pendaftar SET jurusan_id = ? WHERE id = ?", [ids[0], pid]);
    await koneksi.execute(
      "INSERT INTO data_diri (pendaftar_id, jalur) VALUES (?, ?) ON DUPLICATE KEY UPDATE jalur = VALUES(jalur)",
      [pid, jalur]
    );
    await koneksi.commit();

    return Response.json({ message: "Pilihan program tersimpan." });
  } catch (error) {
    if (koneksi) await koneksi.rollback().catch(() => {});
    console.error("Simpan pilihan error:", error);
    return Response.json({ message: "Terjadi kesalahan pada server." }, { status: 500 });
  } finally {
    if (koneksi) koneksi.release();
  }
}
