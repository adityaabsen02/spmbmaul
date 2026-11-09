"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { kirim } from "../../kirim";
import { UKURAN_BAJU, UKURAN_CELANA, UKURAN_SEPATU } from "@/lib/siswa-konst";

function Pilih({ label, nilai, onChange, daftar, kunci, terkunci }) {
  return (
    <label className="sw-field">
      <span>{label}</span>
      <select className={nilai ? "sw-select" : "sw-select sw-select-ph"} value={nilai} disabled={terkunci} onChange={(e) => onChange(kunci, e.target.value)}>
        <option value="">Pilih</option>
        {daftar.map((u) => <option key={u} value={u}>{u}</option>)}
      </select>
    </label>
  );
}

export default function DaftarUlangForm({ awal, terkunci }) {
  const router = useRouter();
  const [f, setF] = useState({
    ukuran_baju: awal.ukuran_baju || "",
    ukuran_celana: awal.ukuran_celana || "",
    ukuran_sepatu: awal.ukuran_sepatu || "",
    telepon_wali: awal.telepon_wali || "",
    setuju: Boolean(awal.setuju),
  });
  const [loading, setLoading] = useState("");
  const [pesan, setPesan] = useState(null);

  const ubah = (k, v) => setF((x) => ({ ...x, [k]: v }));

  async function simpan(draft) {
    setPesan(null);
    setLoading(draft ? "draft" : "kirim");
    try {
      const r = await kirim("/api/siswa/daftar-ulang", "PUT", { ...f, draft });
      setPesan({ ok: true, teks: r.message });
      router.refresh();
    } catch (err) {
      setPesan({ ok: false, teks: err.message });
    }
    setLoading("");
  }

  return (
    <div className="sw-card">
      <h3 className="sw-card-title">Formulir daftar ulang</h3>
      <div className="sw-grid-2">
        <Pilih label="Ukuran baju seragam" kunci="ukuran_baju" nilai={f.ukuran_baju} onChange={ubah} daftar={UKURAN_BAJU} terkunci={terkunci} />
        <Pilih label="Ukuran celana / rok" kunci="ukuran_celana" nilai={f.ukuran_celana} onChange={ubah} daftar={UKURAN_CELANA} terkunci={terkunci} />
        <Pilih label="Ukuran sepatu" kunci="ukuran_sepatu" nilai={f.ukuran_sepatu} onChange={ubah} daftar={UKURAN_SEPATU} terkunci={terkunci} />
        <label className="sw-field">
          <span>Nomor HP orang tua / wali</span>
          <input className="sw-input" inputMode="tel" value={f.telepon_wali} readOnly={terkunci} placeholder="0812 3456 7890" onChange={(e) => ubah("telepon_wali", e.target.value)} />
        </label>
      </div>

      <label className="sw-cek">
        <input type="checkbox" checked={f.setuju} disabled={terkunci} onChange={(e) => ubah("setuju", e.target.checked)} />
        <span>Saya bersedia mengikuti seluruh tata tertib SMK Citra Negara dan menyatakan data yang saya isi benar.</span>
      </label>

      {pesan && <p className={pesan.ok ? "sw-note sw-note-ok" : "sw-note"}>{pesan.teks}</p>}

      {terkunci ? (
        <p className="sw-note sw-note-ok">Formulir sudah terkirim. Bawa berkas asli ke sekolah sesuai jadwal.</p>
      ) : (
        <div className="sw-actions">
          <button type="button" className="sw-btn sw-btn-out" disabled={Boolean(loading)} onClick={() => simpan(true)}>
            {loading === "draft" ? "Menyimpan..." : "Simpan draft"}
          </button>
          <button type="button" className="sw-btn" disabled={Boolean(loading)} onClick={() => simpan(false)}>
            {loading === "kirim" ? "Mengirim..." : "Kirim daftar ulang"}
          </button>
        </div>
      )}
    </div>
  );
}
