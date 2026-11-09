import pool from "@/lib/db";
import { requireSiswaApi } from "@/lib/auth";
import { pastikanPendaftar } from "@/lib/siswa-data";
import { AGAMA, PENGHASILAN } from "@/lib/siswa-konst";

const TELP = /^[0-9+\-\s]{8,20}$/;

// PUT /api/siswa/data-diri   body: { draft: boolean, ...field }
//  draft = true  -> simpan apa adanya (kolom boleh kosong), hanya format yang diperiksa
//  draft = false -> semua kolom bertanda * wajib terisi ("Simpan dan lanjut")
export async function PUT(request) {
  const auth = await requireSiswaApi(request);
  if (auth.error) return auth.error;

  try {
    const b = await request.json().catch(() => null);
    if (!b) return Response.json({ message: "Data tidak valid." }, { status: 400 });
    const draft = b.draft === true;

    const t = (v, maks) => (typeof v === "string" ? v.trim().slice(0, maks) : "");
    const d = {
      nisn: t(b.nisn, 20),
      nik: t(b.nik, 20),
      tempat_lahir: t(b.tempat_lahir, 80),
      tanggal_lahir: t(b.tanggal_lahir, 10),
      jenis_kelamin: b.jenis_kelamin === "L" || b.jenis_kelamin === "P" ? b.jenis_kelamin : "",
      agama: AGAMA.includes(b.agama) ? b.agama : "",
      anak_ke: t(String(b.anak_ke ?? ""), 2),
      telepon: t(b.telepon, 20),
      alamat: t(b.alamat, 255),
      rt_rw: t(b.rt_rw, 10),
      kelurahan: t(b.kelurahan, 80),
      kecamatan: t(b.kecamatan, 80),
      kota: t(b.kota, 80),
      provinsi: t(b.provinsi, 80),
      kode_pos: t(b.kode_pos, 10),
      nama_ayah: t(b.nama_ayah, 100),
      pekerjaan_ayah: t(b.pekerjaan_ayah, 100),
      nama_ibu: t(b.nama_ibu, 100),
      pekerjaan_ibu: t(b.pekerjaan_ibu, 100),
      telepon_ortu: t(b.telepon_ortu, 20),
      penghasilan: PENGHASILAN.includes(b.penghasilan) ? b.penghasilan : "",
      asal_sekolah: t(b.asal_sekolah, 150),
      npsn: t(b.npsn, 12),
      tahun_lulus: t(b.tahun_lulus, 4),
      rata_rapor: t(b.rata_rapor, 8).replace(",", "."),
      no_ijazah: t(b.no_ijazah, 50),
    };

    const gagal = (message) => Response.json({ message }, { status: 400 });

    // --- format (selalu diperiksa kalau diisi)
    if (d.nisn && !/^\d{10}$/.test(d.nisn)) return gagal("NISN harus 10 digit angka.");
    if (d.nik && !/^\d{16}$/.test(d.nik)) return gagal("NIK harus 16 digit angka.");
    if (d.tanggal_lahir && (!/^\d{4}-\d{2}-\d{2}$/.test(d.tanggal_lahir) || Number.isNaN(Date.parse(d.tanggal_lahir)))) {
      return gagal("Tanggal lahir tidak valid.");
    }
    if (d.anak_ke && !/^\d{1,2}$/.test(d.anak_ke)) return gagal("Anak ke- harus berupa angka.");
    if (d.telepon && !TELP.test(d.telepon)) return gagal("Nomor HP tidak valid.");
    if (d.telepon_ortu && !TELP.test(d.telepon_ortu)) return gagal("Nomor HP orang tua / wali tidak valid.");
    if (d.kode_pos && !/^\d{5}$/.test(d.kode_pos)) return gagal("Kode pos harus 5 digit angka.");
    if (d.npsn && !/^\d{8}$/.test(d.npsn)) return gagal("NPSN harus 8 digit angka.");
    if (d.tahun_lulus && !/^\d{4}$/.test(d.tahun_lulus)) return gagal("Tahun lulus tidak valid.");
    if (d.rata_rapor && (!/^\d{1,3}(\.\d{1,2})?$/.test(d.rata_rapor) || Number(d.rata_rapor) > 100)) {
      return gagal("Rata-rata nilai rapor harus angka 0 sampai 100.");
    }

    // --- kolom wajib saat "Simpan dan lanjut"
    if (!draft) {
      const wajib = [
        ["nisn", "NISN"], ["nik", "NIK"], ["tempat_lahir", "Tempat lahir"], ["tanggal_lahir", "Tanggal lahir"],
        ["jenis_kelamin", "Jenis kelamin"], ["agama", "Agama"], ["anak_ke", "Anak ke-"], ["telepon", "Nomor HP"],
        ["alamat", "Alamat lengkap"], ["rt_rw", "RT / RW"], ["kelurahan", "Kelurahan / Desa"], ["kecamatan", "Kecamatan"],
        ["kota", "Kota / Kabupaten"], ["provinsi", "Provinsi"], ["kode_pos", "Kode pos"],
        ["nama_ayah", "Nama ayah"], ["pekerjaan_ayah", "Pekerjaan ayah"], ["nama_ibu", "Nama ibu"],
        ["pekerjaan_ibu", "Pekerjaan ibu"], ["telepon_ortu", "Nomor HP orang tua / wali"], ["penghasilan", "Penghasilan per bulan"],
        ["asal_sekolah", "Nama sekolah asal"], ["npsn", "NPSN sekolah"], ["tahun_lulus", "Tahun lulus"], ["rata_rapor", "Rata-rata nilai rapor"],
      ];
      const kosong = wajib.find(([k]) => !d[k]);
      if (kosong) return gagal(`${kosong[1]} wajib diisi.`);
    }

    const pid = await pastikanPendaftar(auth.session.sub);
    const n = (v) => (v === "" ? null : v);

    await pool.execute("UPDATE pendaftar SET nisn = ?, asal_sekolah = ? WHERE id = ?", [n(d.nisn), n(d.asal_sekolah), pid]);
    await pool.execute(
      `INSERT INTO data_diri (pendaftar_id, nik, tempat_lahir, tanggal_lahir, jenis_kelamin, agama, anak_ke, telepon,
         alamat, rt_rw, kelurahan, kecamatan, kota, provinsi, kode_pos, nama_ayah, pekerjaan_ayah, nama_ibu,
         pekerjaan_ibu, telepon_ortu, penghasilan, npsn, tahun_lulus, rata_rapor, no_ijazah)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE nik = VALUES(nik), tempat_lahir = VALUES(tempat_lahir), tanggal_lahir = VALUES(tanggal_lahir),
         jenis_kelamin = VALUES(jenis_kelamin), agama = VALUES(agama), anak_ke = VALUES(anak_ke), telepon = VALUES(telepon),
         alamat = VALUES(alamat), rt_rw = VALUES(rt_rw), kelurahan = VALUES(kelurahan), kecamatan = VALUES(kecamatan),
         kota = VALUES(kota), provinsi = VALUES(provinsi), kode_pos = VALUES(kode_pos), nama_ayah = VALUES(nama_ayah),
         pekerjaan_ayah = VALUES(pekerjaan_ayah), nama_ibu = VALUES(nama_ibu), pekerjaan_ibu = VALUES(pekerjaan_ibu),
         telepon_ortu = VALUES(telepon_ortu), penghasilan = VALUES(penghasilan), npsn = VALUES(npsn),
         tahun_lulus = VALUES(tahun_lulus), rata_rapor = VALUES(rata_rapor), no_ijazah = VALUES(no_ijazah)`,
      [pid, n(d.nik), n(d.tempat_lahir), n(d.tanggal_lahir), n(d.jenis_kelamin), n(d.agama), n(d.anak_ke), n(d.telepon),
       n(d.alamat), n(d.rt_rw), n(d.kelurahan), n(d.kecamatan), n(d.kota), n(d.provinsi), n(d.kode_pos),
       n(d.nama_ayah), n(d.pekerjaan_ayah), n(d.nama_ibu), n(d.pekerjaan_ibu), n(d.telepon_ortu), n(d.penghasilan),
       n(d.npsn), n(d.tahun_lulus), n(d.rata_rapor), n(d.no_ijazah)]
    );

    return Response.json({ message: draft ? "Draft tersimpan." : "Data diri tersimpan." });
  } catch (error) {
    console.error("Simpan data diri error:", error);
    return Response.json({ message: "Terjadi kesalahan pada server." }, { status: 500 });
  }
}
