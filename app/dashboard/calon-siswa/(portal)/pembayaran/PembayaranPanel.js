"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Badge from "../../Badge";
import { kirim } from "../../kirim";

const STATUS = {
  belum: ["warn", "Menunggu pembayaran", "Menunggu"],
  menunggu: ["warn", "Menunggu konfirmasi", "Menunggu"],
  lunas: ["ok", "Lunas", "Lunas"],
  ditolak: ["bad", "Ditolak", "Ditolak"],
};

// Daftar metode persis seperti desain (Frame 9). Tiga bank memakai nomor dari Pengaturan admin.
const METODE = [
  { kode: "BRI", nama: "Virtual Account BRI", bank: "BRI", app: "Buka aplikasi mobile banking atau ATM BRI", menu: "Pilih menu BRIVA, masukkan nomor VA", ada: true },
  { kode: "BCA", nama: "Virtual Account BCA", bank: "BCA", app: "Buka aplikasi m-BCA atau ATM BCA", menu: "Pilih menu BCA Virtual Account, masukkan nomor VA", ada: true },
  { kode: "MDR", nama: "Virtual Account Mandiri", bank: "Mandiri", app: "Buka aplikasi Livin' by Mandiri atau ATM Mandiri", menu: "Pilih menu Multipayment, masukkan nomor VA", ada: true },
  { kode: "QR", nama: "QRIS", jenis: "qris", ada: true },
  { kode: "MKT", nama: "Minimarket (Alfamart / Indomaret)", jenis: "mkt", ada: true },
];

export default function PembayaranPanel({ info }) {
  const router = useRouter();
  const input = useRef(null);
  const [sibuk, setSibuk] = useState(false);
  const [pesan, setPesan] = useState(null);
  const [tersalin, setTersalin] = useState(false);
  const [dipilih, setDipilih] = useState(0);
  const daftarRef = useRef(null);

  const [warna, teksCard, teksRiwayat] = STATUS[info.status] || STATUS.belum;
  const m = METODE[dipilih];
  const nomor = info.nomorPer[m.kode] || "";
  const adaRek = Boolean(nomor) && m.jenis !== "qris";
  const lunas = info.status === "lunas";
  async function salin() {
    try {
      await navigator.clipboard.writeText(nomor.replace(/[^0-9A-Za-z]/g, ""));
      setTersalin(true);
      setTimeout(() => setTersalin(false), 2000);
    } catch {
      setPesan({ tipe: "bad", teks: "Gagal menyalin. Salin nomor secara manual." });
    }
  }

  async function unggah(file) {
    setPesan(null);
    if (file.size > 2 * 1024 * 1024) {
      setPesan({ tipe: "bad", teks: "Ukuran berkas maksimal 2 MB." });
      return;
    }
    const form = new FormData();
    form.append("file", file);
    setSibuk(true);
    try {
      const data = await kirim("/api/siswa/bukti", "POST", form);
      setPesan({ tipe: "ok", teks: data.message });
      router.refresh();
    } catch (err) {
      setPesan({ tipe: "bad", teks: err.message });
    } finally {
      setSibuk(false);
    }
  }

  return (
    <div>
      {pesan && <p className={`sw-msg sw-msg-${pesan.tipe}`}>{pesan.teks}</p>}

      <div className="sw-grid-pay">
        <div>
          <div className="sw-card">
            <div className="sw-card-head">
              <h3 className="sw-card-title">Tagihan biaya pendaftaran</h3>
              <Badge warna={warna}>{teksCard}</Badge>
            </div>
            <div className="sw-amount">{info.nominal}</div>

            <div className="sw-kv"><span>Nomor tagihan</span><b>{info.invoice}</b></div>
            <div className="sw-kv"><span>Keterangan</span><b>{info.keterangan}</b></div>
            <div className="sw-kv"><span>Tanggal tagihan</span><b>{info.tanggalTagihan}</b></div>
            <div className="sw-kv"><span>Batas pembayaran</span><b>{info.batas}</b></div>

            {m.jenis === "qris" ? (
              <div className="sw-qris">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/aset/qris.png" alt="Kode QRIS pembayaran" />
                <div>
                  <small>Metode QRIS</small>
                  <strong>Scan dengan aplikasi bank atau e-wallet</strong>
                  <p>Masukkan nominal {info.nominal} lalu selesaikan pembayaran. Simpan bukti transaksinya.</p>
                </div>
              </div>
            ) : (
              <div className={`sw-va${adaRek ? "" : " sw-va-empty"}`}>
                <div>
                  <small>{m.jenis === "mkt" ? "Kode pembayaran Alfamart / Indomaret" : `Nomor Virtual Account ${m.bank}`}</small>
                  <strong>{nomor}</strong>
                  {m.jenis === "mkt" && <small className="sw-va-ref">Sebutkan: pembayaran SPMB SMK Citra Negara · {info.invoice}</small>}
                </div>
                {adaRek && (
                  <button type="button" className="sw-btn sw-btn-out sw-btn-sm" onClick={salin}>
                    {tersalin ? "Tersalin" : m.jenis === "mkt" ? "Salin kode" : "Salin nomor"}
                  </button>
                )}
              </div>
            )}

            {info.status === "ditolak" && (
              <p className="sw-note">{info.catatan || "Bukti pembayaran ditolak. Silakan unggah ulang bukti yang jelas."}</p>
            )}

            <div className="sw-pay-actions">
              {info.adaBukti && (
                <a className="sw-btn sw-btn-out" href="/api/siswa/bukti" target="_blank" rel="noreferrer">
                  Lihat bukti
                </a>
              )}
              {!lunas && (
                <button type="button" className="sw-btn sw-btn-out" onClick={() => daftarRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })}>
                  Ganti metode
                </button>
              )}
              {!lunas && (
                <>
                  <input
                    ref={input}
                    type="file"
                    className="sw-file-input"
                    accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                    onChange={(e) => { if (e.target.files[0]) unggah(e.target.files[0]); e.target.value = ""; }}
                  />
                  <button type="button" className="sw-btn" disabled={sibuk} onClick={() => input.current?.click()}>
                    {sibuk ? "Mengunggah..." : info.adaBukti ? "Unggah ulang bukti" : "Saya sudah bayar"}
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="sw-card">
            <h3 className="sw-card-title">Riwayat pembayaran</h3>
            <div className="sw-hist">
              <span>{info.invoice} · Biaya pendaftaran</span>
              <span className="sw-hist-r">
                <b>{info.nominal}</b>
                <Badge warna={warna}>{teksRiwayat}</Badge>
              </span>
            </div>
          </div>
        </div>

        <div>
          <div className="sw-card" ref={daftarRef}>
            <h3 className="sw-card-title">Metode pembayaran</h3>
            <p className="sw-card-sub">Pilih salah satu metode di bawah.</p>
            {METODE.map((x, i) => (
              <button
                key={x.kode}
                type="button"
                className={`sw-metode${i === dipilih ? " sw-metode-on" : ""}`}
                onClick={() => setDipilih(i)}
              >
                <span className="sw-metode-kode">{x.kode}</span>
                {x.nama}
                {i === dipilih && <span className="sw-metode-cek">✓</span>}
              </button>
            ))}
          </div>

          <div className="sw-card">
            <h3 className="sw-card-title">Cara bayar</h3>
            <ol className="sw-steps-list">
              {m.jenis === "qris" ? (
                <>
                  <li>1. Buka aplikasi mobile banking atau e-wallet yang mendukung QRIS</li>
                  <li>2. Pilih menu Scan / Bayar, lalu arahkan kamera ke kode QRIS</li>
                  <li>3. Masukkan nominal {info.nominal} lalu konfirmasi</li>
                  <li>4. Simpan bukti, klik "Saya sudah bayar" dan unggah buktinya. Status berubah dalam 1×24 jam</li>
                </>
              ) : m.jenis === "mkt" ? (
                <>
                  <li>1. Datang ke kasir Alfamart atau Indomaret terdekat</li>
                  <li>2. Sebutkan ingin membayar tagihan SPMB SMK Citra Negara dan berikan kode pembayaran di samping</li>
                  <li>3. Bayar {info.nominal} (belum termasuk biaya admin kasir, jika ada)</li>
                  <li>4. Foto struk, klik "Saya sudah bayar" dan unggah struknya. Status berubah dalam 1×24 jam</li>
                </>
              ) : (
                <>
                  <li>1. {m.app}</li>
                  <li>2. {m.menu}</li>
                  <li>3. Cek nominal {info.nominal} lalu konfirmasi</li>
                  <li>4. Klik "Saya sudah bayar" dan unggah bukti. Status berubah dalam 1×24 jam</li>
                </>
              )}
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
