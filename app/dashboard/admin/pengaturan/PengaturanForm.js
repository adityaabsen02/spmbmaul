"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { rupiah, isoKeId, idKeIso, maskTanggal } from "@/lib/format";
import Banner from "../Banner";
import { kirim } from "../kirim";

export default function PengaturanForm({ awal, jurusan, akunAwal }) {
  const router = useRouter();

  const [buka, setBuka] = useState(isoKeId(awal.periode_buka));
  const [tutup, setTutup] = useState(isoKeId(awal.periode_tutup));
  const [tahun, setTahun] = useState(awal.tahun_ajaran || "");
  const [biaya, setBiaya] = useState(String(awal.biaya_pendaftaran || "").replace(/\D/g, ""));
  const [rekening, setRekening] = useState(awal.rekening_pembayaran || "");
  const [kuota, setKuota] = useState(() =>
    Object.fromEntries(jurusan.map((j) => [j.id, String(j.kuota)]))
  );
  const [nama, setNama] = useState(akunAwal.nama);
  const [email, setEmail] = useState(akunAwal.email);

  const [loading, setLoading] = useState(false);
  const [pesan, setPesan] = useState(null);

  async function simpan(e) {
    e.preventDefault();
    setPesan(null);

    const isoBuka = idKeIso(buka);
    const isoTutup = idKeIso(tutup);
    if (isoBuka === null || isoTutup === null) {
      setPesan({ tipe: "bad", teks: "Tanggal harus berformat dd/mm/yyyy, contoh 01/10/2026." });
      return;
    }

    setLoading(true);
    try {
      const data = await kirim("/api/admin/pengaturan", "PUT", {
        periode_buka: isoBuka,
        periode_tutup: isoTutup,
        tahun_ajaran: tahun,
        biaya_pendaftaran: biaya === "" ? "0" : biaya,
        rekening_pembayaran: rekening,
        kuota,
        akun: { nama, email },
      });
      setPesan({ tipe: "ok", teks: data.message });
      router.refresh();
    } catch (err) {
      setPesan({ tipe: "bad", teks: err.message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={simpan}>
      <Banner
        judul="Pengaturan"
        sub="Atur periode, biaya, dan kuota pendaftaran."
        aksi={
          <button type="submit" className="ad-banner-btn" disabled={loading}>
            {loading ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        }
      />

      {pesan && <p className={`ad-msg ad-msg-${pesan.tipe}`}>{pesan.teks}</p>}

      <div className="ad-grid-form">
        <div className="ad-card">
          <h3 className="ad-card-title">Periode Pendaftaran</h3>
          <div className="ad-row-2">
            <label className="ad-field">
              <span>Tanggal buka</span>
              <input
                className="ad-input"
                inputMode="numeric"
                placeholder="dd/mm/yyyy"
                maxLength={10}
                value={buka}
                onChange={(e) => setBuka(maskTanggal(e.target.value))}
              />
            </label>
            <label className="ad-field">
              <span>Tanggal tutup</span>
              <input
                className="ad-input"
                inputMode="numeric"
                placeholder="dd/mm/yyyy"
                maxLength={10}
                value={tutup}
                onChange={(e) => setTutup(maskTanggal(e.target.value))}
              />
            </label>
          </div>
          <label className="ad-field" style={{ marginTop: 16 }}>
            <span>Tahun ajaran</span>
            <input
              className="ad-input"
              placeholder="0000/0000"
              maxLength={20}
              value={tahun}
              onChange={(e) => setTahun(e.target.value)}
            />
          </label>
        </div>

        <div className="ad-card">
          <h3 className="ad-card-title">Biaya Pendaftaran</h3>
          <label className="ad-field">
            <span>Nominal</span>
            <input
              className="ad-input"
              inputMode="numeric"
              placeholder="Rp 000.000"
              value={biaya === "" || Number(biaya) === 0 ? "" : rupiah(biaya)}
              onChange={(e) => setBiaya(e.target.value.replace(/\D/g, "").slice(0, 9))}
            />
          </label>
          <label className="ad-field">
            <span>Nomor rekening tujuan</span>
            <input
              className="ad-input"
              placeholder="Bank · no. Rekening"
              maxLength={150}
              value={rekening}
              onChange={(e) => setRekening(e.target.value)}
            />
          </label>
        </div>

        <div className="ad-card">
          <h3 className="ad-card-title">Kuota per Program</h3>
          {jurusan.length === 0 && <p className="ad-empty">Belum ada data program keahlian.</p>}
          <div className="ad-row-2" style={{ rowGap: 16 }}>
            {jurusan.map((j) => (
              <label key={j.id} className="ad-field">
                <span>{j.nama}</span>
                <input
                  className="ad-input"
                  inputMode="numeric"
                  placeholder="000"
                  maxLength={4}
                  value={kuota[j.id]}
                  onChange={(e) =>
                    setKuota((prev) => ({ ...prev, [j.id]: e.target.value.replace(/\D/g, "") }))
                  }
                />
              </label>
            ))}
          </div>
        </div>

        <div className="ad-card">
          <h3 className="ad-card-title">Akun Admin</h3>
          <label className="ad-field">
            <span>Nama Admin</span>
            <input
              className="ad-input"
              placeholder="Nama Admin"
              maxLength={100}
              value={nama}
              onChange={(e) => setNama(e.target.value)}
            />
          </label>
          <label className="ad-field">
            <span>Email</span>
            <input
              className="ad-input"
              type="email"
              placeholder="email@sekolah.sch.id"
              maxLength={150}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
        </div>
      </div>
    </form>
  );
}
