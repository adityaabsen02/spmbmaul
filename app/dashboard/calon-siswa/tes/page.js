import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { getSiswa, getSoalTpa, getJawabanTpa, DURASI_TPA_MENIT } from "@/lib/siswa-data";
import TesRunner from "./TesRunner";

// Halaman soal: layar penuh tanpa sidebar (Frame 10).
export default async function Tes() {
  const session = await requireRole("calon_siswa");
  const s = await getSiswa(session.sub);

  const sisa = s.tes.detik === null ? 0 : DURASI_TPA_MENIT * 60 - s.tes.detik;
  // belum dimulai / sudah dikumpulkan -> kembali ke halaman informasi
  if (!s.tes.mulai || s.tes.selesai || s.tes.nilai !== null) redirect("/dashboard/calon-siswa/tes-tpa");

  const [soal, jawaban] = await Promise.all([getSoalTpa(), getJawabanTpa(s.id)]);

  return <TesRunner soal={soal} jawabanAwal={jawaban} sisaDetik={Math.max(0, sisa)} />;
}
