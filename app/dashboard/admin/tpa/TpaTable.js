"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { tanggalJam } from "@/lib/format";
import Badge from "../Badge";
import { kirim } from "../kirim";

export default function TpaTable({ rows }) {
  const router = useRouter();
  const [dipilih, setDipilih] = useState(null);
  const [jadwal, setJadwal] = useState("");
  const [nilai, setNilai] = useState("");
  const [loading, setLoading] = useState(false);
  const [pesan, setPesan] = useState(null);

  function buka(r) {
    setDipilih(r);
    setJadwal(r.jadwal_input || "");
    setNilai(r.nilai === null ? "" : String(r.nilai));
    setPesan(null);
  }

  async function simpan(e) {
    e.preventDefault();
    setLoading(true);
    setPesan(null);

    try {
      await kirim(`/api/admin/tpa/${dipilih.id}`, "PUT", { jadwal, nilai });
      setDipilih(null);
      router.refresh();
    } catch (err) {
      setPesan(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="ad-card">
      <div className="ad-tablewrap">
        <table className="ad-table">
          <thead>
            <tr>
              <th>No. Daftar</th>
              <th>Nama</th>
              <th>Jadwal Tes</th>
              <th>Nilai</th>
              <th>Status</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} className="ad-empty">Belum ada peserta.</td>
              </tr>
            )}
            {rows.map((r) => {
              const sudah = r.nilai !== null;
              return (
                <tr key={r.id}>
                  <td>{r.no_daftar}</td>
                  <td>{r.nama}</td>
                  <td>{r.jadwal ? tanggalJam(r.jadwal) : "–"}</td>
                  <td>{sudah ? r.nilai : "–"}</td>
                  <td>
                    <Badge grup="tpa" nilai={sudah ? "selesai" : "belum"} />
                  </td>
                  <td className="ad-right">
                    <button type="button" className="ad-btn" onClick={() => buka(r)}>
                      {sudah ? "Lihat" : "Input Nilai"}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {dipilih && (
        <div className="ad-modal-bg" onClick={() => setDipilih(null)}>
          <form className="ad-modal" onClick={(e) => e.stopPropagation()} onSubmit={simpan}>
            <h3>{dipilih.nama}</h3>
            <p className="ad-modal-sub">{dipilih.no_daftar}</p>

            {pesan && <p className="ad-msg ad-msg-bad">{pesan}</p>}

            <label className="ad-field">
              <span>Jadwal tes</span>
              <input
                className="ad-input"
                type="datetime-local"
                value={jadwal}
                onChange={(e) => setJadwal(e.target.value)}
              />
            </label>

            <label className="ad-field">
              <span>Nilai (0–100), kosongkan jika belum dinilai</span>
              <input
                className="ad-input"
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={nilai}
                onChange={(e) => setNilai(e.target.value)}
              />
            </label>

            <div className="ad-modal-foot">
              <button type="button" className="ad-btn ad-btn-outline" onClick={() => setDipilih(null)}>
                Batal
              </button>
              <button type="submit" className="ad-btn" disabled={loading}>
                {loading ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
