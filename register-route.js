import bcrypt from "bcryptjs";
import { SignJWT } from "jose";
import pool from "@/lib/db";

// POST /api/register  body: { nama, email, password }
// Membuat akun calon siswa (role selalu "calon_siswa" — tidak bisa diminta dari browser),
// lalu langsung login (cookie spmb_session).
export async function POST(request) {
  try {
    const body = await request.json().catch(() => null);
    const nama = typeof body?.nama === "string" ? body.nama.trim().slice(0, 100) : "";
    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase().slice(0, 150) : "";
    const password = typeof body?.password === "string" ? body.password : "";

    if (!nama) return Response.json({ message: "Nama lengkap wajib diisi." }, { status: 400 });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return Response.json({ message: "Format email tidak valid." }, { status: 400 });
    }
    if (password.length < 6 || password.length > 72) {
      return Response.json({ message: "Password minimal 6 karakter." }, { status: 400 });
    }

    const [ada] = await pool.execute("SELECT id FROM users WHERE email = ?", [email]);
    if (ada.length > 0) {
      return Response.json({ message: "Email sudah terdaftar. Silakan masuk." }, { status: 409 });
    }

    const hash = await bcrypt.hash(password, 10);
    const [hasil] = await pool.execute(
      "INSERT INTO users (nama, email, password, role) VALUES (?, ?, ?, 'calon_siswa')",
      [nama, email, hash]
    );

    const respons = Response.json({
      message: "Akun berhasil dibuat.",
      user: { nama, role: "calon_siswa" },
    });

    const secret = process.env.SESSION_SECRET;
    if (secret && secret.length >= 32) {
      const token = await new SignJWT({ nama, role: "calon_siswa" })
        .setProtectedHeader({ alg: "HS256" })
        .setSubject(String(hasil.insertId))
        .setIssuedAt()
        .setExpirationTime("8h")
        .sign(new TextEncoder().encode(secret));
      const cookie = [`spmb_session=${token}`, "HttpOnly", "Path=/", "SameSite=Lax", "Max-Age=28800"];
      if (process.env.NODE_ENV === "production") cookie.push("Secure");
      respons.headers.append("Set-Cookie", cookie.join("; "));
    }

    return respons;
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return Response.json({ message: "Email sudah terdaftar. Silakan masuk." }, { status: 409 });
    }
    console.error("Register error:", error);
    return Response.json({ message: "Terjadi kesalahan pada server." }, { status: 500 });
  }
}
