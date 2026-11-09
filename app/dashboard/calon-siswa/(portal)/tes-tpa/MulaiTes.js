"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { kirim } from "../../kirim";

export default function MulaiTes({ aktif, lanjut, selesai, alasan }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [pesan, setPesan] = useState("");

  async function mulai() {
    setPesan("");
    setLoading(true);
    try {
      await kirim("/api/siswa/tes/mulai", "POST");
      router.push("/dashboard/calon-siswa/tes");
    } catch (err) {
      setPesan(err.message);
      setLoading(false);
    }
  }

  const teks = selesai ? "Tes selesai" : lanjut ? "Lanjutkan tes" : "Mulai tes";

  return (
    <div style={{ textAlign: "right" }}>
      <button type="button" className={aktif ? "sw-btn" : "sw-btn sw-btn-off"} disabled={!aktif || loading} onClick={mulai}>
        {loading ? "Membuka tes..." : teks}
      </button>
      {!aktif && alasan && <p className="sw-note">{alasan}</p>}
      {pesan && <p className="sw-note">{pesan}</p>}
    </div>
  );
}
