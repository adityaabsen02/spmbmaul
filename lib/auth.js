import { jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

// Dari materi: verifikasi token sesi.
export async function getSession(token) {
  const secret = process.env.SESSION_SECRET;

  if (!token || !secret || secret.length < 32) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(secret),
      { algorithms: ["HS256"] }
    );

    return payload;
  } catch {
    return null;
  }
}

const DASHBOARD_PATH = {
  calon_siswa: "/dashboard/calon-siswa",
  admin: "/dashboard/admin",
  kepsek: "/dashboard/kepsek",
};

// Dipakai di setiap halaman dashboard (Tahap 6).
// - belum login        -> /login
// - role tidak sesuai  -> dialihkan ke dashboard miliknya sendiri
export async function requireRole(role) {
  const store = await cookies();
  const session = await getSession(store.get("spmb_session")?.value);

  if (!session) {
    redirect("/login");
  }

  if (session.role !== role) {
    redirect(DASHBOARD_PATH[session.role] ?? "/login");
  }

  return session;
}

// Dipakai di SEMUA API /api/admin/*  (role admin) dan /api/siswa/* (role calon_siswa).
// Mengembalikan { session } kalau role sesuai, atau { error: Response } kalau bukan.
export async function requireAdminApi(request) {
  return requireRoleApi(request, "admin");
}

export async function requireKepsekApi(request) {
  return requireRoleApi(request, "kepsek");
}

export async function requireSiswaApi(request) {
  return requireRoleApi(request, "calon_siswa");
}

async function requireRoleApi(request, role) {
  const session = await getSession(request.cookies.get("spmb_session")?.value);

  if (!session) {
    return {
      error: Response.json({ message: "Silakan login dulu." }, { status: 401 }),
    };
  }

  if (session.role !== role) {
    return {
      error: Response.json({ message: "Akses ditolak." }, { status: 403 }),
    };
  }

  // Tolak permintaan ubah-data yang berasal dari situs lain.
  if (!["GET", "HEAD"].includes(request.method)) {
    const origin = request.headers.get("origin");

    if (origin) {
      let sama = false;
      try {
        sama = new URL(origin).host === request.headers.get("host");
      } catch {
        sama = false;
      }

      if (!sama) {
        return {
          error: Response.json({ message: "Asal permintaan ditolak." }, { status: 403 }),
        };
      }
    }
  }

  return { session };
}
