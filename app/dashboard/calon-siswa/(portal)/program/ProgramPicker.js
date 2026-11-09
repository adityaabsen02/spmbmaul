"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { JALUR } from "@/lib/siswa-konst";
import Badge from "../../Badge";
import { kirim } from "../../kirim";

export default function ProgramPicker({ program, awal, jalurAwal }) {
  const router = useRouter();
  const [pilih, setPilih] = useState(awal);
  const [jalur, setJalur] = useState(jalurAwal);
  const [loading, setLoading] = useState(false);
  const [pesan, setPesan] = useState(null);

  function ubah(id) {
    setPesan(null);
    if (pilih.includes(id)) {
      setPilih(pilih.filter((x) => x !== id));
    } else if (pilih.length >= 2) {
      setPesan({ tipe: "bad", teks: "Maksimal 2 program keahlian. Batalkan salah satu pilihan dulu." });
    } else {
      setPilih([...pilih, id]);
    }
  }

  async function simpan() {
    setPesan(null);
    if (pilih.length === 0) {
      setPesan({ tipe: "bad", teks: "Pilih minimal 1 program keahlian." });
      return;
    }
    setLoading(true);
    try {
      const data = await kirim("/api/siswa/pilihan", "PUT", { jalur, pilihan: pilih });
      setPesan({ tipe: "ok", teks: data.message });
      router.refresh();
    } catch (err) {
      setPesan({ tipe: "bad", teks: err.message });
    } finally {
      setLoading(false);
    }
  }

  function batal() {
    setPilih(awal);
    setJalur(jalurAwal);
    setPesan(null);
  }

  return (
    <div>
      <div className="sw-banner">
        <h2>Pilih maksimal 2 program keahlian</h2>
        <p>Urutan pilihan menentukan prioritas seleksi. Pilihan bisa diubah sampai batas akhir pendaftaran.</p>
      </div>

      {pesan && <p className={`sw-msg sw-msg-${pesan.tipe}`}>{pesan.teks}</p>}

      <div className="sw-card">
        <h3 className="sw-card-title">Jalur pendaftaran</h3>
        <p className="sw-card-sub">Jalur yang tersedia mengikuti kebijakan sekolah.</p>
        <div className="sw-chips">
          {JALUR.map((j) => (
            <button key={j} type="button" className={`sw-chip${jalur === j ? " sw-chip-on" : ""}`} onClick={() => setJalur(j)}>
              {j}
            </button>
          ))}
        </div>
      </div>

      <div className="sw-programs">
        {program.map((p) => {
          const urutan = pilih.indexOf(p.id) + 1;
          return (
            <div key={p.id} className={`sw-prog${urutan ? " sw-prog-on" : ""}`}>
              <div className="sw-prog-top">
                <span className="sw-ico">{p.kode}</span>
                <Badge warna={urutan ? "ok" : "muted"}>{urutan ? `Pilihan ${urutan}` : "Belum dipilih"}</Badge>
              </div>
              <h3>{p.nama}</h3>
              <p>{p.deskripsi}</p>
              <p className="sw-prog-meta">
                Kuota <b>{p.kuota} siswa</b>
                {p.prospek && ` · Prospek: ${p.prospek}`}
              </p>
              <button type="button" className={urutan ? "sw-btn" : "sw-btn sw-btn-out"} onClick={() => ubah(p.id)}>
                {urutan ? `Pilihan ${urutan} terpilih` : "Jadikan pilihan"}
              </button>
            </div>
          );
        })}

        <div className="sw-prog-help">
          <h3>Belum yakin?</h3>
          <p>Lihat informasi lengkap tiap program di halaman Tentang sekolah.</p>
        </div>
      </div>

      <div className="sw-actions">
        <button type="button" className="sw-btn sw-btn-out" disabled={loading} onClick={batal}>
          Batal
        </button>
        <button type="button" className="sw-btn" disabled={loading} onClick={simpan}>
          {loading ? "Menyimpan..." : "Simpan pilihan"}
        </button>
      </div>
    </div>
  );
}
