import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { getSiswa, getBayarDaftarUlang } from "@/lib/siswa-data";
import { hitungTodo, rp } from "@/lib/siswa-todo";
import Topbar from "../../Topbar";
import Badge from "../../Badge";
import DaftarUlangForm from "./DaftarUlangForm";
import BayarDaftarUlang from "./BayarDaftarUlang";

const singkat = (t) => String(t || "").replace(/(Januari|Februari|Maret|April|Juni|Juli|Agustus|September|Oktober|November|Desember)/g, (m) => m.slice(0, 3));

export default async function DaftarUlang() {
  const session = await requireRole("calon_siswa");
  const s = await getSiswa(session.sub);
  const p = s.pengaturan;
  const du = s.daftarUlang;
  const terkirim = du?.status === "terkirim";
  const akhir = (p.tgl_daftar_ulang.split("-").pop() || "").trim();

  const head = (
    <Topbar
      judul="Daftar Ulang"
      sub="Lengkapi tahapan berikut setelah dinyatakan diterima."
      nama={s.nama}
      userSub={s.no_daftar}
      notif={hitungTodo(s).length}
    />
  );

  if (s.hasil !== "lulus") {
    return (
      <>
        {head}
        <div className="sw-card sw-kunci">
          <h3 className="sw-card-title">Daftar ulang belum dibuka</h3>
          <p className="sw-card-sub">
            Daftar ulang hanya untuk peserta yang dinyatakan diterima. Pantau hasil seleksi kamu di menu Pengumuman.
          </p>
          <div className="sw-card-foot" style={{ justifyContent: "flex-start" }}>
            <Link href="/dashboard/calon-siswa/pengumuman" className="sw-btn sw-btn-sm">Lihat pengumuman</Link>
          </div>
        </div>
      </>
    );
  }

  const bayar = await getBayarDaftarUlang(s.id);
  const d = String(s.no_daftar || "").replace(/\D/g, "").padStart(8, "0");
  const grup = (awal) => `${awal} ${d.slice(0, 4)} ${d.slice(4)}`;
  const infoBayar = {
    nominal: rp(p.biaya_du),
    invoice: `DU-${s.no_daftar}`,
    batas: singkat(p.batas_bayar_du),
    status: bayar?.status || "belum",
    catatan: bayar?.catatan || "",
    adaBukti: Boolean(bayar?.ada),
    nomorPer: { BRI: grup("77778"), BCA: grup("39912"), MDR: grup("89509"), MKT: `SPMBDU${d}` },
  };
  const stBayar = {
    lunas: ["done", ["ok", "Selesai"]],
    menunggu: ["todo", ["warn", "Diperiksa"]],
    ditolak: ["todo", ["bad", "Ditolak"]],
  }[infoBayar.status] || ["todo", ["warn", "Menunggu"]];

  const langkah = [
    ["Konfirmasi kesediaan", `Selesai${p.tgl_pengumuman ? ` · ${singkat(p.tgl_pengumuman)}` : ""}`, "done", ["ok", "Selesai"]],
    ["Pilih ukuran seragam", terkirim ? "Ukuran sudah dikirim" : "Isi ukuran di formulir di bawah", terkirim ? "done" : "todo", terkirim ? ["ok", "Selesai"] : ["muted", "Belum"]],
    ["Bayar biaya daftar ulang", `${rp(p.biaya_du)} · batas ${singkat(p.batas_bayar_du)}`, stBayar[0], stBayar[1]],
    ["Bawa berkas asli ke sekolah", `${singkat(p.tgl_daftar_ulang)}, ${p.jam_du}`, "todo", ["muted", "Belum"]],
  ];

  return (
    <>
      {head}

      <div className="sw-banner sw-banner-big sw-banner-tight">
        <span className="sw-banner-label">Hasil seleksi</span>
        <h2>Selamat, kamu diterima di {s.pilihan[0]?.nama || "SMK Citra Negara"}</h2>
        <p>Selesaikan daftar ulang sebelum {akhir || "batas yang ditentukan"} agar tempatmu tidak dialihkan.</p>
      </div>

      <div className="sw-grid-du">
        <div className="sw-col">
          <div className="sw-card">
            <h3 className="sw-card-title">Tahapan daftar ulang</h3>
            <div className="sw-du-steps">
              {langkah.map(([judul, sub, state, [warna, teks]], i) => (
                <div key={judul} className="sw-du-step">
                  <span className={state === "done" ? "sw-du-no sw-du-done" : "sw-du-no"}>{state === "done" ? "✓" : i + 1}</span>
                  <div className="sw-du-t">
                    <b>{judul}</b>
                    <small>{sub}</small>
                  </div>
                  <Badge warna={warna}>{teks}</Badge>
                </div>
              ))}
            </div>
          </div>

          <BayarDaftarUlang info={infoBayar} />

          <DaftarUlangForm awal={{ ...(du || {}), telepon_wali: du?.telepon_wali || s.data.telepon_ortu || "" }} terkunci={terkirim} />
        </div>

        <div className="sw-col">
          <div className="sw-card">
            <h3 className="sw-card-title">Berkas asli yang dibawa</h3>
            <ul className="sw-list sw-list-plain sw-list-line">
              <li>Ijazah / Surat Keterangan Lulus asli</li>
              <li>Kartu Keluarga asli dan fotokopi</li>
              <li>Akta kelahiran asli dan fotokopi</li>
              <li>Pas foto 3×4 sebanyak 4 lembar</li>
              <li>Bukti pembayaran daftar ulang</li>
            </ul>
          </div>
          <div className="sw-card">
            <h3 className="sw-card-title">Jadwal datang</h3>
            <div className="sw-jd">
              <b>{singkat(p.tgl_daftar_ulang)}</b>
              <span>Senin sampai Sabtu</span>
              <span>{p.jam_du}</span>
            </div>
            <div className="sw-jd sw-jd-line"><span>Lokasi: {p.lokasi_du}</span></div>
          </div>
        </div>
      </div>
    </>
  );
}
