import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { getAntreanDokumen, getDetailPendaftar } from "@/lib/admin-data";
import Topbar from "../Topbar";
import Banner from "../Banner";
import VerifikasiPanel from "./VerifikasiPanel";

export default async function VerifikasiDokumen({ searchParams }) {
  const session = await requireRole("admin");
  const sp = await searchParams;

  const antrean = await getAntreanDokumen();

  // Tanpa ?id= -> otomatis tampilkan pendaftar pertama yang dokumennya masih menunggu.
  const idDiminta = Number(sp.id);
  const id = Number.isInteger(idDiminta) && idDiminta > 0 ? idDiminta : antrean[0];

  const detail = id ? await getDetailPendaftar(id) : null;

  // Pendaftar berikutnya dalam antrean (selain yang sedang dibuka).
  const berikutnya = antrean.find((x) => x > id) ?? antrean.find((x) => x !== id) ?? null;

  const sub = detail
    ? `Periksa berkas pendaftar ${detail.pendaftar.nama} · ${detail.pendaftar.no_daftar}`
    : "Periksa berkas pendaftar yang masuk.";

  return (
    <>
      <Topbar nama={session.nama} />

      <Banner judul="Verifikasi Dokumen" sub={sub} />

      {!detail ? (
        <div className="ad-card">
          <p className="ad-empty">
            {id
              ? "Pendaftar tidak ditemukan."
              : "Tidak ada dokumen yang menunggu verifikasi."}{" "}
            <Link href="/dashboard/admin/pendaftar" className="ad-link-btn">
              Lihat data pendaftar
            </Link>
          </p>
        </div>
      ) : (
        <VerifikasiPanel
          key={detail.pendaftar.id}
          pendaftar={detail.pendaftar}
          dokumen={detail.dokumen}
          berikutnyaId={berikutnya}
        />
      )}
    </>
  );
}
