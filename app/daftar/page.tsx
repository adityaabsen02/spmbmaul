"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, GraduationCap, Lock, Mail, User } from "lucide-react";
import "../login/login.css";

export default function DaftarPage() {
  const router = useRouter();
  const [nama, setNama] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [konfirmasi, setKonfirmasi] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [pesan, setPesan] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPesan("");

    if (password.length < 6) {
      setPesan("Password minimal 6 karakter.");
      return;
    }
    if (password !== konfirmasi) {
      setPesan("Konfirmasi password tidak sama.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nama, email, password }),
      });
      const data = await response.json();

      if (!response.ok) {
        setPesan(data.message || "Pendaftaran gagal.");
        return;
      }

      router.push("/dashboard/calon-siswa");
      router.refresh();
    } catch {
      setPesan("Tidak dapat terhubung ke server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="lg-page">
      {/* NAVBAR */}
      <header className="lg-nav">
        <Link href="/" className="lg-brand">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/aset/logo.png" alt="Logo SMK Citra Negara" className="lg-logo" />
          <span className="lg-brand-text">
            <span className="lg-brand-title">Citra Negara</span>
            <span className="lg-brand-sub">
              SMK Citra Negara - YAYASAN AT-TAQWA KEMIRI JAYA
            </span>
          </span>
        </Link>

        <nav className="lg-links">
          <Link href="/">Beranda</Link>
          <Link href="/#tentang">Tentang</Link>
          <Link href="/#program-study">Program study</Link>
          <Link href="/#informasi">Informasi</Link>
          <Link href="/#kontak">Kontak</Link>
          <Link href="/daftar" className="lg-nav-cta">
            Daftar sekarang
          </Link>
        </nav>
      </header>

      <main className="lg-main">
        {/* KIRI: foto gedung */}
        <section
          className="lg-hero"
          style={{
            backgroundImage:
              'linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.55)), url("/aset/gedung-sekolah.png")',
          }}
        >
          <div className="lg-hero-text">
            <h1>SPMB</h1>
            <h2>SMK CITRA NEGARA</h2>
            <p>Menuju Indonesia Emas.</p>
          </div>
        </section>

        {/* KANAN: form daftar */}
        <section className="lg-panel">
          <div className="lg-card">
            <GraduationCap className="lg-cap" size={44} strokeWidth={2.2} />
            <h3 className="lg-welcome">Daftar Akun</h3>
            <p className="lg-welcome-sub">
              Silahkan buat akun untuk mengikuti Pendaftaran SPMB
            </p>

            <div className="lg-tabs">
              <Link href="/login" className="lg-tab">
                Masuk
              </Link>
              <button type="button" className="lg-tab lg-tab-active">
                Daftar
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <label className="lg-field">
                <User size={18} className="lg-field-icon" fill="currentColor" />
                <input
                  type="text"
                  placeholder="Nama lengkap"
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  autoComplete="name"
                  required
                />
              </label>

              <label className="lg-field">
                <Mail size={18} className="lg-field-icon" />
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </label>

              <label className="lg-field">
                <Lock size={18} className="lg-field-icon" fill="currentColor" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  className="lg-eye"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Sembunyikan password" : "Lihat password"}
                >
                  {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                </button>
              </label>

              <label className="lg-field">
                <Lock size={18} className="lg-field-icon" fill="currentColor" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Konfirmasi password"
                  value={konfirmasi}
                  onChange={(e) => setKonfirmasi(e.target.value)}
                  autoComplete="new-password"
                  required
                />
              </label>

              {pesan && <p className="lg-error">{pesan}</p>}

              <button type="submit" className="lg-submit" disabled={loading}>
                {loading ? "Memproses..." : "Daftar"}
              </button>
            </form>

            <p className="lg-foot">
              Sudah punya akun? <Link href="/login">Masuk sekarang</Link>
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}