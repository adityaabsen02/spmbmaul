import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { getSiswa } from "@/lib/siswa-data";
import { MENU } from "../../SiswaSidebar";
import Topbar from "../../Topbar";

// Halaman yang desainnya belum dikerjakan: tampil kerangka + keterangan.
export default async function Segera({ params }) {
  const session = await requireRole("calon_siswa");
  const { halaman } = await params;
  const menu = MENU.find((m) => m.href.endsWith(`/${halaman}`));
  if (!menu) notFound();

  const s = await getSiswa(session.sub);
  return (
    <>
      <Topbar judul={menu.label} sub="Halaman ini sedang disiapkan." nama={s.nama} userSub={s.no_daftar} />
      <div className="sw-card">
        <p className="sw-card-sub">Fitur {menu.label} akan tersedia pada pembaruan berikutnya.</p>
      </div>
    </>
  );
}
