import Link from "next/link";
import "./landing.css";

export const metadata = { title: "SPMB SMK Citra Negara" };

/* ====== ISI / UBAH DI SINI ====== */
const KONTAK = {
  alamat: "Isi alamat lengkap sekolah di sini",
  telepon: "08xx-xxxx-xxxx",
  email: "info@smkcitranegara.sch.id",
  jam: "Senin - Sabtu, 08.00 - 14.00 WIB",
};

const MENU = [
  ["Beranda", "/#beranda"],
  ["Tentang", "/#tentang"],
  ["Program study", "/#program-study"],
  ["Informasi", "/#informasi"],
  ["Kontak", "/#kontak"],
];

const STATISTIK = [
  ["5", "Program keahlian"],
  ["288", "Kuota siswa baru"],
  ["60", "Menit tes TPA"],
  ["100%", "Pendaftaran online"],
];

const KEUNGGULAN = [
  ["Kurikulum berbasis industri", "Materi disusun bersama dunia usaha agar lulusan siap kerja."],
  ["Praktik langsung", "Laboratorium dan bengkel kerja untuk setiap program keahlian."],
  ["Pembinaan karakter", "Nilai-nilai Yayasan At-Taqwa Kemiri Jaya dalam keseharian siswa."],
];

const PROGRAM = [
  ["AK", "Akuntansi", "Pencatatan keuangan, perpajakan, dan penggunaan aplikasi akuntansi.", "Staf akuntansi, kasir, administrasi keuangan"],
  ["MP", "Manajemen Perkantoran", "Administrasi, kearsipan, korespondensi, dan layanan bisnis.", "Sekretaris, staf administrasi, customer service"],
  ["PM", "Pemasaran", "Strategi penjualan, pemasaran digital, dan manajemen toko.", "Sales, marketing digital, wirausaha"],
  ["MM", "Multimedia", "Desain grafis, fotografi, videografi, dan animasi.", "Desainer grafis, editor video, content creator"],
  ["TKJ", "Teknik Komputer dan Jaringan", "Perakitan komputer, jaringan, server, dan keamanan sistem.", "Teknisi jaringan, administrator sistem, IT support"],
];

const ALUR = [
  ["Buat akun", "Daftar dengan nama, email, dan password."],
  ["Lengkapi data & berkas", "Isi data diri, unggah dokumen, pilih program."],
  ["Bayar & ikuti tes", "Bayar biaya pendaftaran lalu kerjakan tes TPA online."],
  ["Pengumuman & daftar ulang", "Lihat hasil seleksi dan lakukan daftar ulang."],
];

export default function Landing() {
  return (
    <main className="ln">
      <header className="ln-nav">
        <Link href="/" className="ln-brand">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/aset/logo.png" alt="Logo SMK Citra Negara" />
          <span>
            <b>Citra Negara</b>
            <small>SMK Citra Negara - YAYASAN AT-TAQWA KEMIRI JAYA</small>
          </span>
        </Link>

        <nav className="ln-menu">
          {MENU.map(([label, href]) => (
            <a key={label} href={href}>{label}</a>
          ))}
          <Link href="/daftar" className="ln-daftar">Daftar sekarang</Link>
        </nav>
      </header>

      {/* BERANDA */}
      <section className="ln-hero" id="beranda">
        <h1>SPMB</h1>
        <h2>SMK CITRA NEGARA</h2>
        <p>Menuju Indonesia Emas.</p>
        <Link href="/login" className="ln-masuk">Masuk</Link>
      </section>

      {/* TENTANG */}
      <section className="ln-sec ln-dark" id="tentang">
        <div className="ln-wrap">
          <span className="ln-eyebrow">Tentang kami</span>
          <h3>SMK Citra Negara</h3>
          <p className="ln-lead">
            SMK Citra Negara di bawah naungan Yayasan At-Taqwa Kemiri Jaya mencetak lulusan yang
            terampil, berkarakter, dan siap bersaing di dunia kerja maupun melanjutkan pendidikan.
          </p>

          <div className="ln-stat">
            {STATISTIK.map(([angka, ket]) => (
              <div key={ket}><b>{angka}</b><span>{ket}</span></div>
            ))}
          </div>

          <div className="ln-grid3">
            {KEUNGGULAN.map(([judul, isi]) => (
              <div key={judul} className="ln-kartu-gelap">
                <h4>{judul}</h4>
                <p>{isi}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROGRAM STUDY */}
      <section className="ln-sec ln-terang" id="program-study">
        <div className="ln-wrap">
          <span className="ln-eyebrow">Program study</span>
          <h3>Lima program keahlian</h3>
          <p className="ln-lead">Pilih program yang sesuai minat dan bakatmu. Kamu bisa memilih sampai dua program saat mendaftar.</p>

          <div className="ln-grid3">
            {PROGRAM.map(([kode, nama, isi, prospek]) => (
              <article key={kode} className="ln-prog">
                <span className="ln-kode">{kode}</span>
                <h4>{nama}</h4>
                <p>{isi}</p>
                <small><b>Prospek:</b> {prospek}</small>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* INFORMASI */}
      <section className="ln-sec ln-dark" id="informasi">
        <div className="ln-wrap">
          <span className="ln-eyebrow">Informasi pendaftaran</span>
          <h3>Alur pendaftaran</h3>
          <p className="ln-lead">Seluruh proses dilakukan online, dari membuat akun sampai daftar ulang.</p>

          <ol className="ln-alur">
            {ALUR.map(([judul, isi], i) => (
              <li key={judul}>
                <span>{i + 1}</span>
                <h4>{judul}</h4>
                <p>{isi}</p>
              </li>
            ))}
          </ol>

          <div className="ln-cta">
            <Link href="/daftar" className="ln-masuk">Daftar sekarang</Link>
            <Link href="/login" className="ln-link">Sudah punya akun? Masuk</Link>
          </div>
        </div>
      </section>

      {/* KONTAK */}
      <section className="ln-sec ln-terang" id="kontak">
        <div className="ln-wrap">
          <span className="ln-eyebrow">Kontak</span>
          <h3>Hubungi panitia SPMB</h3>
          <div className="ln-grid4">
            <div className="ln-info"><b>Alamat</b><span>{KONTAK.alamat}</span></div>
            <div className="ln-info"><b>Telepon / WhatsApp</b><span>{KONTAK.telepon}</span></div>
            <div className="ln-info"><b>Email</b><span>{KONTAK.email}</span></div>
            <div className="ln-info"><b>Jam layanan</b><span>{KONTAK.jam}</span></div>
          </div>
        </div>
      </section>

      <footer className="ln-foot">
        © {new Date().getFullYear()} SMK Citra Negara · Yayasan At-Taqwa Kemiri Jaya
      </footer>
    </main>
  );
}
