// Pembuat berkas .xlsx sederhana tanpa library (zip tanpa kompresi). Hanya dipakai di server.
const TABEL = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();
function crc32(buf) {
  let c = 0xffffffff;
  for (const b of buf) c = TABEL[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function zip(files) {
  const bagian = [];
  const pusat = [];
  let offset = 0;
  for (const [nama, isi] of files) {
    const n = Buffer.from(nama);
    const d = Buffer.from(isi);
    const crc = crc32(d);
    const lokal = Buffer.alloc(30);
    lokal.writeUInt32LE(0x04034b50, 0);
    lokal.writeUInt16LE(20, 4);
    lokal.writeUInt16LE(0x0800, 6); // nama berkas UTF-8
    lokal.writeUInt32LE(crc, 14);
    lokal.writeUInt32LE(d.length, 18);
    lokal.writeUInt32LE(d.length, 22);
    lokal.writeUInt16LE(n.length, 26);
    bagian.push(lokal, n, d);

    const p = Buffer.alloc(46);
    p.writeUInt32LE(0x02014b50, 0);
    p.writeUInt16LE(20, 4);
    p.writeUInt16LE(20, 6);
    p.writeUInt16LE(0x0800, 8);
    p.writeUInt32LE(crc, 16);
    p.writeUInt32LE(d.length, 20);
    p.writeUInt32LE(d.length, 24);
    p.writeUInt16LE(n.length, 28);
    p.writeUInt32LE(offset, 42);
    pusat.push(p, n);
    offset += 30 + n.length + d.length;
  }
  const ukuranPusat = pusat.reduce((a, b) => a + b.length, 0);
  const akhir = Buffer.alloc(22);
  akhir.writeUInt32LE(0x06054b50, 0);
  akhir.writeUInt16LE(files.length, 8);
  akhir.writeUInt16LE(files.length, 10);
  akhir.writeUInt32LE(ukuranPusat, 12);
  akhir.writeUInt32LE(offset, 16);
  return Buffer.concat([...bagian, ...pusat, akhir]);
}

const esc = (s) => String(s).replace(/[<>&"']/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;", "'": "&apos;" }[c]));
// Buang karakter kontrol yang tidak boleh ada di XML.
const bersih = (s) => String(s).replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, "");

function kolom(i) {
  let s = "";
  for (i += 1; i > 0; i = Math.floor((i - 1) / 26)) s = String.fromCharCode(65 + ((i - 1) % 26)) + s;
  return s;
}

/** sheet: { nama, lebar: [..], baris: [[sel, ...], ...] }; sel = angka | teks | { v, b: true } */
export function buatXlsx(sheet) {
  const baris = sheet.baris
    .map((row, r) => {
      const sel = row
        .map((c, i) => {
          if (c === null || c === undefined || c === "") return "";
          const nilai = typeof c === "object" ? c.v : c;
          const tebal = typeof c === "object" && c.b ? ' s="1"' : "";
          const ref = `${kolom(i)}${r + 1}`;
          if (typeof nilai === "number" && Number.isFinite(nilai)) return `<c r="${ref}"${tebal}><v>${nilai}</v></c>`;
          return `<c r="${ref}"${tebal} t="inlineStr"><is><t xml:space="preserve">${esc(bersih(nilai))}</t></is></c>`;
        })
        .join("");
      return `<row r="${r + 1}">${sel}</row>`;
    })
    .join("");
  const cols = (sheet.lebar || []).map((w, i) => `<col min="${i + 1}" max="${i + 1}" width="${w}" customWidth="1"/>`).join("");

  const X = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>';
  const NS = 'xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"';
  return zip([
    ["[Content_Types].xml", `${X}<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>`],
    ["_rels/.rels", `${X}<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`],
    ["xl/workbook.xml", `${X}<workbook ${NS} xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="${esc(sheet.nama || "Laporan").slice(0, 31)}" sheetId="1" r:id="rId1"/></sheets></workbook>`],
    ["xl/_rels/workbook.xml.rels", `${X}<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`],
    ["xl/styles.xml", `${X}<styleSheet ${NS}><fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><name val="Calibri"/></font></fonts><fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill></fills><borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="2"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1"/></cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>`],
    ["xl/worksheets/sheet1.xml", `${X}<worksheet ${NS}>${cols ? `<cols>${cols}</cols>` : ""}<sheetData>${baris}</sheetData></worksheet>`],
  ]);
}
