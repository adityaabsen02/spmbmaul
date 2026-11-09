import { requireRole } from "@/lib/auth";
import { getPembayaran } from "@/lib/admin-data";
import { rupiah } from "@/lib/format";
import Topbar from "../Topbar";
import Banner from "../Banner";
import PembayaranTable from "./PembayaranTable";

export default async function Pembayaran() {
  const session = await requireRole("admin");
  const { rows, stat } = await getPembayaran();

  return (
    <>
      <Topbar nama={session.nama} />

      <Banner judul="Pembayaran" sub="Konfirmasi bukti transfer biaya pendaftaran." />

      <div className="ad-stats">
        <div className="ad-stat">
          <div className="ad-stat-label">Menunggu Konfirmasi</div>
          <div className="ad-stat-value">{String(stat.menunggu).padStart(3, "0")}</div>
        </div>
        <div className="ad-stat">
          <div className="ad-stat-label">Lunas</div>
          <div className="ad-stat-value">{String(stat.lunas).padStart(3, "0")}</div>
        </div>
        <div className="ad-stat">
          <div className="ad-stat-label">Total Terkumpul</div>
          <div className="ad-stat-value">{rupiah(stat.total)}</div>
        </div>
      </div>

      <PembayaranTable rows={rows} />
    </>
  );
}
