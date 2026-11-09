import Link from "next/link";
import { requireRole } from "@/lib/auth";
import {
  getRingkasan,
  getPengumumanTerbaru,
  getPengaturan,
} from "@/lib/admin-data";
import { statusPeriode, tanggal } from "@/lib/format";
import Topbar from "./Topbar";

function periodeTeks(s, buka, tutup) {
  if (s.kode === "kosong") return "Periode pendaftaran belum diatur.";
  if (s.kode === "belum") return `Dibuka pada ${tanggal(buka)}`;
  return `Ditutup pada ${tanggal(tutup)}`;
}

export default async function DashboardAdmin() {
  // Lapisan keamanan 2: setiap halaman memeriksa sendiri (layout tidak dirender ulang saat navigasi).
  const session = await requireRole("admin");

  const [r, terbaru, setting] = await Promise.all([
    getRingkasan(),
    getPengumumanTerbaru(3),
    getPengaturan(),
  ]);

  const periode = statusPeriode(setting.periode_buka, setting.periode_tutup);
  const perluDitangani = r.dokumen_menunggu + r.bayar_menunggu;

  const pad2 = (n) => String(n).padStart(2, "0");
  const pad3 = (n) => String(n).padStart(3, "0");

  const langkah = [
    ["Pendaftar", r.total_pendaftar],
    ["Berkas", r.dokumen_menunggu],
    ["Bayar", r.bayar_menunggu],
    ["Tes TPA", r.tpa_belum],
    ["Selesai", r.selesai],
  ];

  const badgeTpa =
    r.tpa_terjadwal === 0
      ? ["Belum mulai", "muted"]
      : r.tpa_belum > 0
        ? ["Berjalan", "ok"]
        : ["Selesai", "ok"];

  const kartu = [
    {
      href: "/dashboard/admin/pendaftar",
      kode: "DP",
      judul: "Data Pendaftar",
      desc: "Lihat dan kelola seluruh calon siswa yang mendaftar.",
      badge: [`${pad3(r.total_pendaftar)} siswa`, "ok"],
    },
    {
      href: "/dashboard/admin/verifikasi",
      kode: "VD",
      judul: "Verifikasi Dokumen",
      desc: "Periksa kelengkapan berkas yang diunggah pendaftar.",
      badge: r.dokumen_menunggu > 0 ? ["Perlu dicek", "warn"] : ["Beres", "ok"],
    },
    {
      href: "/dashboard/admin/pembayaran",
      kode: "PB",
      judul: "Pembayaran",
      desc: "Konfirmasi bukti transfer biaya pendaftaran.",
      badge: r.bayar_menunggu > 0 ? ["Menunggu", "warn"] : ["Beres", "ok"],
    },
    {
      href: "/dashboard/admin/tpa",
      kode: "TP",
      judul: "Hasil Tes TPA",
      desc: "Atur jadwal tes dan input nilai peserta.",
      badge: badgeTpa,
    },
    {
      href: "/dashboard/admin/pengumuman",
      kode: "PM",
      judul: "Pengumuman",
      desc: "Buat dan terbitkan pengumuman untuk pendaftar.",
      badge: [`${r.pengumuman_draf} draf`, "muted"],
    },
    {
      href: "/dashboard/admin/pengaturan",
      kode: "PG",
      judul: "Pengaturan",
      desc: "Atur periode, biaya, dan kuota pendaftaran.",
      badge: [periode.teks, periode.warna],
    },
  ];

  return (
    <>
      <Topbar
        nama={session.nama}
        judul={`Halo, ${session.nama}`}
        sub="Pantau seluruh proses penerimaan SPMB hari ini."
      />

      <div className="ad-banner ad-banner-lg">
        <h2>
          {perluDitangani > 0
            ? `Ada ${pad2(perluDitangani)} hal yang perlu kamu tangani hari ini`
            : "Semua beres, tidak ada yang perlu kamu tangani hari ini"}
        </h2>
        <p>
          Verifikasi berkas dan konfirmasi pembayaran agar pendaftar bisa lanjut ke tahap berikutnya.
        </p>
        <div className="ad-steps">
          {langkah.map(([label, n], i) => (
            <div key={label} className="ad-step">
              <span className="ad-step-no">{i + 1}</span>
              {label} {pad3(n)}
            </div>
          ))}
        </div>
      </div>

      <div className="ad-dash">
        <div>
          <div className="ad-mcards">
            {kartu.map((k) => (
              <Link key={k.href} href={k.href} className="ad-mcard">
                <div className="ad-mcard-top">
                  <span className="ad-mcard-no">{k.kode}</span>
                  <span className={`ad-badge ad-badge-${k.badge[1]}`}>{k.badge[0]}</span>
                </div>
                <h4>{k.judul}</h4>
                <p>{k.desc}</p>
              </Link>
            ))}
          </div>

          <div className="ad-card">
            <h3 className="ad-card-title">Yang perlu kamu lakukan</h3>

            <div className="ad-todo-row">
              <div>
                <b>Verifikasi {pad2(r.dokumen_menunggu)} berkas baru</b>
                <span>
                  {r.dokumen_menunggu > 0
                    ? `Menunggu sejak ${tanggal(r.dokumen_sejak)}`
                    : "Tidak ada berkas yang menunggu"}
                </span>
              </div>
              <Link href="/dashboard/admin/verifikasi" className="ad-btn">
                Verifikasi
              </Link>
            </div>

            <div className="ad-todo-row">
              <div>
                <b>Konfirmasi {pad2(r.bayar_menunggu)} bukti pembayaran</b>
                <span>
                  {r.bayar_menunggu > 0
                    ? `Menunggu sejak ${tanggal(r.bayar_sejak)}`
                    : "Tidak ada pembayaran yang menunggu"}
                </span>
              </div>
              <Link href="/dashboard/admin/pembayaran" className="ad-btn">
                Konfirmasi
              </Link>
            </div>
          </div>
        </div>

        <div>
          <div className="ad-card" style={{ padding: "18px 22px 6px" }}>
            <h3 className="ad-card-title" style={{ marginBottom: 6 }}>Pengumuman terbaru</h3>
            {terbaru.length === 0 && <p className="ad-empty">Belum ada pengumuman terbit.</p>}
            {terbaru.map((p) => (
              <div key={p.id} className="ad-news">
                <span>{tanggal(p.dibuat)}</span>
                <b>{p.judul}</b>
              </div>
            ))}
          </div>

          <div className="ad-period">
            <h3>Periode pendaftaran</h3>
            <p>{periodeTeks(periode, setting.periode_buka, setting.periode_tutup)}</p>
            <Link href="/dashboard/admin/pengaturan" className="ad-btn ad-btn-green ad-btn-wide">
              Atur periode
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
