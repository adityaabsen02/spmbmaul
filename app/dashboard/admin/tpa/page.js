import { requireRole } from "@/lib/auth";
import { getTpa } from "@/lib/admin-data";
import Topbar from "../Topbar";
import TpaView from "./TpaView";

export default async function HasilTpa() {
  const session = await requireRole("admin");
  const { rows, stat } = await getTpa();

  return (
    <>
      <Topbar nama={session.nama} />
      <TpaView rows={rows} stat={stat} />
    </>
  );
}
