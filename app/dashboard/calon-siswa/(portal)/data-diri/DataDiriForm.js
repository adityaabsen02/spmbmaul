"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { WAJIB_DATA, AGAMA, PENGHASILAN, PROVINSI } from "@/lib/siswa-konst";
import { kirim } from "../../kirim";

const TAHUN = ["2026", "2025", "2024", "2023"];
const JK = { L: "Laki-laki", P: "Perempuan" };

function awalForm(a) {
  const v = (x) => (x === null || x === undefined ? "" : String(x));
  return {
    nisn: v(a.nisn), nik: v(a.nik), tempat_lahir: v(a.tempat_lahir), tanggal_lahir: v(a.tanggal_lahir),
    jenis_kelamin: v(a.jenis_kelamin), agama: v(a.agama), anak_ke: v(a.anak_ke), telepon: v(a.telepon),
    alamat: v(a.alamat), rt_rw: v(a.rt_rw), kelurahan: v(a.kelurahan), kecamatan: v(a.kecamatan),
    kota: v(a.kota), provinsi: v(a.provinsi), kode_pos: v(a.kode_pos),
    nama_ayah: v(a.nama_ayah), pekerjaan_ayah: v(a.pekerjaan_ayah), nama_ibu: v(a.nama_ibu),
    pekerjaan_ibu: v(a.pekerjaan_ibu), telepon_ortu: v(a.telepon_ortu), penghasilan: v(a.penghasilan),
    asal_sekolah: v(a.asal_sekolah), npsn: v(a.npsn), tahun_lulus: v(a.tahun_lulus),
    rata_rapor: v(a.rata_rapor).replace(".", ","), no_ijazah: v(a.no_ijazah),
  };
}

function Isi({ label, wajib = true, children, className = "" }) {
  return (
    <label className={`sw-field ${className}`}>
      <span>
        {label} {wajib && <i>*</i>}
      </span>
      {children}
    </label>
  );
}

export default function DataDiriForm({ awal, nama, email }) {
  const router = useRouter();
  const [f, setF] = useState(() => awalForm(awal));
  const [loading, setLoading] = useState(null); // "draft" | "lanjut"
  const [pesan, setPesan] = useState(null);

  const ubah = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }));
  const angka = (k, maks) => (e) => setF((p) => ({ ...p, [k]: e.target.value.replace(/\D/g, "").slice(0, maks) }));

  const terisi = WAJIB_DATA.filter((k) => String(f[k]).trim() !== "").length;
  const persen = Math.round((terisi / WAJIB_DATA.length) * 100);

  async function simpan(draft) {
    setPesan(null);
    setLoading(draft ? "draft" : "lanjut");
    try {
      const data = await kirim("/api/siswa/data-diri", "PUT", { ...f, draft });
      if (draft) {
        setPesan({ tipe: "ok", teks: data.message });
        router.refresh();
      } else {
        router.push("/dashboard/calon-siswa/berkas");
        router.refresh();
      }
    } catch (err) {
      setPesan({ tipe: "bad", teks: err.message });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setLoading(null);
    }
  }

  const pilih = (k, placeholder, opsi) => (
    <select className={`sw-select${f[k] ? "" : " sw-select-ph"}`} value={f[k]} onChange={ubah(k)}>
      <option value="">{placeholder}</option>
      {opsi.map((o) => (
        <option key={o.v ?? o} value={o.v ?? o}>
          {o.t ?? o}
        </option>
      ))}
    </select>
  );

  return (
    <div>
      <div className="sw-banner sw-banner-bar">
        <div className="sw-bar-head">
          <span>Kelengkapan biodata</span>
          <span>{persen}%</span>
        </div>
        <div className="sw-bar">
          <span style={{ width: `${persen}%` }} />
        </div>
      </div>

      {pesan && <p className={`sw-msg sw-msg-${pesan.tipe}`}>{pesan.teks}</p>}

      <div className="sw-card sw-form-card">
        <h3 className="sw-card-title">Data pribadi</h3>
        <p className="sw-card-sub">Isi sesuai Kartu Keluarga dan akta lahir.</p>
        <div className="sw-grid-3">
          <Isi label="Nama lengkap" className="sw-span-2">
            <input className="sw-input" value={nama} readOnly />
          </Isi>
          <Isi label="NISN">
            <input className="sw-input" inputMode="numeric" placeholder="10 digit" value={f.nisn} onChange={angka("nisn", 10)} />
          </Isi>
          <Isi label="NIK">
            <input className="sw-input" inputMode="numeric" placeholder="16 digit" value={f.nik} onChange={angka("nik", 16)} />
          </Isi>
          <Isi label="Tempat lahir">
            <input className="sw-input" maxLength={80} placeholder="Contoh: Bekasi" value={f.tempat_lahir} onChange={ubah("tempat_lahir")} />
          </Isi>
          <Isi label="Tanggal lahir">
            <input className="sw-input" type="date" value={f.tanggal_lahir} onChange={ubah("tanggal_lahir")} />
          </Isi>
          <Isi label="Jenis kelamin">
            {pilih("jenis_kelamin", "Pilih", Object.entries(JK).map(([v, t]) => ({ v, t })))}
          </Isi>
          <Isi label="Agama">
            {pilih("agama", "Pilih", AGAMA)}
          </Isi>
          <Isi label="Anak ke-">
            <input className="sw-input" inputMode="numeric" placeholder="1" value={f.anak_ke} onChange={angka("anak_ke", 2)} />
          </Isi>
          <Isi label="Nomor HP">
            <input className="sw-input" inputMode="tel" maxLength={20} placeholder="0812 3456 7890" value={f.telepon} onChange={ubah("telepon")} />
          </Isi>
          <Isi label="Email" className="sw-span-2">
            <input className="sw-input" value={email} readOnly />
          </Isi>
        </div>
      </div>

      <div className="sw-card sw-form-card">
        <h3 className="sw-card-title">Alamat tempat tinggal</h3>
        <p className="sw-card-sub">Alamat domisili saat ini.</p>
        <div className="sw-grid-3">
          <Isi label="Alamat lengkap" className="sw-span-3">
            <textarea className="sw-textarea" maxLength={255} placeholder="Nama jalan, nomor rumah, perumahan" value={f.alamat} onChange={ubah("alamat")} />
          </Isi>
          <Isi label="RT / RW">
            <input className="sw-input" maxLength={10} placeholder="004 / 009" value={f.rt_rw} onChange={ubah("rt_rw")} />
          </Isi>
          <Isi label="Kelurahan / Desa">
            <input className="sw-input" maxLength={80} value={f.kelurahan} onChange={ubah("kelurahan")} />
          </Isi>
          <Isi label="Kecamatan">
            <input className="sw-input" maxLength={80} value={f.kecamatan} onChange={ubah("kecamatan")} />
          </Isi>
          <Isi label="Kota / Kabupaten">
            <input className="sw-input" maxLength={80} placeholder="Contoh: Kota Bekasi" value={f.kota} onChange={ubah("kota")} />
          </Isi>
          <Isi label="Provinsi">
            {pilih("provinsi", "Pilih provinsi", PROVINSI)}
          </Isi>
          <Isi label="Kode pos">
            <input className="sw-input" inputMode="numeric" placeholder="00000" value={f.kode_pos} onChange={angka("kode_pos", 5)} />
          </Isi>
        </div>
      </div>

      <div className="sw-card sw-form-card">
        <h3 className="sw-card-title">Data orang tua / wali</h3>
        <p className="sw-card-sub">Isi data ayah dan ibu. Data wali diisi jika tinggal bersama wali.</p>
        <div className="sw-grid-2">
          <Isi label="Nama ayah">
            <input className="sw-input" maxLength={100} value={f.nama_ayah} onChange={ubah("nama_ayah")} />
          </Isi>
          <Isi label="Pekerjaan ayah">
            <input className="sw-input" maxLength={100} value={f.pekerjaan_ayah} onChange={ubah("pekerjaan_ayah")} />
          </Isi>
          <Isi label="Nama ibu">
            <input className="sw-input" maxLength={100} value={f.nama_ibu} onChange={ubah("nama_ibu")} />
          </Isi>
          <Isi label="Pekerjaan ibu">
            <input className="sw-input" maxLength={100} value={f.pekerjaan_ibu} onChange={ubah("pekerjaan_ibu")} />
          </Isi>
          <Isi label="Nomor HP orang tua / wali">
            <input className="sw-input" inputMode="tel" maxLength={20} placeholder="0812 3456 7890" value={f.telepon_ortu} onChange={ubah("telepon_ortu")} />
          </Isi>
          <Isi label="Penghasilan per bulan">
            {pilih("penghasilan", "Pilih penghasilan", PENGHASILAN)}
          </Isi>
        </div>
      </div>

      <div className="sw-card sw-form-card">
        <h3 className="sw-card-title">Asal sekolah</h3>
        <p className="sw-card-sub">Data sekolah sebelumnya (SMP / MTs).</p>
        <div className="sw-grid-2">
          <Isi label="Nama sekolah asal">
            <input className="sw-input" maxLength={150} placeholder="Contoh: SMP Negeri 5 Bekasi" value={f.asal_sekolah} onChange={ubah("asal_sekolah")} />
          </Isi>
          <Isi label="NPSN sekolah">
            <input className="sw-input" inputMode="numeric" placeholder="8 digit" value={f.npsn} onChange={angka("npsn", 8)} />
          </Isi>
          <Isi label="Tahun lulus">
            {pilih("tahun_lulus", "Pilih tahun", TAHUN)}
          </Isi>
          <Isi label="Rata-rata nilai rapor">
            <input
              className="sw-input"
              inputMode="decimal"
              placeholder="Contoh: 85,50"
              value={f.rata_rapor}
              onChange={(e) => setF((p) => ({ ...p, rata_rapor: e.target.value.replace(/[^\d,.]/g, "").slice(0, 6) }))}
            />
          </Isi>
          <Isi label="Nomor ijazah / SKL" wajib={false}>
            <input className="sw-input" maxLength={50} placeholder="Belum ada" value={f.no_ijazah} onChange={ubah("no_ijazah")} />
          </Isi>
        </div>
      </div>

      <div className="sw-actions">
        <button type="button" className="sw-btn sw-btn-out" disabled={loading !== null} onClick={() => simpan(true)}>
          {loading === "draft" ? "Menyimpan..." : "Simpan draft"}
        </button>
        <button type="button" className="sw-btn" disabled={loading !== null} onClick={() => simpan(false)}>
          {loading === "lanjut" ? "Menyimpan..." : "Simpan dan lanjut"}
        </button>
      </div>
    </div>
  );
}
