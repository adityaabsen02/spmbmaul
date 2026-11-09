"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

// Filter pencarian: mengubah URL (?q=&jurusan=&status=) lalu halaman server dirender ulang.
export default function PendaftarFilter({ jurusan, awal }) {
  const router = useRouter();
  const [q, setQ] = useState(awal.q);
  const [jur, setJur] = useState(awal.jurusan);
  const [status, setStatus] = useState(awal.status);
  const timer = useRef(null);

  function terapkan(baru) {
    const nilai = { q, jurusan: jur, status, ...baru };
    const sp = new URLSearchParams();
    if (nilai.q) sp.set("q", nilai.q);
    if (nilai.jurusan) sp.set("jurusan", nilai.jurusan);
    if (nilai.status) sp.set("status", nilai.status);
    const qs = sp.toString();
    router.push(`/dashboard/admin/pendaftar${qs ? `?${qs}` : ""}`);
  }

  function ubahQ(v) {
    setQ(v);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => terapkan({ q: v }), 400);
  }

  return (
    <div className="ad-filters">
      <input
        className="ad-input"
        type="search"
        placeholder="Cari nama atau no. pendaftaran"
        value={q}
        onChange={(e) => ubahQ(e.target.value)}
        aria-label="Cari pendaftar"
      />

      <select
        className="ad-select"
        value={jur}
        aria-label="Filter program"
        onChange={(e) => {
          setJur(e.target.value);
          terapkan({ jurusan: e.target.value });
        }}
      >
        <option value="">Semua Program</option>
        {jurusan.map((j) => (
          <option key={j.id} value={j.id}>
            {j.kode}
          </option>
        ))}
      </select>

      <select
        className="ad-select"
        value={status}
        aria-label="Filter status"
        onChange={(e) => {
          setStatus(e.target.value);
          terapkan({ status: e.target.value });
        }}
      >
        <option value="">Semua Status</option>
        <option value="menunggu">Menunggu</option>
        <option value="lulus">Lulus</option>
        <option value="ditolak">Ditolak</option>
      </select>
    </div>
  );
}
