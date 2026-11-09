"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ukuranFile } from "@/lib/format";
import Badge from "../../Badge";
import { kirim } from "../../kirim";

const BADGE = {
  terverifikasi: ["ok", "Terverifikasi"],
  menunggu: ["warn", "Menunggu verifikasi"],
  ditolak: ["bad", "Perlu diperbaiki"],
};

function Baris({ b, onPilih, sibuk }) {
  const input = useRef(null);
  const [tarik, setTarik] = useState(false);
  const bad = b.status === "ditolak";
  const kosong = !b.ada;
  const opsional = !b.wajib && kosong;

  const [warna, teks] = kosong ? (b.wajib ? ["warn", "Belum diunggah"] : ["muted", "Opsional"]) : BADGE[b.status] || ["muted", b.status];
  const tombol = bad ? "Unggah ulang" : kosong ? "Unggah" : "Ganti";
  const penuh = bad || kosong;

  return (
    <div
      className={`sw-file${bad ? " sw-file-bad" : ""}${opsional ? " sw-file-opt" : ""}`}
      style={tarik ? { outline: "2px dashed #1d6413" } : undefined}
      onDragOver={(e) => { e.preventDefault(); setTarik(true); }}
      onDragLeave={() => setTarik(false)}
      onDrop={(e) => { e.preventDefault(); setTarik(false); if (e.dataTransfer.files[0]) onPilih(b.key, e.dataTransfer.files[0]); }}
    >
      <span className="sw-file-ico">{kosong ? "+" : (b.ext === "jpeg" ? "jpg" : b.ext).toUpperCase()}</span>

      <div className="sw-file-body">
        <div className="sw-file-name">{b.judul}</div>
        <div className="sw-file-meta">
          {kosong ? "Belum ada berkas. Tarik file ke sini atau klik Unggah." : `${b.nama} · ${ukuranFile(b.ukuran)}`}
        </div>
        {bad && <div className="sw-file-err">{b.catatan || "Berkas ditolak panitia. Silakan unggah ulang."}</div>}
      </div>

      <div className="sw-file-right">
        <Badge warna={warna}>{teks}</Badge>
        <input
          ref={input}
          type="file"
          className="sw-file-input"
          accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
          onChange={(e) => { if (e.target.files[0]) onPilih(b.key, e.target.files[0]); e.target.value = ""; }}
        />
        <button
          type="button"
          className={penuh ? "sw-btn sw-btn-sm" : "sw-btn sw-btn-out sw-btn-sm"}
          disabled={sibuk}
          onClick={() => input.current?.click()}
        >
          {sibuk ? "Mengunggah..." : tombol}
        </button>
      </div>
    </div>
  );
}

export default function BerkasList({ daftar, terunggah, total }) {
  const router = useRouter();
  const [sibuk, setSibuk] = useState(null);
  const [pesan, setPesan] = useState(null);

  async function pilih(jenis, file) {
    setPesan(null);
    if (file.size > 2 * 1024 * 1024) {
      setPesan({ tipe: "bad", teks: "Ukuran berkas maksimal 2 MB." });
      return;
    }
    const form = new FormData();
    form.append("file", file);
    setSibuk(jenis);
    try {
      const data = await kirim(`/api/siswa/berkas/${jenis}`, "POST", form);
      setPesan({ tipe: "ok", teks: data.message });
      router.refresh();
    } catch (err) {
      setPesan({ tipe: "bad", teks: err.message });
    } finally {
      setSibuk(null);
    }
  }

  return (
    <div>
      <div className="sw-banner sw-banner-bar">
        <div className="sw-bar-head">
          <span>Berkas terunggah</span>
          <span>
            {terunggah} dari {total}
          </span>
        </div>
        <div className="sw-bar">
          <span style={{ width: `${(terunggah / total) * 100}%` }} />
        </div>
      </div>

      {pesan && <p className={`sw-msg sw-msg-${pesan.tipe}`}>{pesan.teks}</p>}

      <div className="sw-card sw-form-card">
        <h3 className="sw-card-title">Unggah dokumen persyaratan</h3>
        <p className="sw-card-sub">
          Format PDF, JPG, atau PNG. Ukuran maksimal 2 MB per berkas. Pastikan foto/scan jelas dan tidak terpotong.
        </p>
        <div className="sw-files">
          {daftar.map((b) => (
            <Baris key={b.key} b={b} onPilih={pilih} sibuk={sibuk === b.key} />
          ))}
        </div>
      </div>

      <div className="sw-foot">
        <Link href="/dashboard/calon-siswa/data-diri" className="sw-btn sw-btn-out">
          Kembali ke biodata
        </Link>
        <Link href="/dashboard/calon-siswa/pembayaran" className="sw-btn">
          Simpan dan lanjut
        </Link>
      </div>
    </div>
  );
}
