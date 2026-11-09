"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Badge from "../../Badge";
import { kirim } from "../../kirim";

const STATUS = {
  belum: ["warn", "Menunggu pembayaran"],
  menunggu: ["warn", "Menunggu konfirmasi"],
  lunas: ["ok", "Lunas"],
  ditolak: ["bad", "Ditolak"],
};

const METODE = [
  { kode: "BRI", nama: "Virtual Account BRI", bank: "BRI" },
  { kode: "BCA", nama: "Virtual Account BCA", bank: "BCA" },
  { kode: "MDR", nama: "Virtual Account Mandiri", bank: "Mandiri" },
  { kode: "QR", nama: "QRIS", jenis: "qris" },
  { kode: "MKT", nama: "Minimarket (Alfamart / Indomaret)", jenis: "mkt" },
];

export default function BayarDaftarUlang({ info }) {
  const router = useRouter();
  const input = useRef(null);
  const [dipilih, setDipilih] = useState(0);
  const [sibuk, setSibuk] = useState(false);
  const [pesan, setPesan] = useState(null);
  const [tersalin, setTersalin] = useState(false);

  const m = METODE[dipilih];
  const nomor = info.nomorPer[m.kode] || "";
  const [warna, teks] = STATUS[info.status] || STATUS.belum;
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
      const data = await kirim("/api/siswa/bukti-du", "POST", form);
      setPesan({ tipe: "ok", teks: data.message });
      router.refresh();
    } catch (err) {
      setPesan({ tipe: "bad", teks: err.message });
    } finally {
      setSibuk(false);
    }
  }

  return (
    <div className="sw-card">
      <div className="sw-card-head">
        <h3 className="sw-card-title">Pembayaran daftar ulang</h3>
        <Badge warna={warna}>{teks}</Badge>
      </div>
      <div className="sw-amount">{info.nominal}</div>
      <p className="sw-card-sub">Batas pembayaran {info.batas}. Nomor tagihan {info.invoice}.</p>

      {pesan && <p className={`sw-msg sw-msg-${pesan.tipe}`}>{pesan.teks}</p>}

      {!lunas && (
        <label className="sw-field" style={{ marginTop: 16 }}>
          <span>Metode pembayaran</span>
          <select className="sw-select" value={dipilih} onChange={(e) => setDipilih(Number(e.target.value))}>
            {METODE.map((x, i) => <option key={x.kode} value={i}>{x.nama}</option>)}
          </select>
        </label>
      )}

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
        <div className="sw-va">
          <div>
            <small>{m.jenis === "mkt" ? "Kode pembayaran Alfamart / Indomaret" : `Nomor Virtual Account ${m.bank}`}</small>
            <strong>{nomor}</strong>
            {m.jenis === "mkt" && <small className="sw-va-ref">Sebutkan: daftar ulang SPMB SMK Citra Negara · {info.invoice}</small>}
          </div>
          <button type="button" className="sw-btn sw-btn-out sw-btn-sm" onClick={salin}>
            {tersalin ? "Tersalin" : m.jenis === "mkt" ? "Salin kode" : "Salin nomor"}
          </button>
        </div>
      )}

      {info.status === "ditolak" && (
        <p className="sw-note">{info.catatan || "Bukti pembayaran ditolak. Silakan unggah ulang bukti yang jelas."}</p>
      )}

      <div className="sw-pay-actions">
        {info.adaBukti && (
          <a className="sw-btn sw-btn-out" href="/api/siswa/bukti-du" target="_blank" rel="noreferrer">Lihat bukti</a>
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
  );
}
