import { requireRole } from "@/lib/auth";
import { getSiswa, getProgramSiswa } from "@/lib/siswa-data";
import { hitungTodo } from "@/lib/siswa-todo";
import { URUTAN_PROGRAM, PROGRAM_INFO } from "@/lib/siswa-konst";
import Topbar from "../../Topbar";
import ProgramPicker from "./ProgramPicker";

export default async function PilihanProgram() {
  const session = await requireRole("calon_siswa");
  const s = await getSiswa(session.sub);
  const semua = await getProgramSiswa();

  // urutan kartu seperti di Figma; program lain (kalau ada) menyusul sesuai nama
  const urut = (k) => (URUTAN_PROGRAM.includes(k) ? URUTAN_PROGRAM.indexOf(k) : 99);
  const program = [...semua]
    .sort((a, b) => urut(a.kode) - urut(b.kode) || a.nama.localeCompare(b.nama))
    .map((p) => ({
      id: p.id,
      kode: p.kode.slice(0, 2).toUpperCase(),
      nama: p.nama,
      kuota: p.kuota,
      deskripsi: PROGRAM_INFO[p.kode]?.deskripsi || "Program keahlian SMK Citra Negara.",
      prospek: PROGRAM_INFO[p.kode]?.prospek || "",
    }));

  return (
    <>
      <Topbar
        judul="Pilihan Program Keahlian"
        sub="Tentukan jurusan yang ingin kamu ambil di SMK Citra Negara."
        nama={s.nama}
        userSub={s.no_daftar}
        notif={hitungTodo(s).length}
      />
      <ProgramPicker program={program} awal={s.pilihan.map((x) => x.id)} jalurAwal={s.data.jalur || "Reguler"} />
    </>
  );
}
