// Helper fetch untuk komponen client: lempar Error berisi pesan dari server kalau gagal.
export async function kirim(url, method, body) {
  const respons = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  let data = {};
  try {
    data = await respons.json();
  } catch {
    // respons tanpa JSON
  }

  if (!respons.ok) {
    throw new Error(data.message || "Permintaan gagal.");
  }

  return data;
}
