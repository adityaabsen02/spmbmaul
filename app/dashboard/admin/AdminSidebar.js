"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const MENU = [
  { href: "/dashboard/admin", label: "Dashboard", exact: true },
  { href: "/dashboard/admin/pendaftar", label: "Data Pendaftar" },
  { href: "/dashboard/admin/verifikasi", label: "Verifikasi Dokumen" },
  { href: "/dashboard/admin/tpa", label: "Hasil Tes TPA" },
  { href: "/dashboard/admin/pembayaran", label: "Pembayaran" },
  { href: "/dashboard/admin/pengumuman", label: "Pengumuman" },
  { href: "/dashboard/admin/pengaturan", label: "Pengaturan" },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function keluar() {
    await fetch("/api/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="ad-side">
      <Link href="/dashboard/admin" className="ad-brand">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/aset/logo.png" alt="Logo SMK Citra Negara" className="ad-brand-logo" />
        <span className="ad-brand-text">
          <span className="ad-brand-title">Citra Negara</span>
          <span className="ad-brand-sub">SPMB SMK Citra Negara</span>
        </span>
      </Link>

      <nav className="ad-menu">
        {MENU.map((m) => {
          const aktif = m.exact ? pathname === m.href : pathname.startsWith(m.href);
          return (
            <Link
              key={m.href}
              href={m.href}
              className={aktif ? "ad-menu-item ad-menu-active" : "ad-menu-item"}
            >
              {m.label}
            </Link>
          );
        })}
      </nav>

      <div>
        <p className="ad-side-label">Akun</p>
        <button type="button" className="ad-logout" onClick={keluar}>
          Keluar
        </button>
      </div>
    </aside>
  );
}
