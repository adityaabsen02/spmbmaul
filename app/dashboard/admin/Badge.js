import { BADGE } from "@/lib/format";

// <Badge grup="bayar" nilai="lunas" />  ->  label hijau "Lunas"
export default function Badge({ grup, nilai }) {
  const [teks, warna] = BADGE[grup]?.[nilai] || [String(nilai ?? "-"), "muted"];
  return <span className={`ad-badge ad-badge-${warna}`}>{teks}</span>;
}
