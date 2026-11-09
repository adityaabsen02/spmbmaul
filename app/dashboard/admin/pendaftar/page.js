import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { getPendaftar, getJurusan } from "@/lib/admin-data";
import Topbar from "../Topbar";
import Banner from "../Banner";
import Badge from "../Badge";
import PendaftarFilter from "./PendaftarFilter";

// Maksimal 5 nomor halaman di sekitar halaman aktif.
function daftarHalaman(aktif, total) {
  const awal = Math.max(1, Math.min(aktif - 2, total - 4));
  const akhir = Math.min(total, awal + 4);
  return Array.from({ length: akhir - awal + 1 }, (_, i) => awal + i);
}

export default async function DataPendaftar({ searchParams }) {
  const session = await requireRole("admin");
  const sp = await searchParams;

  const q = typeof sp.q === "string" ? sp.q.trim().slice(0, 100) : "";
  const jurusan = typeof sp.jurusan === "string" ? sp.jurusan : "";
  const status = typeof sp.status === "string" ? sp.status : "";
  const halaman = Number(sp.page) || 1;

  const [data, daftarJurusan] = await Promise.all([
    getPendaftar({ q, jurusan, status, page: halaman }),
    getJurusan(),
  ]);

  function tautan(page) {
    const p = new URLSearchParams();
    if (q) p.set("q", q);
    if (jurusan) p.set("jurusan", jurusan);
    if (status) p.set("status", status);
    p.set("page", String(page));
    return `/dashboard/admin/pendaftar?${p.toString()}`;
  }

  const awal = (data.page - 1) * data.perPage;

  return (
    <>
      <Topbar nama={session.nama} />

      <Banner judul="Data Pendaftar" sub="Kelola seluruh calon siswa yang mendaftar." />

      <div className="ad-card">
        <PendaftarFilter jurusan={daftarJurusan} awal={{ q, jurusan, status }} />

        <div className="ad-tablewrap">
          <table className="ad-table">
            <colgroup>
              <col style={{ width: "13.6%" }} />
              <col style={{ width: "18.2%" }} />
              <col style={{ width: "11.6%" }} />
              <col style={{ width: "18.2%" }} />
              <col style={{ width: "14.1%" }} />
              <col style={{ width: "14.6%" }} />
              <col style={{ width: "9.7%" }} />
            </colgroup>
            <thead>
              <tr>
                <th>No. Daftar</th>
                <th>Nama Lengkap</th>
                <th>Program</th>
                <th>Dokumen</th>
                <th>Pembayaran</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {data.rows.length === 0 && (
                <tr>
                  <td colSpan={7} className="ad-empty" style={{ height: 80 }}>
                    Tidak ada pendaftar yang cocok.
                  </td>
                </tr>
              )}
              {data.rows.map((p) => (
                <tr key={p.id}>
                  <td>{p.no_daftar}</td>
                  <td title={p.nama}>{p.nama}</td>
                  <td>{p.jurusan || "-"}</td>
                  <td className="ad-nowrap-ok">
                    <Badge grup="dokumen" nilai={p.dokumen_label} />
                  </td>
                  <td className="ad-nowrap-ok">
                    <Badge grup="bayar" nilai={p.bayar} />
                  </td>
                  <td className="ad-nowrap-ok">
                    <Badge grup="status" nilai={p.status_label} />
                  </td>
                  <td className="ad-nowrap-ok">
                    <Link href={`/dashboard/admin/verifikasi?id=${p.id}`} className="ad-btn">
                      Lihat
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="ad-foot">
          <span>
            {data.total === 0
              ? "Menampilkan 0 dari 0 pendaftar"
              : `Menampilkan ${awal + 1}–${awal + data.rows.length} dari ${data.total} pendaftar`}
          </span>
          <div className="ad-pager">
            {data.page > 1 ? (
              <Link href={tautan(data.page - 1)} aria-label="Halaman sebelumnya">‹</Link>
            ) : (
              <span className="ad-pager-off">‹</span>
            )}
            {daftarHalaman(data.page, data.pages).map((n) =>
              n === data.page ? (
                <span key={n} className="ad-pager-now">{n}</span>
              ) : (
                <Link key={n} href={tautan(n)}>{n}</Link>
              )
            )}
            {data.page < data.pages ? (
              <Link href={tautan(data.page + 1)} aria-label="Halaman berikutnya">›</Link>
            ) : (
              <span className="ad-pager-off">›</span>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
