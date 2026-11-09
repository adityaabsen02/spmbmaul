import { BERKAS } from "@/lib/siswa-konst";
import { rupiah, tanggalPanjang } from "@/lib/format";

const BASE = "/dashboard/calon-siswa";
export const rp = (n) => rupiah(n).replace(/\s/g, ""); // "Rp150.000" seperti di desain

// Daftar hal yang masih harus dikerjakan siswa (dipakai dashboard + lonceng).
export function hitungTodo(s) {
  const p = s.pengaturan;
  const batas = p.periode_tutup ? tanggalPanjang(p.periode_tutup) : "";
  const todo = [];

  for (const b of BERKAS.filter((x) => x.wajib)) {
    const d = s.dokumen[b.key];
    if (d.status === "ditolak" || !d.ada) {
      todo.push({
        judul: `${d.ada ? "Unggah ulang" : "Unggah"} ${b.pendek}`,
        ringkas: `${d.ada ? "unggah ulang" : "unggah"} ${b.key === "rapor" ? "rapor" : b.pendek.toLowerCase()}`,
        sub: `${batas ? `Batas ${batas} · ` : ""}ukuran maksimal 2 MB`,
        href: `${BASE}/berkas`,
        tombol: "Unggah",
      });
    }
  }
  if (!s.bayar || s.bayar.status === "ditolak") {
    todo.push({
      judul: `Bayar biaya pendaftaran ${rp(p.biaya)}`,
      ringkas: "bayar biaya pendaftaran",
      sub: batas ? `Batas ${batas}, 23.59 WIB` : "Segera lakukan pembayaran",
      href: `${BASE}/pembayaran`,
      tombol: "Bayar",
    });
  }
  if (!s.dataLengkap) {
    todo.unshift({ ringkas: "lengkapi data diri", judul: "Lengkapi data diri", sub: `Kelengkapan biodata ${s.persenData}%`, href: `${BASE}/data-diri`, tombol: "Isi" });
  }
  return todo;
}
