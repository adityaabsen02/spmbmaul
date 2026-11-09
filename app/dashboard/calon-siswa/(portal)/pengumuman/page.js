import { requireRole } from "@/lib/auth";
import { getSiswa, getPengumumanSiswa } from "@/lib/siswa-data";
import { tanggalPendek } from "@/lib/format";
import { hitungTodo } from "@/lib/siswa-todo";
import Topbar from "../../Topbar";
import DaftarPengumuman from "./DaftarPengumuman";

const singkat = (t) => String(t || "").replace(/(Januari|Februari|Maret|April|Juni|Juli|Agustus|September|Oktober|November|Desember)/g, (m) => m.slice(0, 3));

export default async function Pengumuman() {
  const session = await requireRole("calon_siswa");
  const [s, daftar] = await Promise.all([getSiswa(session.sub), getPengumumanSiswa()]);
  const p = s.pengaturan;

  let judul = "Belum diumumkan";
  let sub = p.tgl_pengumuman ? `Hasil seleksi akan tampil di sini pada ${p.tgl_pengumuman}.` : "Hasil seleksi akan tampil di sini setelah diumumkan panitia.";
  if (s.hasil === "lulus") {
    judul = `Selamat, kamu diterima di ${s.pilihan[0]?.nama || "SMK Citra Negara"}`;
    sub = "Lanjutkan ke menu Daftar ulang untuk mengamankan tempatmu.";
  } else if (s.hasil === "ditolak") {
    judul = "Pendaftaran belum bisa dilanjutkan";
    sub = "Periksa berkas dan pembayaran kamu di menu Status seleksi.";
  }

  const jadwal = [
    [singkat(p.batas_bayar), "Batas pembayaran"],
    [singkat(p.batas_berkas), "Batas unggah berkas"],
    [s.tes.jadwal ? tanggalPendek(s.tes.jadwal.slice(0, 10)) : "Segera", "Tes Potensi Akademik"],
    [singkat(p.tgl_pengumuman) || "-", "Pengumuman hasil"],
    [singkat(p.tgl_daftar_ulang) || "-", "Daftar ulang"],
  ];

  const item = daftar.map((x) => ({ id: x.id, judul: x.judul, isi: x.isi, kategori: x.kategori, tanggal: tanggalPendek(x.tanggal) }));

  return (
    <>
      <Topbar
        judul="Pengumuman"
        sub="Informasi resmi dari panitia SPMB dan hasil seleksi."
        nama={s.nama}
        userSub={s.no_daftar}
        notif={hitungTodo(s).length}
      />

      <div className="sw-banner sw-banner-big sw-banner-tight">
        <span className="sw-banner-label">Hasil seleksi</span>
        <h2>{judul}</h2>
        <p>{sub}</p>
      </div>

      <div className="sw-grid-pg">
        <DaftarPengumuman item={item} />
        <div className="sw-card">
          <h3 className="sw-card-title">Jadwal penting</h3>
          <div className="sw-jp">
            {jadwal.map(([tgl, ket]) => (
              <div key={ket} className="sw-jp-row">
                <b>{tgl}</b>
                <span>{ket}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
