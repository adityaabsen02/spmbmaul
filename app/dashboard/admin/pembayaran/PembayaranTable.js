"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { rupiah, tanggal } from "@/lib/format";
import Badge from "../Badge";
import { kirim } from "../kirim";

const GAMBAR = ["png", "jpg", "jpeg", "webp"];

export default function PembayaranTable({ rows }) {
  const router = useRouter();
  const [dipilih, setDipilih] = useState(null);
  const [catatan, setCatatan] = useState("");
  const [loading, setLoading] = useState(false);
  const [pesan, setPesan] = useState(null);
  const [pesanTabel, setPesanTabel] = useState(null);

  function buka(r) {
    setDipilih(r);
    setCatatan(r.catatan || "");
    setPesan(null);
  }

  async function proses(r, aksi, teks = "") {
    setLoading(true);
    setPesan(null);
    setPesanTabel(null);

    try {
      await kirim(`/api/admin/pembayaran/${r.id}`, "POST", { aksi, catatan: teks });
      setDipilih(null);
      router.refresh();
    } catch (e) {
      if (dipilih) setPesan(e.message);
      else setPesanTabel(e.message);
    } finally {
      setLoading(false);
    }
  }

  function konfirmasiCepat(r) {
    if (window.confirm(`Konfirmasi pembayaran ${r.nama} sebesar ${rupiah(r.nominal)}?`)) {
      proses(r, "konfirmasi");
    }
  }

  return (
    <div className="ad-card">
      {pesanTabel && <p className="ad-msg ad-msg-bad">{pesanTabel}</p>}

      <div className="ad-tablewrap">
        <table className="ad-table">
          <colgroup>
            <col style={{ width: "11.9%" }} />
            <col style={{ width: "17%" }} />
            <col style={{ width: "16.5%" }} />
            <col style={{ width: "14.2%" }} />
            <col style={{ width: "13.4%" }} />
            <col style={{ width: "27%" }} />
          </colgroup>
          <thead>
            <tr>
              <th>No. Daftar</th>
              <th>Nama</th>
              <th>Tanggal Transfer</th>
              <th>Nominal</th>
              <th>Status</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} className="ad-empty" style={{ height: 80 }}>Belum ada pembayaran masuk.</td>
              </tr>
            )}
            {rows.map((r) => (
              <tr key={r.id}>
                <td>{r.no_daftar}{r.jenis === "daftar_ulang" && <div style={{ color: "#1d6413", fontSize: 11, fontWeight: 700 }}>Daftar ulang</div>}</td>
                <td title={r.nama}>{r.nama}</td>
                <td>{tanggal(r.tanggal)}</td>
                <td>{rupiah(r.nominal)}</td>
                <td className="ad-nowrap-ok">
                  <Badge grup="bayar" nilai={r.status} />
                </td>
                <td className="ad-nowrap-ok">
                  <div className="ad-actions">
                    <button type="button" className="ad-btn ad-btn-outline" onClick={() => buka(r)}>
                      Lihat Bukti
                    </button>
                    {r.status === "menunggu" && (
                      <button
                        type="button"
                        className="ad-btn"
                        disabled={loading}
                        onClick={() => konfirmasiCepat(r)}
                      >
                        Konfirmasi
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {dipilih && (
        <div className="ad-modal-bg" onClick={() => setDipilih(null)}>
          <div className="ad-modal" onClick={(e) => e.stopPropagation()}>
            <h3>{dipilih.nama}</h3>
            <p className="ad-modal-sub">
              {dipilih.no_daftar} · {rupiah(dipilih.nominal)} · {tanggal(dipilih.tanggal)}
            </p>

            <div className="ad-preview" style={{ height: 240 }}>
              {!dipilih.adaBukti && "Bukti pembayaran belum diunggah."}
              {dipilih.adaBukti && GAMBAR.includes(dipilih.ext) && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={`/api/admin/berkas/bukti/${dipilih.id}`} alt="Bukti pembayaran" />
              )}
              {dipilih.adaBukti && dipilih.ext === "pdf" && (
                <iframe src={`/api/admin/berkas/bukti/${dipilih.id}`} title="Bukti pembayaran" />
              )}
            </div>

            <label className="ad-field" style={{ marginTop: 16 }}>
              <span>Catatan (wajib diisi jika ditolak)</span>
              <textarea
                className="ad-textarea"
                style={{ height: 76 }}
                value={catatan}
                maxLength={255}
                onChange={(e) => setCatatan(e.target.value)}
              />
            </label>

            {pesan && <p className="ad-msg ad-msg-bad">{pesan}</p>}

            <div className="ad-modal-foot">
              <button type="button" className="ad-btn ad-btn-outline" onClick={() => setDipilih(null)}>
                Tutup
              </button>
              <button
                type="button"
                className="ad-btn ad-btn-red"
                disabled={loading}
                onClick={() => {
                  if (!catatan.trim()) {
                    setPesan("Isi catatan dulu sebelum menolak pembayaran.");
                    return;
                  }
                  proses(dipilih, "tolak", catatan);
                }}
              >
                Tolak
              </button>
              <button
                type="button"
                className="ad-btn"
                disabled={loading}
                onClick={() => proses(dipilih, "konfirmasi", catatan)}
              >
                Konfirmasi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
