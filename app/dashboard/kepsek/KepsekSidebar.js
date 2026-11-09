"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const MENU = [
  { href: "/dashboard/kepsek", label: "Dashboard", exact: true },
  { href: "/dashboard/kepsek/persetujuan", label: "Persetujuan Kelulusan" },
  { href: "/dashboard/kepsek/laporan", label: "Laporan" },
];

export default function KepsekSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function keluar() {
    await fetch("/api/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="ad-side">
      <Link href="/dashboard/kepsek" className="ad-brand">
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
            <Link key={m.href} href={m.href} className={aktif ? "ad-menu-item ad-menu-active" : "ad-menu-item"}>
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
