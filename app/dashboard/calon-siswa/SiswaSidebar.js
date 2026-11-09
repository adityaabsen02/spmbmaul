"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const BASE = "/dashboard/calon-siswa";

export const MENU = [
  { href: BASE, label: "Dashboard", exact: true },
  { href: `${BASE}/data-diri`, label: "Data Diri" },
  { href: `${BASE}/berkas`, label: "Unggah berkas" },
  { href: `${BASE}/pembayaran`, label: "Pembayaran" },
  { href: `${BASE}/program`, label: "Pilihan program" },
  { href: `${BASE}/tes-tpa`, label: "Tes TPA" },
  { href: `${BASE}/status`, label: "Status seleksi" },
  { href: `${BASE}/kartu`, label: "Kartu peserta" },
  { href: `${BASE}/pengumuman`, label: "Pengumuman" },
  { href: `${BASE}/daftar-ulang`, label: "Daftar ulang" },
];

export default function SiswaSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function keluar() {
    await fetch("/api/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="sw-side">
      <Link href={BASE} className="sw-brand">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/aset/logo.png" alt="Logo SMK Citra Negara" className="sw-brand-logo" />
        <span className="sw-brand-text">
          <span className="sw-brand-title">Citra Negara</span>
          <span className="sw-brand-sub">SPMB 2026/2027</span>
        </span>
      </Link>

      <nav className="sw-menu">
        {MENU.map((m) => {
          const aktif = m.exact ? pathname === m.href : pathname.startsWith(m.href);
          return (
            <Link key={m.href} href={m.href} className={aktif ? "sw-menu-item sw-menu-active" : "sw-menu-item"}>
              {m.label}
            </Link>
          );
        })}
      </nav>

      <div>
        <p className="sw-side-label">Bantuan</p>
        <button type="button" className="sw-logout" onClick={keluar}>
          Keluar
        </button>
      </div>
    </aside>
  );
}
