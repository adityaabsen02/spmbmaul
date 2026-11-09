import { requireRole } from "@/lib/auth";
import { getSiswa, jumlahSoalTpa, syaratTes, DURASI_TPA_MENIT } from "@/lib/siswa-data";
import { hariTanggalJam } from "@/lib/format";
import { hitungTodo } from "@/lib/siswa-todo";
import Topbar from "../../Topbar";
import Badge from "../../Badge";
import MulaiTes from "./MulaiTes";

const BADGE = {
  ok: ["ok", "Terpenuhi"],
  wait: ["warn", "Menunggu"],
};

export default async function TesTpa() {
  const session = await requireRole("calon_siswa");
  const s = await getSiswa(session.sub);
  const jumlah = await jumlahSoalTpa();
  const syarat = syaratTes(s);

  const selesai = s.tes.nilai !== null || Boolean(s.tes.selesai);
  const berjalan = Boolean(s.tes.mulai) && !s.tes.selesai && s.tes.detik < DURASI_TPA_MENIT * 60;
  const jadwalTiba = s.tes.jadwal ? new Date(s.tes.jadwal.replace(" ", "T")) <= new Date() : false;
  const bisa = !selesai && (berjalan || (syarat.every(([, st]) => st === "ok") && jadwalTiba));

  const SARAN = {
    "Data lengkap": "Lengkapi semua kolom wajib di menu Data Diri dan pilih program di menu Pilihan program.",
    "Berkas terverifikasi": "Semua 5 berkas wajib (termasuk Rapor) harus berstatus Terverifikasi oleh admin.",
    "Pembayaran lunas": "Unggah bukti bayar; admin harus menandainya Lunas.",
    "Kartu peserta": "Kartu terbit otomatis setelah berkas terverifikasi dan pembayaran lunas.",
  };
  const belum = syarat.find(([, st]) => st !== "ok");
  let alasan = "";
  if (!selesai && !berjalan) {
    if (belum) alasan = `${belum[0]} belum terpenuhi. ${SARAN[belum[0]]}`;
    else if (!s.tes.jadwal) alasan = "Admin belum mengatur jadwal tes untuk kamu. Hubungi panitia.";
    else if (!jadwalTiba) alasan = `Tes baru dibuka pada ${hariTanggalJam(s.tes.jadwal)}.`;
  }

  const syaratBadge = (st, label) => {
    if (BADGE[st]) return BADGE[st];
    return label === "Kartu peserta" ? ["muted", "Terkunci"] : ["bad", "Belum"];
  };

  return (
    <>
      <Topbar
        judul="Tes Potensi Akademik"
        sub="Baca informasi dan petunjuk tes sebelum memulai."
        nama={s.nama}
        userSub={s.no_daftar}
        notif={hitungTodo(s).length}
      />

      <div className="sw-banner sw-banner-big">
        <span className="sw-banner-label">{selesai ? "Hasil tes" : "Jadwal tes"}</span>
        <h2>
          {selesai
            ? `Nilai kamu ${s.tes.nilai === null ? "-" : s.tes.nilai.toLocaleString("id-ID", { maximumFractionDigits: 1 })}`
            : s.tes.jadwal ? hariTanggalJam(s.tes.jadwal) : "Jadwal akan diumumkan panitia"}
        </h2>
        <p>
          {selesai
            ? "Tes sudah kamu selesaikan. Hasil seleksi dapat dilihat di menu Status seleksi."
            : "Tombol Mulai tes aktif saat jadwal tiba dan semua syarat sudah terpenuhi."}
        </p>
      </div>

      <div className="sw-grid-tes">
        <div className="sw-col">
          <div className="sw-card">
            <h3 className="sw-card-title">Informasi tes</h3>
            <div style={{ marginTop: 10 }}>
              <div className="sw-info-row"><span>Jenis tes</span><b>Tes Potensi Akademik (TPA)</b></div>
              <div className="sw-info-row"><span>Jumlah soal</span><b>{jumlah} soal pilihan ganda</b></div>
              <div className="sw-info-row"><span>Durasi</span><b>{DURASI_TPA_MENIT} menit</b></div>
              <div className="sw-info-row"><span>Kategori soal</span><b>Verbal, Numerik, Logika</b></div>
              <div className="sw-info-row"><span>Penilaian</span><b>Benar 1 poin, salah tidak mengurangi nilai</b></div>
            </div>
          </div>

          <div className="sw-card">
            <h3 className="sw-card-title">Petunjuk pengerjaan</h3>
            <ul className="sw-list">
              <li>Kerjakan sendiri tanpa bantuan orang lain atau alat bantu.</li>
              <li>Pilih satu jawaban paling tepat untuk setiap soal.</li>
              <li>Waktu berjalan otomatis dan tidak bisa dihentikan setelah tes dimulai.</li>
              <li>Klik Kumpulkan jawaban sebelum waktu habis. Jawaban terkirim otomatis jika waktu habis.</li>
              <li>Jangan menutup atau me-refresh halaman selama tes berlangsung.</li>
            </ul>
            <div className="sw-card-foot">
              <MulaiTes aktif={bisa} lanjut={berjalan} selesai={selesai} alasan={alasan} />
            </div>
          </div>
        </div>

        <div className="sw-col">
          <div className="sw-card">
            <h3 className="sw-card-title">Syarat mengikuti tes</h3>
            <div style={{ marginTop: 10 }}>
              {syarat.map(([label, st]) => {
                const [warna, teks] = syaratBadge(st, label);
                return (
                  <div key={label} className="sw-syarat">
                    <span>{label === "Data lengkap" ? "Data diri lengkap" : label === "Berkas terverifikasi" ? "Berkas terverifikasi" : label === "Pembayaran lunas" ? "Pembayaran lunas" : label}</span>
                    <Badge warna={warna}>{teks}</Badge>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="sw-card">
            <h3 className="sw-card-title">Sebelum mulai</h3>
            <ul className="sw-list sw-list-plain">
              <li>Pastikan koneksi internet stabil.</li>
              <li>Gunakan laptop atau HP dengan baterai penuh.</li>
              <li>Cari tempat yang tenang dan nyaman.</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
