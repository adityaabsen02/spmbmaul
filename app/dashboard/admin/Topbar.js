import Link from "next/link";
import { Bell } from "lucide-react";
import { getRingkasan } from "@/lib/admin-data";
import { inisial } from "@/lib/format";

// Bagian atas setiap halaman admin: sapaan/judul (opsional), lonceng, dan profil.
export default async function Topbar({ nama, judul, sub }) {
  const r = await getRingkasan();
  const perluTindakan = r.dokumen_menunggu + r.bayar_menunggu;

  return (
    <div className="ad-topbar">
      <div>
        {judul && <h1 className="ad-hello">{judul}</h1>}
        {sub && <p className="ad-hello-sub">{sub}</p>}
      </div>

      <div className="ad-topbar-right">
        <Link
          href="/dashboard/admin/verifikasi"
          className="ad-bell"
          aria-label={`${perluTindakan} hal perlu ditinjau`}
          title={`${perluTindakan} hal perlu ditinjau`}
        >
          <Bell />
          {perluTindakan > 0 && <span className="ad-bell-dot" />}
        </Link>

        <div className="ad-user">
          <span className="ad-avatar">{inisial(nama)}</span>
          <span className="ad-user-text">
            <span className="ad-user-name">{nama}</span>
            <span className="ad-user-role">Administrator</span>
          </span>
        </div>
      </div>
    </div>
  );
}
