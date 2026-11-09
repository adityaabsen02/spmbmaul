"use client";

// Excel: unduh berkas .xlsx asli. PDF: dialog cetak browser -> "Simpan sebagai PDF".
export default function AksiLaporan() {
  return (
    <div className="ad-actions kp-aksi" style={{ gap: 12 }}>
      <a className="ad-btn ad-btn-outline" href="/api/kepsek/laporan" download>Unduh Excel</a>
      <button type="button" className="ad-btn" onClick={() => window.print()}>Unduh PDF</button>
    </div>
  );
}
