import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { getSiswa, getPengumumanSiswa, jumlahSoalTpa, BERKAS } from "@/lib/siswa-data";
import { rupiah, tanggalPanjang, tanggalPendek, hariTanggalJam } from "@/lib/format";
import { hitungTodo, rp } from "@/lib/siswa-todo";
import Topbar from "../Topbar";
import Badge from "../Badge";

const BASE = "/dashboard/calon-siswa";
const LANGKAH = ["Buat akun", "Data diri", "Berkas", "Pembayaran", "Tes TPA", "Pengumuman"];

export default async function Dashboard() {
  const session = await requireRole("calon_siswa");
  const s = await getSiswa(session.sub);
  const [pengumuman, jumlahSoal] = await Promise.all([getPengumumanSiswa(), jumlahSoalTpa()]);
  const { pengaturan: p } = s;
  const batas = p.periode_tutup ? tanggalPanjang(p.periode_tutup) : "";
  const batasPendek = p.periode_tutup ? tanggalPendek(p.periode_tutup).replace(/^(\d+) (\w+) /, "$1 $2 ") : "";

  const todo = hitungTodo(s);
  const jumlahTodo = todo.length;
  const subBanner = jumlahTodo
    ? todo.slice(0, 2).map((t) => t.ringkas).join(" dan ") + " sebelum batas waktu."
    : "Semua persyaratan sudah terpenuhi. Tunggu jadwal tes dari panitia.";

  // ---- stepper banner
  const selesai = [
    true,
    s.dataLengkap,
    s.semuaOk,
    s.bayar?.status === "lunas",
    s.tes.nilai !== null,
    s.hasil !== "menunggu",
  ];
  const aktif = selesai.findIndex((x) => !x);

  // ---- kartu ringkasan
  const bayarBadge = !s.bayar
    ? ["warn", "Menunggu", `Biaya pendaftaran ${rp(p.biaya)}${batasPendek ? ` sebelum ${batasPendek}.` : "."}`]
    : s.bayar.status === "lunas"
      ? ["ok", "Lunas", "Biaya pendaftaran sudah dikonfirmasi panitia."]
      : s.bayar.status === "ditolak"
        ? ["bad", "Ditolak", s.bayar.catatan || "Bukti bayar ditolak. Unggah ulang bukti."]
        : ["warn", "Menunggu", "Bukti bayar sedang diperiksa panitia."];

  const tolak = BERKAS.find((b) => s.dokumen[b.key].status === "ditolak");
  const berkasKartu = tolak
    ? ["bad", "Perlu diperbaiki", `${s.dokTerunggah} dari ${s.totalBerkas} berkas terunggah. ${tolak.pendek.replace(/^\w/, (c) => c.toUpperCase())} perlu diunggah ulang.`]
    : s.semuaOk
      ? ["ok", "Terverifikasi", "Semua berkas wajib sudah terverifikasi."]
      : s.semuaWajibAda
        ? ["warn", "Menunggu", "Berkas sedang diperiksa panitia."]
        : ["warn", "Belum lengkap", `${s.dokTerunggah} dari ${s.totalBerkas} berkas terunggah.`];

  const tahap = s.langkah.findIndex((l) => l.state === "now");
  const statusKartu =
    s.hasil === "lulus"
      ? ["ok", "Lulus", "Selamat, kamu dinyatakan lulus seleksi."]
      : s.hasil === "ditolak"
        ? ["bad", "Ditolak", "Ada berkas atau pembayaran yang ditolak."]
        : ["warn", "Diproses", `Tahap ${tahap < 0 ? s.langkah.length : tahap + 1} dari ${s.langkah.length}: ${s.langkah[tahap < 0 ? 0 : tahap].ringkas}.`];

  const terbaru = pengumuman.filter((x) => (Date.now() - new Date(x.tanggal).getTime()) / 864e5 <= 14).length;

  const kartu = [
    { kode: "DD", judul: "Data Diri", href: "data-diri", ...(s.dataLengkap
      ? { w: "ok", b: "Lengkap", t: "Biodata, alamat, orang tua, dan asal sekolah sudah terisi." }
      : { w: "warn", b: `${s.persenData}%`, t: "Lengkapi biodata, alamat, orang tua, dan asal sekolah." }) },
    { kode: "BK", judul: "Unggah Berkas", href: "berkas", w: berkasKartu[0], b: berkasKartu[1], t: berkasKartu[2] },
    { kode: "Rp", judul: "Pembayaran", href: "pembayaran", w: bayarBadge[0], b: bayarBadge[1], t: bayarBadge[2] },
    { kode: "PP", judul: "Pilihan Program", href: "program", ...(s.pilihan.length
      ? { w: "ok", b: "Terisi", t: s.pilihan.map((x, i) => `pilihan ${i + 1} ${x.nama}`).join(", ").replace(/^\w/, (c) => c.toUpperCase()) + "." }
      : { w: "warn", b: "Belum diisi", t: "Pilih maksimal 2 program keahlian." }) },
    { kode: "TP", judul: "Tes TPA", href: "tes-tpa", ...(s.tes.nilai !== null
      ? { w: "ok", b: "Selesai", t: `Tes sudah kamu selesaikan. Total ${jumlahSoal} soal.` }
      : { w: "muted", b: "Belum mulai", t: s.tes.jadwal ? `${hariTanggalJam(s.tes.jadwal).replace(/(\w+), (\d+) (\w{3})\w*/, "$1, $2 $3")}. Total ${jumlahSoal} soal.` : `Jadwal akan diumumkan panitia. Total ${jumlahSoal} soal.` }) },
    { kode: "KP", judul: "Kartu Peserta", href: "kartu", ...(s.kartuTerbit
      ? { w: "ok", b: "Terbit", t: "Kartu peserta siap dilihat dan dicetak." }
      : { w: "muted", b: "Terkunci", t: "Tersedia setelah berkas dan pembayaran terverifikasi." }) },
    { kode: "ST", judul: "Status Seleksi", href: "status", w: statusKartu[0], b: statusKartu[1], t: statusKartu[2] },
    { kode: "PG", judul: "Pengumuman", href: "pengumuman", ...(terbaru
      ? { w: "ok", b: `${terbaru} baru`, t: "Jadwal tes dan info terbaru dari panitia." }
      : { w: "muted", b: "Tidak ada", t: "Belum ada pengumuman baru dari panitia." }) },
    { kode: "DU", judul: "Daftar Ulang", href: "daftar-ulang", ...(s.hasil === "lulus"
      ? s.daftarUlang?.status === "terkirim" ? { w: "ok", b: "Selesai", t: "Formulir daftar ulang sudah terkirim." } : { w: "ok", b: "Terbuka", t: "Isi formulir daftar ulang sekarang." }
      : { w: "muted", b: "Terkunci", t: "Dibuka jika kamu dinyatakan diterima." }) },
  ];

  return (
    <>
      <Topbar
        judul={`Halo, ${s.nama}`}
        sub="Pantau semua tahapan pendaftaran SPMB kamu di sini."
        nama={s.nama}
        userSub={s.no_daftar}
        notif={jumlahTodo}
      />

      <div className="sw-banner">
        <h2>{jumlahTodo ? `Selesaikan ${jumlahTodo} hal agar bisa ikut tes` : "Semua persyaratan sudah lengkap"}</h2>
        <p>{subBanner.replace(/^\w/, (c) => c.toUpperCase())}</p>
        <div className="sw-steps">
          {LANGKAH.map((nama, i) => (
            <span key={nama} className={`sw-step${selesai[i] ? " sw-step-done" : i === aktif ? " sw-step-now" : ""}`}>
              <span className="sw-step-no">{i + 1}</span>
              {nama}
            </span>
          ))}
        </div>
      </div>

      <div className="sw-grid-dash">
        <div>
          <div className="sw-cards">
            {kartu.map((k) => (
              <Link key={k.kode} href={`${BASE}/${k.href}`} className="sw-mcard">
                <div className="sw-mcard-top">
                  <span className="sw-ico">{k.kode}</span>
                  <Badge warna={k.w}>{k.b}</Badge>
                </div>
                <h3>{k.judul}</h3>
                <p>{k.t}</p>
              </Link>
            ))}
          </div>

          <div className="sw-card sw-todo">
            <h3 className="sw-card-title">Yang perlu kamu lakukan</h3>
            {todo.length === 0 && <p className="sw-card-sub">Tidak ada yang perlu dikerjakan saat ini.</p>}
            {todo.slice(0, 4).map((t) => (
              <div key={t.judul} className="sw-todo-row">
                <div>
                  <div className="sw-todo-t">{t.judul}</div>
                  <div className="sw-todo-s">{t.sub}</div>
                </div>
                <Link href={t.href} className="sw-btn sw-btn-sm">
                  {t.tombol}
                </Link>
              </div>
            ))}
          </div>
        </div>

        <div className="sw-side-col">
          <div className="sw-card">
            <h3 className="sw-card-title">Pengumuman terbaru</h3>
            {pengumuman.length === 0 && <p className="sw-card-sub">Belum ada pengumuman.</p>}
            {pengumuman.slice(0, 3).map((x) => (
              <div key={x.id} className="sw-news-item">
                <div className="sw-news-date">{tanggalPendek(x.tanggal)}</div>
                <div className="sw-news-text">{x.judul}</div>
              </div>
            ))}
          </div>

          <div className="sw-help">
            <h3>Butuh bantuan?</h3>
            <p>Panitia SPMB melayani Senin sampai Jumat, pukul 08.00 sampai 15.00 WIB.</p>
            <a
              className="sw-btn sw-btn-lime"
              href={p.kontak_wa ? `https://wa.me/${p.kontak_wa.replace(/\D/g, "")}` : p.kontak_email ? `mailto:${p.kontak_email}` : "#"}
            >
              Hubungi panitia
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
