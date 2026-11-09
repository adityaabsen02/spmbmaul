"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, GraduationCap, Lock, User } from "lucide-react";
import "./login.css";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [pesan, setPesan] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPesan("");
    setLoading(true);

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setPesan(data.message || "Login gagal.");
        return;
      }

      if (data.user.role === "calon_siswa") {
        router.push("/dashboard/calon-siswa");
      } else if (data.user.role === "admin") {
        router.push("/dashboard/admin");
      } else if (data.user.role === "kepsek") {
        router.push("/dashboard/kepsek");
      } else {
        setPesan("Role akun tidak dikenali.");
        return;
      }

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

        {/* KANAN: form */}
        <section className="lg-panel">
          <div className="lg-card">
            <GraduationCap className="lg-cap" size={44} strokeWidth={2.2} />
            <h3 className="lg-welcome">Selamat Datang</h3>
            <p className="lg-welcome-sub">
              Silahkan masuk ke akun ANDA untuk melanjutkan Pendaftaran SPMB
            </p>

            <div className="lg-tabs">
              <button type="button" className="lg-tab lg-tab-active">
                Masuk
              </button>
              <Link href="/daftar" className="lg-tab">
                Daftar
              </Link>
            </div>

            <form onSubmit={handleSubmit}>
              <label className="lg-field">
                <User size={18} className="lg-field-icon" fill="currentColor" />
                <input
                  type="text"
                  placeholder="NISN/EMAIL"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="username"
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
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="lg-eye"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={
                    showPassword ? "Sembunyikan password" : "Lihat password"
                  }
                >
                  {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                </button>
              </label>

              <div className="lg-row">
                <label className="lg-remember">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                  />
                  <span>Ingat saya</span>
                </label>
                <Link href="/lupa-password" className="lg-forgot">
                  Lupa password?
                </Link>
              </div>

              {pesan && <p className="lg-error">{pesan}</p>}

              <button type="submit" className="lg-submit" disabled={loading}>
                {loading ? "Memproses..." : "Masuk"}
              </button>
            </form>

            <p className="lg-foot">
              Belum punya akun? <Link href="/daftar">Daftar sekarang</Link>
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}