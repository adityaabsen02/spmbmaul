"use client";

import { useState } from "react";

const TAB = [
  ["Semua", null],
  ["Jadwal", "Jadwal"],
  ["Hasil seleksi", "Hasil seleksi"],
  ["Info umum", "Informasi"],
];
const KODE = { Jadwal: ["JD", "Jadwal", "warn"], "Hasil seleksi": ["HS", "Hasil", "ok"], Informasi: ["IN", "Info", "ok"] };

export default function DaftarPengumuman({ item }) {
  const [tab, setTab] = useState(0);
  const tampil = TAB[tab][1] ? item.filter((x) => x.kategori === TAB[tab][1]) : item;

  return (
    <div className="sw-card sw-pg-card">
      <div className="sw-tabs" role="tablist">
        {TAB.map(([label], i) => (
          <button key={label} type="button" role="tab" aria-selected={tab === i} className={tab === i ? "sw-tab sw-tab-on" : "sw-tab"} onClick={() => setTab(i)}>
            {label}
          </button>
        ))}
      </div>

      {tampil.length === 0 ? (
        <p className="sw-kosong">Belum ada pengumuman.</p>
      ) : (
        <div className="sw-pg-list">
          {tampil.map((x) => {
            const [kode, pill, warna] = KODE[x.kategori] || KODE.Informasi;
            return (
              <div key={x.id} className="sw-pg">
                <span className="sw-pg-ico">{kode}</span>
                <div className="sw-pg-body">
                  <div className="sw-pg-judul">{x.judul}</div>
                  {x.isi && <div className="sw-pg-isi">{x.isi}</div>}
                  <div className="sw-pg-tgl">{x.tanggal}</div>
                </div>
                <span className={`sw-pill sw-pill-${warna}`}>{pill}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
