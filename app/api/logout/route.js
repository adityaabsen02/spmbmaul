export async function POST() {
  const response = Response.json({ message: "Logout berhasil." });

  // Hapus cookie sesi dengan Max-Age=0
  response.headers.append(
    "Set-Cookie",
    "spmb_session=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0"
  );

  return response;
}
