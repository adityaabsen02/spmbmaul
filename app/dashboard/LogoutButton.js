"use client";

import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      style={{
        marginTop: 24,
        padding: "10px 24px",
        background: "#1f6f1a",
        color: "#fff",
        border: "none",
        borderRadius: 6,
        fontWeight: 700,
        cursor: "pointer",
      }}
    >
      Keluar
    </button>
  );
}
