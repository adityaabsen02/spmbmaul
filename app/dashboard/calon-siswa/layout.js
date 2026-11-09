import "./siswa.css";
import { requireRole } from "@/lib/auth";

export const metadata = {
  title: "Calon Siswa — SPMB SMK Citra Negara",
};

export default async function CalonSiswaLayout({ children }) {
  // Lapisan keamanan 1: seluruh area /dashboard/calon-siswa hanya untuk role calon_siswa.
  await requireRole("calon_siswa");
  return children;
}
