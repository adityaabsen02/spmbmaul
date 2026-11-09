import { requireRole } from "@/lib/auth";
import { getSiswa } from "@/lib/siswa-data";
import { tanggalPanjang } from "@/lib/format";
import { rp } from "@/lib/siswa-todo";
import Topbar from "../../Topbar";
import PembayaranPanel from "./PembayaranPanel";

// "BRI · 1234-01-000123-50-1" -> { bank: "BRI", nomor: "1234-01-000123-50-1" }
function urai(rekening) {
  const teks = String(rekening || "").trim();
  const m = /^(.*?)\s*[·|:]\s*(.+)$/.exec(teks);
  return m ? { bank: m[1].trim(), nomor: m[2].trim() } : { bank: "", nomor: teks };
}

// Nomor pembayaran per metode. Dibuat otomatis dari nomor pendaftaran (unik per siswa);
// kalau admin mengisi rekening bank yang sama di Pengaturan, nomor admin yang dipakai.
function nomorMetode(noDaftar, rek) {
  const d = String(noDaftar || "").replace(/\D/g, "").padStart(8, "0");
  const grup = (awal) => `${awal} ${d.slice(0, 4)} ${d.slice(4)}`;
  const n = {
    BRI: grup("77777"),
    BCA: grup("39911"),
    MDR: grup("89508"),
    MKT: `SPMB${d}`,
  };
  const bank = (rek.bank || "").toLowerCase();
  if (rek.nomor) {
    if (bank.includes("bri")) n.BRI = rek.nomor;
    else if (bank.includes("bca")) n.BCA = rek.nomor;
    else if (bank.includes("mandiri")) n.MDR = rek.nomor;
  }
  return n;
}

export default async function Pembayaran() {
  const session = await requireRole("calon_siswa");
  const s = await getSiswa(session.sub);
  const p = s.pengaturan;
  const rek = urai(p.rekening);

  const info = {
    invoice: `INV-${s.no_daftar}`,
    keterangan: `Biaya pendaftaran SPMB ${p.tahun_ajaran || ""}`.trim(),
    tanggalTagihan: s.dibuat ? tanggalPanjang(s.dibuat) : "-",
    batas: p.periode_tutup ? `${tanggalPanjang(p.periode_tutup)}, 23.59 WIB` : "-",
    nominal: rp(p.biaya),
    nominalAngka: p.biaya,
    bank: rek.bank,
    nomor: rek.nomor,
    nomorPer: nomorMetode(s.no_daftar, rek),
    status: s.bayar?.status || "belum",
    adaBukti: Boolean(s.bayar?.ada),
    catatan: s.bayar?.catatan || "",
  };

  return (
    <>
      <Topbar
        judul="Pembayaran"
        sub="Bayar biaya pendaftaran sebelum batas waktu agar berkas diproses."
        nama={s.nama}
        userSub={s.data.nisn ? `NISN ${s.data.nisn}` : s.no_daftar}
      />
      <PembayaranPanel info={info} />
    </>
  );
}
