import "../admin/admin.css";
import "./kepsek.css";
import { requireRole } from "@/lib/auth";
import KepsekSidebar from "./KepsekSidebar";

export const metadata = {
  title: "Kepala Sekolah — SPMB SMK Citra Negara",
};

export default async function KepsekLayout({ children }) {
  // Lapisan keamanan 1: seluruh area /dashboard/kepsek hanya untuk role kepsek.
  await requireRole("kepsek");

  return (
    <div className="ad-shell">
      <KepsekSidebar />
      <div className="ad-main">{children}</div>
    </div>
  );
}
