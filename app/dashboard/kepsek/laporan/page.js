import { requireRole } from "@/lib/auth";
import { getLaporan, getKandidat } from "@/lib/kepsek-data";
import Topbar from "../Topbar";
import Banner from "../../admin/Banner";
import AksiLaporan from "./AksiLaporan";

const pad3 = (n) => String(n).padStart(3, "0");
const pad2 = (n) => String(n).padStart(2, "0");

export default async function Laporan() {
  const session = await requireRole("kepsek");
  const [lap, kandidat] = await Promise.all([getLaporan(), getKandidat()]);
  const menunggu = kandidat.filter((k) => k.keputusan === "menunggu").length;
  const now = new Date();
  const diperbarui = `${pad2(now.getDate())}/${pad2(now.getMonth() + 1)}/${now.getFullYear()}`;

  return (
    <>
      <Topbar nama={session.nama} menunggu={menunggu} />
      <Banner judul="Laporan Penerimaan" sub={`Rekap hasil SPMB tahun ajaran ${lap.tahunAjaran || "-"}.`} />

      <div className="ad-stats">
        <div className="ad-stat"><div className="ad-stat-label">Total Pendaftar</div><div className="ad-stat-value">{pad3(lap.total)}</div></div>
        <div className="ad-stat"><div className="ad-stat-label">Diterima</div><div className="ad-stat-value">{pad3(lap.diterima)}</div></div>
        <div className="ad-stat"><div className="ad-stat-label">Ditolak</div><div className="ad-stat-value">{pad3(lap.ditolak)}</div></div>
      </div>

      <div className="ad-card">
        <h3 className="ad-card-title">Rekap per Program</h3>
        <div className="ad-tablewrap">
          <table className="ad-table kp-rekap">
            <thead>
              <tr>
                <th>Program Keahlian</th>
                <th>Kuota</th>
                <th>Pendaftar</th>
                <th>Diterima</th>
                <th>Sisa Kuota</th>
              </tr>
            </thead>
            <tbody>
              {lap.program.length === 0 && (
                <tr><td colSpan={5} className="ad-empty" style={{ height: 60 }}>Belum ada program keahlian.</td></tr>
              )}
              {lap.program.map((p) => (
                <tr key={p.id}>
                  <td>{p.nama}</td>
                  <td>{pad2(p.kuota)}</td>
                  <td>{pad3(p.pendaftar)}</td>
                  <td>{pad2(p.diterima)}</td>
                  <td>{pad2(p.sisa)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="ad-foot">
          <span>Diperbarui {diperbarui}</span>
          <AksiLaporan />
        </div>
      </div>
    </>
  );
}
