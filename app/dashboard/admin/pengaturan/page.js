import { requireRole } from "@/lib/auth";
import { getPengaturan, getJurusan, getAkunAdmin } from "@/lib/admin-data";
import Topbar from "../Topbar";
import PengaturanForm from "./PengaturanForm";

export default async function Pengaturan() {
  const session = await requireRole("admin");
  const [pengaturan, jurusan, akun] = await Promise.all([
    getPengaturan(),
    getJurusan(),
    getAkunAdmin(session.sub),
  ]);

  return (
    <>
      <Topbar nama={session.nama} />
      <PengaturanForm awal={pengaturan} jurusan={jurusan} akunAwal={akun} />
    </>
  );
}
