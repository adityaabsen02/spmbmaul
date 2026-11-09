import Link from "next/link";
import { Bell } from "lucide-react";
import { inisial } from "@/lib/format";

// Bagian atas tiap halaman siswa: judul + sub, lonceng (angka = hal yang perlu dikerjakan), profil.
export default function Topbar({ judul, sub, nama, userSub, notif = 0 }) {
  return (
    <div className="sw-topbar">
      <div>
        <h1 className="sw-title">{judul}</h1>
        {sub && <p className="sw-sub">{sub}</p>}
      </div>

      <div className="sw-topbar-right">
        {notif > 0 && (
          <Link href="/dashboard/calon-siswa" className="sw-bell" aria-label={`${notif} hal perlu dikerjakan`}>
            <Bell />
            <span className="sw-bell-badge">{notif}</span>
          </Link>
        )}
        <div className="sw-user">
          <span className="sw-avatar">{(String(nama || "?").trim().split(/\s+/).map((k) => k[0]).slice(0, 2).join("") || inisial(nama)).toUpperCase()}</span>
          <span className="sw-user-text">
            <span className="sw-user-name">{nama}</span>
            <span className="sw-user-sub">{userSub}</span>
          </span>
        </div>
      </div>
    </div>
  );
}
