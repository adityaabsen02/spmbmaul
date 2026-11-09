"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { jadwalTeks, maskTanggal, idKeIso } from "@/lib/format";
import Badge from "../Badge";
import Banner from "../Banner";
import { kirim } from "../kirim";

// "08.00" / "08:00" / "0800" -> "08:00" (atau null kalau tidak valid)
function jamKeIso(teks) {
  const m = /^(\d{1,2})[.:]?(\d{2})$/.exec(String(teks || "").trim());
  if (!m) return null;
  const h = Number(m[1]);
  const mnt = Number(m[2]);
  if (h > 23 || mnt > 59) return null;
  return `${String(h).padStart(2, "0")}:${m[2]}`;
}

export default function TpaView({ rows, stat }) {
  const router = useRouter();

  // --- Modal input nilai (per peserta)
  const [dipilih, setDipilih] = useState(null);
  const [jadwal, setJadwal] = useState("");
  const [nilai, setNilai] = useState("");

  // --- Modal atur jadwal (massal)
  const [aturJadwal, setAturJadwal] = useState(false);
  const [tgl, setTgl] = useState("");
  const [jamTes, setJamTes] = useState("");
  const [cakupan, setCakupan] = useState("belum");

  const [loading, setLoading] = useState(false);
  const [pesan, setPesan] = useState(null);

  function buka(r) {
    setDipilih(r);
    setJadwal(r.jadwal_input || "");
    setNilai(r.nilai === null ? "" : String(r.nilai));
    setPesan(null);
  }

  async function simpanNilai(e) {
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

  async function simpanJadwal(e) {
    e.preventDefault();
    setPesan(null);

    const iso = idKeIso(tgl);
    const jamIso = jamKeIso(jamTes);
    if (!iso) return setPesan("Tanggal harus berformat dd/mm/yyyy.");
    if (!jamIso) return setPesan("Jam harus berformat 00.00, contoh 08.00.");

    setLoading(true);
    try {
      await kirim("/api/admin/tpa/jadwal", "POST", { tanggal: iso, jam: jamIso, cakupan });
      setAturJadwal(false);
      setTgl("");
      setJamTes("");
      router.refresh();
    } catch (err) {
      setPesan(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Banner
        judul="Hasil Tes TPA"
        sub="Atur jadwal dan input nilai tes peserta."
        aksi={
          <button
            type="button"
            className="ad-banner-btn"
            onClick={() => {
              setPesan(null);
              setAturJadwal(true);
            }}
          >
            Atur Jadwal
          </button>
        }
      />

      <div className="ad-stats">
        <div className="ad-stat">
          <div className="ad-stat-label">Peserta Terjadwal</div>
          <div className="ad-stat-value">{String(stat.terjadwal).padStart(3, "0")}</div>
        </div>
        <div className="ad-stat">
          <div className="ad-stat-label">Sudah Dinilai</div>
          <div className="ad-stat-value">{String(stat.dinilai).padStart(3, "0")}</div>
        </div>
        <div className="ad-stat">
          <div className="ad-stat-label">Rata-rata Nilai</div>
          <div className="ad-stat-value">
            {stat.rata === null ? "–" : String(Math.round(stat.rata)).padStart(2, "0")}
          </div>
        </div>
      </div>

      <div className="ad-card">
        <div className="ad-tablewrap">
          <table className="ad-table">
            <colgroup>
              <col style={{ width: "14%" }} />
              <col style={{ width: "19.9%" }} />
              <col style={{ width: "24.8%" }} />
              <col style={{ width: "6.7%" }} />
              <col style={{ width: "17.5%" }} />
              <col style={{ width: "17.1%" }} />
            </colgroup>
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
                  <td colSpan={6} className="ad-empty" style={{ height: 80 }}>Belum ada peserta.</td>
                </tr>
              )}
              {rows.map((r) => {
                const sudah = r.nilai !== null;
                return (
                  <tr key={r.id}>
                    <td>{r.no_daftar}</td>
                    <td title={r.nama}>{r.nama}</td>
                    <td>{r.jadwal ? jadwalTeks(r.jadwal) : "–"}</td>
                    <td>{sudah ? r.nilai : "–"}</td>
                    <td className="ad-nowrap-ok">
                      <Badge grup="tpa" nilai={sudah ? "selesai" : "belum"} />
                    </td>
                    <td className="ad-nowrap-ok">
                      <button type="button" className="ad-btn" onClick={() => buka(r)}>
                        {sudah ? "Ubah" : "Input Nilai"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {dipilih && (
        <div className="ad-modal-bg" onClick={() => setDipilih(null)}>
          <form className="ad-modal" onClick={(e) => e.stopPropagation()} onSubmit={simpanNilai}>
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

      {aturJadwal && (
        <div className="ad-modal-bg" onClick={() => setAturJadwal(false)}>
          <form className="ad-modal" onClick={(e) => e.stopPropagation()} onSubmit={simpanJadwal}>
            <h3>Atur Jadwal Tes</h3>
            <p className="ad-modal-sub">Tentukan tanggal dan jam tes TPA untuk peserta.</p>

            {pesan && <p className="ad-msg ad-msg-bad">{pesan}</p>}

            <div className="ad-row-2">
              <label className="ad-field">
                <span>Tanggal tes</span>
                <input
                  className="ad-input"
                  inputMode="numeric"
                  placeholder="dd/mm/yyyy"
                  maxLength={10}
                  value={tgl}
                  onChange={(e) => setTgl(maskTanggal(e.target.value))}
                />
              </label>
              <label className="ad-field">
                <span>Jam</span>
                <input
                  className="ad-input"
                  inputMode="numeric"
                  placeholder="00.00"
                  maxLength={5}
                  value={jamTes}
                  onChange={(e) => setJamTes(e.target.value.replace(/[^\d.:]/g, ""))}
                />
              </label>
            </div>

            <label className="ad-field" style={{ marginTop: 16 }}>
              <span>Berlaku untuk</span>
              <select className="ad-select" value={cakupan} onChange={(e) => setCakupan(e.target.value)}>
                <option value="belum">Peserta yang belum punya jadwal</option>
                <option value="semua">Semua peserta (timpa jadwal lama)</option>
              </select>
            </label>

            <div className="ad-modal-foot">
              <button type="button" className="ad-btn ad-btn-outline" onClick={() => setAturJadwal(false)}>
                Batal
              </button>
              <button type="submit" className="ad-btn" disabled={loading}>
                {loading ? "Menyimpan..." : "Terapkan"}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
