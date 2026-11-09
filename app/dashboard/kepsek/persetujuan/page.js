import { requireRole } from "@/lib/auth";
import { getKandidat, getKuotaProgram } from "@/lib/kepsek-data";
import Topbar from "../Topbar";
import Banner from "../../admin/Banner";
import PersetujuanTable from "./PersetujuanTable";

export default async function Persetujuan() {
  const session = await requireRole("kepsek");
  const [kandidat, program] = await Promise.all([getKandidat(), getKuotaProgram()]);
  const menunggu = kandidat.filter((k) => k.keputusan === "menunggu").length;

  return (
    <>
      <Topbar nama={session.nama} menunggu={menunggu} />
      <Banner judul="Persetujuan Kelulusan" sub="Pilih calon siswa yang disetujui lulus berdasarkan peringkat nilai." />
      <PersetujuanTable rows={kandidat} program={program.map((p) => p.nama)} />
    </>
  );
}
