import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { getSiswa } from "@/lib/siswa-data";
import { hariTanggalJam, tanggalPanjang } from "@/lib/format";
import { hitungTodo } from "@/lib/siswa-todo";
import Topbar from "../../Topbar";
import AksiKartu from "./AksiKartu";

// Pola kotak-kotak dari nomor pendaftaran (hiasan, bukan QR yang bisa dipindai).
function Pola({ teks }) {
  const n = 21;
  let x = 0;
  for (const c of teks) x = (Math.imul(x, 31) + c.charCodeAt(0)) >>> 0;
  const acak = () => ((x = (Math.imul(x, 1664525) + 1013904223) >>> 0) >>> 8) / 16777216;
  const finder = (r, c) => (r < 7 && c < 7) || (r < 7 && c >= n - 7) || (r >= n - 7 && c < 7);
  const isi = (r, c) => {
    const ke = (a, b) => {
      const d = Math.max(Math.abs(a - 3), Math.abs(b - 3));
      return d === 3 || d <= 1;
    };
    if (r < 7 && c < 7) return ke(r, c);
    if (r < 7 && c >= n - 7) return ke(r, c - (n - 7));
    return ke(r - (n - 7), c);
  };
  const sel = [];
  for (let r = 0; r < n; r++)
    for (let c = 0; c < n; c++) {
      const hitam = finder(r, c) ? isi(r, c) : acak() > 0.5;
      if (hitam) sel.push(<rect key={`${r}-${c}`} x={c} y={r} width="1" height="1" />);
    }
  return (
    <svg viewBox={`-1 -1 ${n + 2} ${n + 2}`} className="sw-kartu-qr" role="img" aria-label="Pola kartu peserta" shapeRendering="crispEdges">
      <rect x="-1" y="-1" width={n + 2} height={n + 2} fill="#fff" />
      <g fill="#0b0b0b">{sel}</g>
    </svg>
  );
}

export default async function KartuPeserta() {
  const session = await requireRole("calon_siswa");
  const s = await getSiswa(session.sub);
  const foto = s.dokumen.pas_foto;
  const adaFoto = foto?.ada && ["jpg", "jpeg", "png"].includes(foto.ext);
  const lahir = [s.data.tempat_lahir, s.data.tanggal_lahir ? tanggalPanjang(s.data.tanggal_lahir) : ""].filter(Boolean).join(", ");

  const baris = [
    ["Nama lengkap", s.nama],
    ["NISN", s.data.nisn || s.nisn || "-"],
    ["Tempat, tanggal lahir", lahir || "-"],
    ["Asal sekolah", s.data.asal_sekolah || "-"],
    ["Program pilihan", s.pilihan[0]?.nama || "-"],
    ["Jadwal tes TPA", s.tes.jadwal ? hariTanggalJam(s.tes.jadwal) : "Menunggu jadwal dari panitia"],
    ["Lokasi tes", s.pengaturan.lokasi_tes],
  ];

  return (
    <>
      <Topbar
        judul="Kartu Peserta"
        sub="Kartu ini tampil setelah berkas dan pembayaran terverifikasi."
        nama={s.nama}
        userSub={s.no_daftar}
        notif={hitungTodo(s).length}
      />

      <div className="sw-grid-kartu">
        <div>
          {s.kartuTerbit ? (
            <>
              <div className="sw-kartu">
                <div className="sw-kartu-head">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/aset/logo.png" alt="" className="sw-kartu-logo" />
                  <div>
                    <div className="sw-kartu-judul">Kartu Peserta SPMB</div>
                    <div className="sw-kartu-sub">SMK Citra Negara · Tahun ajaran {s.pengaturan.tahun_ajaran || "2026/2027"}</div>
                  </div>
                  <span className="sw-kartu-no">{s.no_daftar}</span>
                </div>

                <div className="sw-kartu-body">
                  <div className="sw-kartu-foto">
                    {adaFoto ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src="/api/siswa/berkas/pas_foto" alt="Pas foto peserta" />
                    ) : (
                      <span>Pas foto<br />3×4</span>
                    )}
                  </div>
                  <div className="sw-kartu-data">
                    {baris.map(([k, v]) => (
                      <div key={k} className="sw-kartu-row"><span>{k}</span><b>{v}</b></div>
                    ))}
                  </div>
                  <Pola teks={s.no_daftar} />
                </div>

                <div className="sw-kartu-foot">Tunjukkan kartu ini (cetak atau di layar HP) kepada panitia saat tes berlangsung.</div>
              </div>
              <AksiKartu />
            </>
          ) : (
            <div className="sw-card sw-kunci">
              <h3 className="sw-card-title">Kartu peserta belum tersedia</h3>
              <p className="sw-card-sub">
                Kartu terbit otomatis setelah semua berkas wajib terverifikasi dan pembayaran dinyatakan lunas.
              </p>
              <div className="sw-card-foot" style={{ justifyContent: "flex-start" }}>
                <Link href="/dashboard/calon-siswa/status" className="sw-btn sw-btn-sm">Lihat status seleksi</Link>
              </div>
            </div>
          )}
        </div>

        <div className="sw-col sw-kartu-side">
          <div className="sw-card">
            <h3 className="sw-card-title">Yang dibawa saat tes</h3>
            <ul className="sw-list sw-list-plain sw-list-line">
              <li>Kartu peserta (cetak atau digital)</li>
              <li>KTP orang tua atau kartu pelajar</li>
              <li>Alat tulis dan pensil 2B</li>
              <li>Botol minum pribadi</li>
            </ul>
          </div>
          <div className="sw-card">
            <h3 className="sw-card-title">Ketentuan</h3>
            <ul className="sw-list sw-list-plain sw-list-line">
              <li>Hadir 30 menit sebelum tes dimulai.</li>
              <li>Berpakaian seragam SMP atau pakaian rapi.</li>
              <li>Dilarang membawa HP ke ruang tes.</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
