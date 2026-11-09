// Helper fetch untuk komponen client: lempar Error berisi pesan dari server kalau gagal.
// `body` boleh objek (dikirim JSON) atau FormData (dikirim multipart).
export async function kirim(url, method, body) {
  const form = typeof FormData !== "undefined" && body instanceof FormData;
  const respons = await fetch(url, {
    method,
    headers: form || body === undefined ? undefined : { "Content-Type": "application/json" },
    body: body === undefined ? undefined : form ? body : JSON.stringify(body),
  });

  let data = {};
  try {
    data = await respons.json();
  } catch {
    // respons tanpa JSON
  }
  if (!respons.ok) throw new Error(data.message || "Permintaan gagal.");
  return data;
}
