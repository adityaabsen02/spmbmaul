import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { getSiswa } from "@/lib/siswa-data";
import Topbar from "../../Topbar";
import Badge from "../../Badge";

export default async function StatusSeleksi() {
  const session = await requireRole("calon_siswa");
  const s = await getSiswa(session.sub);

  // ---- banner: apa yang sedang terjadi sekarang
  const now = s.langkah.findIndex((l) => l.state === "now");
  const judulBanner = [
    "Pendaftaran akun selesai",
    "Data diri belum lengkap",
    "Berkas sedang diverifikasi",
    "Menunggu pembayaran",
    s.tes.jadwal ? "Siap mengikuti tes" : "Menunggu jadwal tes",
    "Menunggu pengumuman hasil",
    s.hasil === "lulus" ? "Selamat, kamu dinyatakan lulus" : "Silakan lanjut daftar ulang",
  ];
  let headline = now < 0 ? "Seluruh tahapan seleksi selesai" : judulBanner[now];
  if (s.hasil === "ditolak") headline = "Pendaftaran belum bisa dilanjutkan";

  const masalah = [];
  if (s.dokTolak > 0) masalah.push(`${s.dokTolak === 1 ? "Satu" : s.dokTolak} berkas perlu diperbaiki`);
  else if (!s.semuaOk) masalah.push("berkas masih dalam pemeriksaan");
  if (s.bayar?.status !== "lunas") masalah.push(s.bayar?.status === "menunggu" ? "pembayaran sedang diperiksa" : "pembayaran belum diterima");
  const subBanner = masalah.length
    ? `${masalah.join(" dan ").replace(/^\w/, (c) => c.toUpperCase())}. Selesaikan ${masalah.length > 1 ? "keduanya" : "itu"} agar kamu bisa mengikuti tes.`
    : s.tes.nilai === null
      ? "Semua persyaratan terpenuhi. Ikuti tes sesuai jadwal yang sudah ditentukan."
      : "Pantau pengumuman hasil seleksi dari panitia di menu Pengumuman.";

  const nilai = s.tes.nilai === null ? "Belum ada" : s.tes.nilai.toLocaleString("id-ID", { maximumFractionDigits: 1 });
  const keputusan = s.hasil === "lulus" ? ["ok", "Lulus"] : s.hasil === "ditolak" ? ["bad", "Tidak lulus"] : ["muted", "Belum diumumkan"];

  return (
    <>
      <Topbar
        judul="Status Seleksi"
        sub="Pantau tahapan pendaftaran kamu dari awal sampai daftar ulang."
        nama={s.nama}
        userSub={s.data.nisn ? `NISN ${s.data.nisn}` : s.no_daftar}
      />

      <div className="sw-banner sw-banner-big">
        <span className="sw-banner-label">Status pendaftaran saat ini</span>
        <h2>{headline}</h2>
        <p>{subBanner}</p>
      </div>

      <div className="sw-grid-status">
        <div className="sw-card">
          <h3 className="sw-card-title">Tahapan seleksi</h3>
          <div className="sw-timeline">
            {s.langkah.map((l, i) => (
              <div key={l.judul} className={`sw-tl sw-tl-${l.state}`}>
                <span className="sw-tl-no">{l.state === "done" ? "✓" : i + 1}</span>
                <div>
                  <div className="sw-tl-t">{l.judul}</div>
                  <div className="sw-tl-s">{l.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="sw-card">
            <h3 className="sw-card-title">Kartu peserta</h3>
            <p className="sw-card-sub">Kartu tersedia setelah berkas dan pembayaran terverifikasi.</p>
            <div className="sw-dash">
              <small>Nomor pendaftaran</small>
              <strong>{s.no_daftar}</strong>
            </div>
            <div className="sw-dash">
              <small>Program keahlian pilihan</small>
              <strong>{s.pilihan[0]?.nama || "Belum dipilih"}</strong>
            </div>
            {s.kartuTerbit ? (
              <Link href="/dashboard/calon-siswa/kartu" className="sw-btn sw-btn-out sw-btn-block">
                Unduh kartu
              </Link>
            ) : (
              <span className="sw-btn sw-btn-out sw-btn-block" style={{ opacity: 0.55, cursor: "not-allowed" }}>
                Unduh kartu
              </span>
            )}
          </div>

          <div className="sw-card">
            <h3 className="sw-card-title">Hasil seleksi</h3>
            <div style={{ marginTop: 10 }}>
              <div className="sw-syarat"><span>Nilai TPA</span><b>{nilai}</b></div>
              <div className="sw-syarat"><span>Keputusan</span><Badge warna={keputusan[0]}>{keputusan[1]}</Badge></div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
