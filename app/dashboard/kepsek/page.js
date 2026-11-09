import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { getDashboardKepsek } from "@/lib/kepsek-data";
import Topbar from "./Topbar";

const pad3 = (n) => String(n).padStart(3, "0");

export default async function DashboardKepsek() {
  const session = await requireRole("kepsek");
  const d = await getDashboardKepsek();
  const panggil = String(session.nama || "").trim().split(/\s+/)[0] || "Kepala Sekolah";

  return (
    <>
      <Topbar
        nama={session.nama}
        judul={`Halo, ${panggil}`}
        sub="Pantau hasil seleksi penerimaan siswa baru."
        menunggu={d.menunggu}
      />

      <div className="ad-banner ad-banner-lg kp-banner">
        <h2>
          {d.menunggu > 0
            ? `${pad3(d.menunggu)} calon siswa menunggu persetujuan kelulusan`
            : "Tidak ada calon siswa yang menunggu persetujuan"}
        </h2>
        <p>Tinjau hasil seleksi lalu setujui agar pengumuman bisa diterbitkan.</p>
      </div>

      <div className="ad-stats kp-stats4">
        <div className="ad-stat"><div className="ad-stat-label">Total Pendaftar</div><div className="ad-stat-value">{pad3(d.totalPendaftar)}</div></div>
        <div className="ad-stat"><div className="ad-stat-label">Lulus Seleksi</div><div className="ad-stat-value">{pad3(d.lulusSeleksi)}</div></div>
        <div className="ad-stat"><div className="ad-stat-label">Kuota Terisi</div><div className="ad-stat-value">{d.persenKuota}%</div></div>
        <div className="ad-stat"><div className="ad-stat-label">Menunggu Persetujuan</div><div className="ad-stat-value">{pad3(d.menunggu)}</div></div>
      </div>

      <div className="ad-dash">
        <div className="ad-card">
          <h3 className="ad-card-title">Kuota Terisi per Program</h3>
          {d.program.length === 0 && <p className="ad-empty">Belum ada program keahlian.</p>}
          {d.program.map((p) => {
            const persen = p.kuota > 0 ? Math.min(100, Math.round((p.diterima / p.kuota) * 100)) : 0;
            return (
              <div key={p.id} className="kp-bar">
                <span>{p.nama} · {p.diterima}/{p.kuota}</span>
                <div className="kp-bar-track"><div className="kp-bar-fill" style={{ width: `${persen}%` }} /></div>
              </div>
            );
          })}
        </div>

        <div>
          <div className="kp-gelap">
            <h3>Persetujuan kelulusan</h3>
            <p>{pad3(d.menunggu)} siswa menunggu keputusan kamu.</p>
            <Link href="/dashboard/kepsek/persetujuan" className="ad-btn ad-btn-green ad-btn-wide">Tinjau sekarang</Link>
          </div>

          <div className="ad-card" style={{ padding: "18px 22px 6px" }}>
            <h3 className="ad-card-title" style={{ marginBottom: 6 }}>Yang perlu kamu lakukan</h3>
            <div className="ad-todo-row">
              <div>
                <b>Setujui hasil seleksi</b>
                <span>Batas {d.tglPengumuman}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
