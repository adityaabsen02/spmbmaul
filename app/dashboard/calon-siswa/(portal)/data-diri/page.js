import { requireRole } from "@/lib/auth";
import { getSiswa } from "@/lib/siswa-data";
import Topbar from "../../Topbar";
import DataDiriForm from "./DataDiriForm";

export default async function DataDiri() {
  const session = await requireRole("calon_siswa");
  const s = await getSiswa(session.sub);

  return (
    <>
      <Topbar
        judul="Data Diri"
        sub="Lengkapi biodata kamu dengan benar. Kolom bertanda * wajib diisi."
        nama={s.nama}
        userSub={s.data.nisn ? `NISN ${s.data.nisn}` : s.no_daftar}
      />
      <DataDiriForm awal={s.data} nama={s.nama} email={s.email} />
    </>
  );
}
