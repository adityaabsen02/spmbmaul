import { mkdir, writeFile, readFile, unlink, stat } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

// Semua berkas upload disimpan DI LUAR folder public (folder `storage/`).
export const STORAGE_ROOT = path.resolve(process.cwd(), "storage");
export const MAKS_BYTE = 2 * 1024 * 1024; // 2 MB, sesuai teks di desain

const TIPE = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".pdf": "application/pdf",
};

// Cek isi berkas (bukan sekadar nama) supaya skrip/HTML tidak bisa menyamar jadi gambar.
function deteksi(buf) {
  if (buf.length > 8 && buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) return "png";
  if (buf.length > 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "jpg";
  if (buf.length > 4 && buf.subarray(0, 5).toString("latin1") === "%PDF-") return "pdf";
  return null;
}

// -> { path } berhasil, atau { error } kalau berkas ditolak.
function namaAman(nama) {
  const dasar = String(nama || "").replace(/\.[^.]*$/, "").toLowerCase().replace(/[^a-z0-9_-]+/g, "-").replace(/^-+|-+$/g, "");
  return dasar.slice(0, 40) || "berkas";
}

// Nama asli yang dipulihkan dari path: "dokumen/3/rapor-1a2b3c4d__rapor-ku.pdf" -> "rapor-ku.pdf"
export function namaTampil(relatif) {
  const nama = String(relatif || "").split("/").pop() || "";
  const m = /__(.+)$/.exec(nama);
  return m ? m[1] : nama.replace(/-[0-9a-f]{8}(?=\.)/, "");
}

export async function simpanBerkas(file, subfolder, awalan) {
  if (!file || typeof file === "string" || typeof file.arrayBuffer !== "function") {
    return { error: "Pilih berkas terlebih dahulu." };
  }
  if (file.size <= 0) return { error: "Berkas kosong." };
  if (file.size > MAKS_BYTE) return { error: "Ukuran berkas maksimal 2 MB." };

  const buf = Buffer.from(await file.arrayBuffer());
  const jenis = deteksi(buf);
  if (!jenis) return { error: "Format berkas harus PDF, JPG, atau PNG." };

  const relatif = path.posix.join(subfolder, `${awalan}-${randomUUID().slice(0, 8)}__${namaAman(file.name)}.${jenis}`);
  const lengkap = path.resolve(STORAGE_ROOT, relatif);
  if (!lengkap.startsWith(STORAGE_ROOT + path.sep)) return { error: "Lokasi berkas tidak valid." };

  await mkdir(path.dirname(lengkap), { recursive: true });
  await writeFile(lengkap, buf);
  return { path: relatif };
}

export async function hapusBerkas(relatif) {
  if (!relatif) return;
  const lengkap = path.resolve(STORAGE_ROOT, relatif);
  if (!lengkap.startsWith(STORAGE_ROOT + path.sep)) return;
  // berkas contoh bawaan tidak ikut terhapus
  if (relatif.startsWith("contoh/")) return;
  await unlink(lengkap).catch(() => {});
}

export async function kirimBerkas(relatif) {
  if (!relatif) return Response.json({ message: "Berkas tidak ditemukan." }, { status: 404 });
  const lengkap = path.resolve(STORAGE_ROOT, relatif);
  if (!lengkap.startsWith(STORAGE_ROOT + path.sep)) {
    return Response.json({ message: "Lokasi berkas tidak valid." }, { status: 400 });
  }
  const tipe = TIPE[path.extname(lengkap).toLowerCase()];
  if (!tipe) return Response.json({ message: "Jenis berkas tidak didukung." }, { status: 415 });
  let isi;
  try {
    isi = await readFile(lengkap);
  } catch {
    return Response.json({ message: "Berkas tidak ada di server." }, { status: 404 });
  }
  return new Response(isi, {
    headers: {
      "Content-Type": tipe,
      "Content-Disposition": "inline",
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

// Ukuran berkas di disk (byte), 0 kalau tidak ada.
export async function ukuranBerkas(relatif) {
  if (!relatif) return 0;
  const lengkap = path.resolve(STORAGE_ROOT, relatif);
  if (!lengkap.startsWith(STORAGE_ROOT + path.sep)) return 0;
  try {
    return (await stat(lengkap)).size;
  } catch {
    return 0;
  }
}
