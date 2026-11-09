import { requireRole } from "@/lib/auth";
import { getSiswa, BERKAS } from "@/lib/siswa-data";
import Topbar from "../../Topbar";
import BerkasList from "./BerkasList";

export default async function UnggahBerkas() {
  const session = await requireRole("calon_siswa");
  const s = await getSiswa(session.sub);

  const daftar = BERKAS.map((b) => ({ ...b, ...s.dokumen[b.key] }));

  return (
    <>
      <Topbar
        judul="Unggah Dokumen"
        sub="Lengkapi semua dokumen persyaratan pendaftaran SPMB."
        nama={s.nama}
        userSub={s.data.nisn ? `NISN ${s.data.nisn}` : s.no_daftar}
        notif={0}
      />
      <BerkasList daftar={daftar} terunggah={s.dokTerunggah} total={s.totalBerkas} />
    </>
  );
}
