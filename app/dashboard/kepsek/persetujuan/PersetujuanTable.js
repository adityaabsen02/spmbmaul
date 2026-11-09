"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Badge from "../../admin/Badge";
import { kirim } from "../../admin/kirim";

const STATUS = {
  menunggu: ["warn", "Menunggu"],
  disetujui: ["ok", "Disetujui"],
  ditolak: ["bad", "Ditolak"],
};
const FILTER_STATUS = [
  ["menunggu", "Menunggu Persetujuan"],
  ["semua", "Semua Status"],
  ["disetujui", "Disetujui"],
  ["ditolak", "Ditolak"],
];

export default function PersetujuanTable({ rows, program }) {
  const router = useRouter();
  const [prog, setProg] = useState("");
  const [status, setStatus] = useState("menunggu");
  const [pilih, setPilih] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pesan, setPesan] = useState(null);

  const tampil = useMemo(
    () => rows.filter((r) => (!prog || r.program === prog) && (status === "semua" || r.keputusan === status)),
    [rows, prog, status]
  );
  const idTampil = tampil.map((r) => r.id);
  const semua = idTampil.length > 0 && idTampil.every((id) => pilih.includes(id));
  const terpilih = pilih.filter((id) => idTampil.includes(id));

  function toggle(id) {
    setPilih((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  }
  function toggleSemua() {
    setPilih(semua ? pilih.filter((id) => !idTampil.includes(id)) : [...new Set([...pilih, ...idTampil])]);
  }

  async function proses(aksi) {
    if (terpilih.length === 0) return;
    const teks = aksi === "setujui" ? "menyetujui" : "menolak";
    if (!window.confirm(`Yakin ${teks} ${terpilih.length} siswa terpilih?`)) return;
    setLoading(true);
    setPesan(null);
    try {
      const r = await kirim("/api/kepsek/keputusan", "POST", { ids: terpilih, aksi });
      setPesan({ ok: true, teks: r.message });
      setPilih([]);
      router.refresh();
    } catch (e) {
      setPesan({ ok: false, teks: e.message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="ad-card">
      <div className="kp-filter">
        <select className="ad-select" value={prog} onChange={(e) => setProg(e.target.value)} aria-label="Filter program">
          <option value="">Semua Program</option>
          {program.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
        <select className="ad-select" value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filter status">
          {FILTER_STATUS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      </div>

      {pesan && <p className={`ad-msg ${pesan.ok ? "ad-msg-ok" : "ad-msg-bad"}`}>{pesan.teks}</p>}

      <div className="ad-tablewrap">
        <table className="ad-table">
          <colgroup>
            <col style={{ width: "6%" }} />
            <col style={{ width: "11%" }} />
            <col style={{ width: "27%" }} />
            <col style={{ width: "25%" }} />
            <col style={{ width: "12%" }} />
            <col style={{ width: "19%" }} />
          </colgroup>
          <thead>
            <tr>
              <th><input type="checkbox" className="kp-cek" checked={semua} onChange={toggleSemua} aria-label="Pilih semua" /></th>
              <th>Peringkat</th>
              <th>Nama</th>
              <th>Program</th>
              <th>Nilai TPA</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {tampil.length === 0 && (
              <tr><td colSpan={6} className="ad-empty" style={{ height: 80 }}>Tidak ada calon siswa pada filter ini.</td></tr>
            )}
            {tampil.map((r) => (
              <tr key={r.id} className="kp-row">
                <td><input type="checkbox" className="kp-cek" checked={pilih.includes(r.id)} onChange={() => toggle(r.id)} aria-label={`Pilih ${r.nama}`} /></td>
                <td>{String(r.peringkat).padStart(2, "0")}</td>
                <td title={r.nama}>{r.nama}</td>
                <td title={r.program}>{r.program}</td>
                <td>{r.nilai.toLocaleString("id-ID", { maximumFractionDigits: 1 })}</td>
                <td className="ad-nowrap-ok"><Badge grup="kepsek" nilai={r.keputusan} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="ad-foot">
        <span>{terpilih.length} siswa dipilih</span>
        <div className="ad-actions" style={{ gap: 12 }}>
          <button type="button" className="ad-btn ad-btn-red" disabled={loading || terpilih.length === 0} onClick={() => proses("tolak")}>Tolak</button>
          <button type="button" className="ad-btn" disabled={loading || terpilih.length === 0} onClick={() => proses("setujui")}>Setujui Terpilih</button>
        </div>
      </div>
    </div>
  );
}
