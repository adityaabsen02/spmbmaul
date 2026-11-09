import { requireRole } from "@/lib/auth";
import { getPengumuman } from "@/lib/admin-data";
import Topbar from "../Topbar";
import Banner from "../Banner";
import PengumumanManager from "./PengumumanManager";

export default async function Pengumuman() {
  const session = await requireRole("admin");
  const daftar = await getPengumuman();

  return (
    <>
      <Topbar nama={session.nama} />

      <Banner judul="Pengumuman" sub="Buat dan kelola pengumuman untuk pendaftar." />

      <PengumumanManager daftar={daftar} />
    </>
  );
}
