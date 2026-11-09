// Banner hijau di bagian atas tiap halaman. `aksi` = tombol putih di kanan (opsional).
export default function Banner({ judul, sub, aksi }) {
  return (
    <div className="ad-banner">
      <div>
        <h2>{judul}</h2>
        {sub && <p>{sub}</p>}
      </div>
      {aksi}
    </div>
  );
}
