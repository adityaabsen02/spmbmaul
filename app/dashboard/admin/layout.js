import "./admin.css";
import { requireRole } from "@/lib/auth";
import AdminSidebar from "./AdminSidebar";

export const metadata = {
  title: "Admin — SPMB SMK Citra Negara",
};

export default async function AdminLayout({ children }) {
  // Lapisan keamanan 1: seluruh area /dashboard/admin hanya untuk role admin.
  await requireRole("admin");

  return (
    <div className="ad-shell">
      <AdminSidebar />
      <div className="ad-main">{children}</div>
    </div>
  );
}
