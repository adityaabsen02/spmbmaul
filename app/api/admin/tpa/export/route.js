import { requireAdminApi } from "@/lib/auth";
import { getTpa } from "@/lib/admin-data";
import { tanggalJam } from "@/lib/format";

// Cegah "CSV injection" saat dibuka di Excel.
function sel(nilai) {
  let teks = String(nilai ?? "");
  if (/^[=+\-@\t\r]/.test(teks)) teks = "'" + teks;
  return `"${teks.replace(/"/g, '""')}"`;
}

// GET /api/admin/tpa/export  -> unduh hasil-tpa.csv
export async function GET(request) {
  const auth = await requireAdminApi(request);
  if (auth.error) return auth.error;

  try {
    const { rows } = await getTpa();

    const baris = [
      ["No. Daftar", "Nama", "Jadwal Tes", "Nilai"].map(sel).join(","),
      ...rows.map((r) =>
        [
          r.no_daftar,
          r.nama,
          r.jadwal ? tanggalJam(r.jadwal) : "",
          r.nilai === null ? "" : r.nilai,
        ]
          .map(sel)
          .join(",")
      ),
    ];

    return new Response("﻿" + baris.join("\r\n"), {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="hasil-tpa.csv"',
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    console.error("Ekspor TPA error:", error);
    return Response.json({ message: "Terjadi kesalahan pada server." }, { status: 500 });
  }
}
