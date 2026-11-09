// <Badge warna="ok">Lengkap</Badge>   warna: ok | warn | bad | muted
export default function Badge({ warna = "muted", children }) {
  return <span className={`sw-badge sw-badge-${warna}`}>{children}</span>;
}
