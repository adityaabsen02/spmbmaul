"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { JENIS_DOKUMEN } from "@/lib/format";
import Badge from "../Badge";
import { kirim } from "../kirim";

const GAMBAR = ["png", "jpg", "jpeg", "webp"];

export default function VerifikasiPanel({ pendaftar, dokumen, berikutnyaId }) {
  const router = useRouter();

  // Perubahan yang baru dilakukan, supaya tampilan langsung berubah tanpa menunggu refresh.
  const [lokal, setLokal] = useState({});
  const [catatan, setCatatan] = useState({});
  const [loading, setLoading] = useState(false);
  const [pesan, setPesan] = useState(null);

  const gabung = (d) => (d ? { ...d, ...(lokal[d.jenis] || {}) } : null);
  const semua = JENIS_DOKUMEN.map((j) => ({
    ...j,
    dok: gabung(dokumen.find((d) => d.jenis === j.key)),
  }));

  const [aktif, setAktif] = useState(
    () => (semua.find((s) => s.dok?.status === "menunggu") || semua[0]).key
  );

  const saatIni = semua.find((s) => s.key === aktif);
  const dok = saatIni.dok;
  const teksCatatan = catatan[aktif] ?? dok?.catatan ?? "";

  async function proses(aksi) {
    if (!dok) return;

    const teks = teksCatatan.trim();
    if (aksi === "tolak" && !teks) {
      setPesan({ tipe: "bad", teks: "Isi catatan untuk pendaftar dulu sebelum menolak berkas." });
      return;
    }

    setLoading(true);
    setPesan(null);

    try {
      await kirim(`/api/admin/dokumen/${dok.id}`, "POST", { aksi, catatan: teks });

      const baru = {
        status: aksi === "tolak" ? "ditolak" : "terverifikasi",
        catatan: teks || null,
      };
      setLokal((prev) => ({ ...prev, [aktif]: baru }));

      // Pindah otomatis ke berkas berikutnya yang masih menunggu.
      const lanjut = semua.find(
        (s) => s.key !== aktif && s.dok && s.dok.status === "menunggu"
      );

      if (lanjut) {
        setAktif(lanjut.key);
        router.refresh();
      } else if (berikutnyaId) {
        // Semua berkas pendaftar ini sudah diproses -> buka pendaftar berikutnya.
        router.push(`/dashboard/admin/verifikasi?id=${berikutnyaId}`);
      } else {
        setPesan({ tipe: "ok", teks: "Semua berkas sudah diproses. Tidak ada antrean lagi." });
        router.refresh();
      }
    } catch (e) {
      setPesan({ tipe: "bad", teks: e.message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="ad-grid-v">
      <div className="ad-card">
        <div className="ad-tabs">
          {semua.map((s) => (
            <button
              key={s.key}
              type="button"
              className={s.key === aktif ? "ad-tab ad-tab-active" : "ad-tab"}
              onClick={() => {
                setAktif(s.key);
                setPesan(null);
              }}
            >
              {s.label}
            </button>
          ))}
        </div>

        <div className="ad-preview">
          {!dok && "Berkas ini belum diunggah oleh pendaftar."}
          {dok && !dok.adaFile && "Berkas belum tersedia di server."}
          {dok && dok.adaFile && GAMBAR.includes(dok.ext) && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={`/api/admin/berkas/dokumen/${dok.id}`} alt={`Pratinjau ${saatIni.label}`} />
          )}
          {dok && dok.adaFile && dok.ext === "pdf" && (
            <iframe src={`/api/admin/berkas/dokumen/${dok.id}`} title={`Pratinjau ${saatIni.label}`} />
          )}
          {dok && dok.adaFile && !GAMBAR.includes(dok.ext) && dok.ext !== "pdf" && "Pratinjau tidak tersedia untuk jenis berkas ini."}
        </div>
      </div>

      <div className="ad-card">
        <h3 className="ad-card-title" style={{ marginBottom: 6 }}>Data Pendaftar</h3>

        <div className="ad-kv"><span>Nama</span><b>{pendaftar.nama}</b></div>
        <div className="ad-kv"><span>Asal Sekolah</span><b>{pendaftar.asal_sekolah || "-"}</b></div>
        <div className="ad-kv"><span>Program</span><b>{pendaftar.program_nama || pendaftar.program || "-"}</b></div>
        <div className="ad-kv">
          <span>Status Berkas</span>
          <b>{dok ? <Badge grup="berkas" nilai={dok.status} /> : "Belum diunggah"}</b>
        </div>

        <label className="ad-field" style={{ marginTop: 18 }}>
          <span>Catatan untuk pendaftar</span>
          <textarea
            className="ad-textarea"
            style={{ height: 94 }}
            placeholder="Tulis alasan jika berkas ditolak"
            value={teksCatatan}
            disabled={!dok}
            onChange={(e) => setCatatan((prev) => ({ ...prev, [aktif]: e.target.value }))}
            maxLength={255}
          />
        </label>

        {pesan && <p className={`ad-msg ad-msg-${pesan.tipe}`} style={{ marginTop: 14, marginBottom: 0 }}>{pesan.teks}</p>}

        <div className="ad-btn-row">
          <button
            type="button"
            className="ad-btn ad-btn-red ad-btn-wide"
            disabled={!dok || loading}
            onClick={() => proses("tolak")}
          >
            Tolak
          </button>
          <button
            type="button"
            className="ad-btn ad-btn-wide"
            disabled={!dok || loading}
            onClick={() => proses("verifikasi")}
          >
            Verifikasi
          </button>
        </div>
      </div>
    </div>
  );
}
