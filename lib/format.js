// Helper tampilan — aman dipakai di server maupun client component.

export function rupiah(n) {
  const angka = String(Math.round(Number(n) || 0));
  return "Rp " + angka.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

// Menerima teks "YYYY-MM-DD" atau "YYYY-MM-DD HH:mm:ss" dari database -> "dd/mm/yyyy"
export function tanggal(s) {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s || "");
  return m ? `${m[3]}/${m[2]}/${m[1]}` : "-";
}

// "YYYY-MM-DD HH:mm:ss" -> "HH.mm"
export function jam(s) {
  const m = /[ T](\d{2}):(\d{2})/.exec(s || "");
  return m ? `${m[1]}.${m[2]}` : "";
}

// "dd/mm/yyyy · HH.mm"
export function jadwalTeks(s) {
  return s ? `${tanggal(s)} · ${jam(s)}` : "-";
}

// Satu huruf untuk avatar
export function inisial(nama) {
  return (String(nama || "?").trim()[0] || "?").toUpperCase();
}

// Urutan tab seperti di desain Figma (Frame 18)
export const JENIS_DOKUMEN = [
  { key: "ijazah", label: "Ijazah / SKL" },
  { key: "kartu_keluarga", label: "Kartu Keluarga" },
  { key: "akta_lahir", label: "Akta Lahir" },
  { key: "pas_foto", label: "Pas Foto" },
  { key: "rapor", label: "Rapor Sem. 1-5" },
  { key: "sertifikat", label: "Sertifikat" },
];

// [teks, warna]
export const BADGE = {
  kepsek: {
    menunggu: ["Menunggu", "warn"],
    disetujui: ["Disetujui", "ok"],
    ditolak: ["Ditolak", "bad"],
  },
  dokumen: {
    lengkap: ["Lengkap", "ok"],
    belum: ["Belum lengkap", "warn"],
    ditolak: ["Ditolak", "bad"],
  },
  bayar: {
    lunas: ["Lunas", "ok"],
    menunggu: ["Menunggu", "warn"],
    ditolak: ["Ditolak", "bad"],
    belum: ["Belum", "bad"],
  },
  status: {
    lulus: ["Lulus", "ok"],
    menunggu: ["Menunggu", "warn"],
    ditolak: ["Ditolak", "bad"],
  },
  berkas: {
    terverifikasi: ["Terverifikasi", "ok"],
    menunggu: ["Menunggu", "warn"],
    ditolak: ["Ditolak", "bad"],
  },
  tpa: {
    selesai: ["Dinilai", "ok"],
    belum: ["Belum dinilai", "warn"],
  },
  pengumuman: {
    terbit: ["Terbit", "ok"],
    draf: ["Draf", "muted"],
  },
};

// Status periode pendaftaran dari tanggal buka/tutup (format YYYY-MM-DD).
export function statusPeriode(buka, tutup) {
  if (!buka || !tutup) return { teks: "Belum diatur", warna: "muted", kode: "kosong" };
  const hariIni = new Date().toLocaleDateString("sv-SE"); // YYYY-MM-DD
  if (hariIni < buka) return { teks: "Belum dibuka", warna: "warn", kode: "belum" };
  if (hariIni > tutup) return { teks: "Ditutup", warna: "bad", kode: "tutup" };
  return { teks: "Aktif", warna: "ok", kode: "aktif" };
}

/* ---------- Tanggal ketikan "dd/mm/yyyy" <-> "YYYY-MM-DD" ---------- */

// "2026-10-01" -> "01/10/2026" ("" kalau kosong)
export function isoKeId(iso) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || "");
  return m ? `${m[3]}/${m[2]}/${m[1]}` : "";
}

// "01/10/2026" -> "2026-10-01"; null kalau tidak valid; "" kalau kosong
export function idKeIso(teks) {
  const s = String(teks || "").trim();
  if (!s) return "";
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(s);
  if (!m) return null;
  const [, d, mo, y] = m;
  const tgl = new Date(Date.UTC(Number(y), Number(mo) - 1, Number(d)));
  const sama =
    tgl.getUTCFullYear() === Number(y) &&
    tgl.getUTCMonth() === Number(mo) - 1 &&
    tgl.getUTCDate() === Number(d);
  return sama ? `${y}-${mo}-${d}` : null;
}

// Sisipkan "/" otomatis saat mengetik: "01102026" -> "01/10/2026"
export function maskTanggal(teks) {
  const d = String(teks || "").replace(/\D/g, "").slice(0, 8);
  if (d.length <= 2) return d;
  if (d.length <= 4) return `${d.slice(0, 2)}/${d.slice(2)}`;
  return `${d.slice(0, 2)}/${d.slice(2, 4)}/${d.slice(4)}`;
}

/* ---------- Format tanggal panjang (area calon siswa) ---------- */
const HARI = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
const BULAN = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

function pecah(s) {
  const m = /^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2}))?/.exec(s || "");
  if (!m) return null;
  return { y: +m[1], mo: +m[2], d: +m[3], h: m[4], mi: m[5] };
}

// "2026-10-10" -> "10 Oktober 2026"
export function tanggalPanjang(s) {
  const p = pecah(s);
  return p ? `${p.d} ${BULAN[p.mo - 1]} ${p.y}` : "-";
}

// "2026-10-10" -> "10 Okt 2026"
export function tanggalPendek(s) {
  const p = pecah(s);
  return p ? `${p.d} ${BULAN[p.mo - 1].slice(0, 3)} ${p.y}` : "-";
}

// "2026-10-10 08:00:00" -> "Sabtu, 10 Oktober 2026, 08.00 WIB"
export function hariTanggalJam(s) {
  const p = pecah(s);
  if (!p) return "";
  const hari = HARI[new Date(Date.UTC(p.y, p.mo - 1, p.d)).getUTCDay()];
  return `${hari}, ${p.d} ${BULAN[p.mo - 1]} ${p.y}${p.h ? `, ${p.h}.${p.mi} WIB` : ""}`;
}

export function ukuranFile(byte) {
  return byte >= 1048576 ? `${(byte / 1048576).toFixed(1).replace(".", ",")} MB` : `${Math.max(1, Math.round(byte / 1024))} KB`;
}
