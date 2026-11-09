"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Badge from "../Badge";
import { kirim } from "../kirim";

const HURUF = ["A", "B", "C", "D"];
const KUNCI = ["opsi_a", "opsi_b", "opsi_c", "opsi_d"];

function format(detik) {
  const m = Math.floor(detik / 60);
  const d = detik % 60;
  return `${String(m).padStart(2, "0")}:${String(d).padStart(2, "0")}`;
}

export default function TesRunner({ soal, jawabanAwal, sisaDetik }) {
  const router = useRouter();
  const [jawab, setJawab] = useState(jawabanAwal);
  const [sisa, setSisa] = useState(sisaDetik);
  const [status, setStatus] = useState("Jawaban tersimpan otomatis");
  const [loading, setLoading] = useState(false);
  const sudahKumpul = useRef(false);

  const kumpulkan = useCallback(async () => {
    if (sudahKumpul.current) return;
    sudahKumpul.current = true;
    setLoading(true);
    try {
      await kirim("/api/siswa/tes/selesai", "POST");
    } catch (err) {
      // kalau sudah terkumpul (409) tetap lanjut ke halaman hasil
      if (!/sudah dikumpulkan/i.test(err.message)) {
        sudahKumpul.current = false;
        setLoading(false);
        setStatus(err.message);
        return;
      }
    }
    router.replace("/dashboard/calon-siswa/tes-tpa");
    router.refresh();
  }, [router]);

  // hitung mundur; waktu habis -> kumpulkan otomatis
  useEffect(() => {
    if (sisa <= 0) {
      kumpulkan();
      return undefined;
    }
    const t = setTimeout(() => setSisa((x) => x - 1), 1000);
    return () => clearTimeout(t);
  }, [sisa, kumpulkan]);

  // peringatan sebelum menutup / me-refresh halaman
  useEffect(() => {
    const h = (e) => {
      if (!sudahKumpul.current) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, []);

  async function pilih(soalId, huruf) {
    if (loading) return;
    const lama = jawab[soalId];
    setJawab((p) => ({ ...p, [soalId]: huruf }));
    setStatus("Menyimpan...");
    try {
      await kirim("/api/siswa/tes/jawab", "PUT", { soal_id: soalId, jawaban: huruf });
      setStatus("Jawaban tersimpan otomatis");
    } catch (err) {
      setJawab((p) => ({ ...p, [soalId]: lama }));
      setStatus(`Gagal menyimpan: ${err.message}`);
    }
  }

  function klikKumpul() {
    const kosong = soal.filter((x) => !jawab[x.id]).length;
    const pesan = kosong
      ? `Masih ada ${kosong} soal yang belum dijawab. Kumpulkan sekarang?`
      : "Kumpulkan jawaban sekarang? Jawaban tidak bisa diubah setelah dikumpulkan.";
    if (window.confirm(pesan)) kumpulkan();
  }

  return (
    <div className="sw-shell sw-shell-tes">
      <div className="sw-tes-bar">
        <div className="sw-brand" style={{ margin: 0 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/aset/logo.png" alt="Logo SMK Citra Negara" className="sw-brand-logo" />
          <span className="sw-brand-text">
            <span className="sw-brand-title">Citra Negara</span>
            <span className="sw-brand-sub">SPMB 2026/2027</span>
          </span>
        </div>
        <span className="sw-tes-title">Tes Potensi Akademik</span>
        <div className="sw-tes-timer">
          Sisa waktu
          <b className={sisa <= 300 ? "sw-timer-low" : ""}>{format(Math.max(0, sisa))}</b>
        </div>
      </div>

      <div className="sw-tes-body">
        <div className="sw-banner">
          <h2>Kerjakan semua soal di bawah</h2>
          <p>Pilih satu jawaban paling tepat untuk setiap soal. Jawaban tersimpan otomatis dan tes dikumpulkan otomatis jika waktu habis.</p>
        </div>

        {soal.map((x) => (
          <div key={x.id} className="sw-soal">
            <div className="sw-soal-head">
              <span>Soal {x.nomor}</span>
              <Badge warna={jawab[x.id] ? "ok" : "muted"}>{jawab[x.id] ? "Terisi" : "Belum diisi"}</Badge>
            </div>
            <h3>{x.pertanyaan}</h3>
            <div className="sw-opsi-grid">
              {HURUF.map((h, i) => (
                <button
                  key={h}
                  type="button"
                  className={`sw-opsi${jawab[x.id] === h ? " sw-opsi-on" : ""}`}
                  onClick={() => pilih(x.id, h)}
                >
                  <span className="sw-opsi-huruf">{h}</span>
                  {x[KUNCI[i]]}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="sw-tes-foot">
        <span>{status}</span>
        <button type="button" className="sw-btn" disabled={loading} onClick={klikKumpul}>
          {loading ? "Mengumpulkan..." : "Kumpulkan Jawaban"}
        </button>
      </div>
    </div>
  );
}
