"use client";

// Cetak & Unduh PDF: keduanya memakai dialog cetak browser (pilih "Simpan sebagai PDF").
export default function AksiKartu() {
  return (
    <div className="sw-kartu-aksi">
      <button type="button" className="sw-btn sw-btn-out" onClick={() => window.print()}>Cetak kartu</button>
      <button type="button" className="sw-btn" onClick={() => window.print()}>Unduh PDF</button>
    </div>
  );
}
