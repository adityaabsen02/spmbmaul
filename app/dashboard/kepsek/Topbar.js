import Link from "next/link";
import { Bell } from "lucide-react";
import { inisial } from "@/lib/format";

// Bagian atas halaman kepsek: judul (opsional), lonceng (titik merah = ada yang menunggu), profil.
export default function Topbar({ nama, judul, sub, menunggu = 0 }) {
  return (
    <div className="ad-topbar">
      <div>
        {judul && <h1 className="ad-hello">{judul}</h1>}
        {sub && <p className="ad-hello-sub">{sub}</p>}
      </div>

      <div className="ad-topbar-right">
        <Link
          href="/dashboard/kepsek/persetujuan"
          className="ad-bell"
          aria-label={`${menunggu} siswa menunggu persetujuan`}
          title={`${menunggu} siswa menunggu persetujuan`}
        >
          <Bell />
          {menunggu > 0 && <span className="ad-bell-dot" />}
        </Link>

        <div className="ad-user">
          <span className="ad-avatar">{inisial(nama)}</span>
          <span className="ad-user-text">
            <span className="ad-user-name">{nama}</span>
            <span className="ad-user-role">Kepala Sekolah</span>
          </span>
        </div>
      </div>
    </div>
  );
}
