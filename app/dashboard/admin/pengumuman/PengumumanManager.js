"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { tanggal } from "@/lib/format";
import Badge from "../Badge";
import { kirim } from "../kirim";

function ringkas(isi) {
  const teks = String(isi || "").replace(/\s+/g, " ").trim();
  return teks.length > 90 ? teks.slice(0, 90).trimEnd() + "…" : teks;
}

export default function PengumumanManager({ daftar }) {
  const router = useRouter();
  const [judul, setJudul] = useState("");
  const [isi, setIsi] = useState("");
  const [loading, setLoading] = useState(false);
  const [pesan, setPesan] = useState(null);

  async function publikasikan(e) {
    e.preventDefault();
    setPesan(null);

    if (!judul.trim() || !isi.trim()) {
      setPesan({ tipe: "bad", teks: "Judul dan isi pengumuman wajib diisi." });
      return;
    }

    setLoading(true);
    try {
      const data = await kirim("/api/admin/pengumuman", "POST", { judul, isi, status: "terbit" });
      setJudul("");
      setIsi("");
      setPesan({ tipe: "ok", teks: data.message });
      router.refresh();
    } catch (err) {
      setPesan({ tipe: "bad", teks: err.message });
    } finally {
      setLoading(false);
    }
  }

  async function ubahStatus(p, status) {
    setPesan(null);
    try {
      await kirim(`/api/admin/pengumuman/${p.id}`, "PATCH", { status });
      router.refresh();
    } catch (err) {
      setPesan({ tipe: "bad", teks: err.message });
    }
  }

  async function hapus(p) {
    if (!window.confirm(`Hapus pengumuman "${p.judul}"?`)) return;
    setPesan(null);
    try {
      await kirim(`/api/admin/pengumuman/${p.id}`, "DELETE");
      router.refresh();
    } catch (err) {
      setPesan({ tipe: "bad", teks: err.message });
    }
  }

  return (
    <div className="ad-grid-p">
      <div className="ad-card">
        <h3 className="ad-card-title" style={{ marginBottom: 4 }}>Daftar Pengumuman</h3>

        {daftar.length === 0 && <p className="ad-empty">Belum ada pengumuman.</p>}

        {daftar.map((p) => (
          <div key={p.id} className="ad-item">
            <div className="ad-item-text">
              <b>{p.judul}</b>
              <p>
                {tanggal(p.dibuat)} · {ringkas(p.isi)}
              </p>
            </div>
            <div className="ad-item-side">
              <Badge grup="pengumuman" nilai={p.status} />
              {/* Muncul saat kursor di atas baris */}
              <div className="ad-item-actions">
                {p.status === "draf" ? (
                  <button type="button" className="ad-link-btn" onClick={() => ubahStatus(p, "terbit")}>
                    Terbitkan
                  </button>
                ) : (
                  <button type="button" className="ad-link-btn" onClick={() => ubahStatus(p, "draf")}>
                    Jadikan draf
                  </button>
                )}
                <button type="button" className="ad-link-btn ad-link-red" onClick={() => hapus(p)}>
                  Hapus
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <form className="ad-card" onSubmit={publikasikan}>
        <h3 className="ad-card-title" style={{ marginBottom: 14 }}>Buat Pengumuman</h3>

        {pesan && <p className={`ad-msg ad-msg-${pesan.tipe}`}>{pesan.teks}</p>}

        <label className="ad-field">
          <span>Judul</span>
          <input
            className="ad-input"
            value={judul}
            maxLength={150}
            placeholder="Judul pengumuman"
            onChange={(e) => setJudul(e.target.value)}
          />
        </label>

        <label className="ad-field">
          <span>Isi</span>
          <textarea
            className="ad-textarea"
            value={isi}
            maxLength={5000}
            placeholder="Tulis isi pengumuman"
            onChange={(e) => setIsi(e.target.value)}
          />
        </label>

        <button type="submit" className="ad-btn ad-btn-wide" disabled={loading}>
          {loading ? "Memproses..." : "Publikasikan"}
        </button>
      </form>
    </div>
  );
}
