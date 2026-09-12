/**
 * Zero-dependency true `.xlsx` generator.
 *
 * Builds a minimal, valid XLSX (Office Open XML inside a ZIP container) from a
 * plain array of objects — no third-party libraries, no known CVEs, no
 * "format mismatch" warning in Excel. Column headers come from the object keys
 * (first-seen order), e.g.:
 *   [{ "Tour Name": "Pyramids", "Client": "Omar", "Price": 1200 }, ...]
 *
 * The heavy lifting (buildXlsxBytes) is a pure function so it is unit-testable
 * in any JS runtime; exportTableToExcel() adds the browser download wiring.
 */

export type XlsxRow = { [key: string]: unknown };

/* ---------------------------------- helpers ---------------------------------- */

/** Encode a JS string to UTF-8 bytes (surrogate-pair aware). */
function strBytes(s: string): Uint8Array {
  const bytes: number[] = [];
  for (let i = 0; i < s.length; i++) {
    let code = s.charCodeAt(i);
    if (code >= 0xd800 && code <= 0xdbff && i + 1 < s.length) {
      const low = s.charCodeAt(i + 1);
      if (low >= 0xdc00 && low <= 0xdfff) {
        code = 0x10000 + ((code - 0xd800) << 10) + (low - 0xdc00);
        i++;
      }
    }
    if (code < 0x80) bytes.push(code);
    else if (code < 0x800) bytes.push(0xc0 | (code >> 6), 0x80 | (code & 0x3f));
    else if (code < 0x10000)
      bytes.push(0xe0 | (code >> 12), 0x80 | ((code >> 6) & 0x3f), 0x80 | (code & 0x3f));
    else
      bytes.push(
        0xf0 | (code >> 18),
        0x80 | ((code >> 12) & 0x3f),
        0x80 | ((code >> 6) & 0x3f),
        0x80 | (code & 0x3f)
      );
  }
  return new Uint8Array(bytes);
}

/** Standard CRC-32 (IEEE 802.3 / zlib). */
function crc32(data: Uint8Array): number {
  let crc = 0xffffffff;
  for (let i = 0; i < data.length; i++) {
    crc ^= data[i];
    for (let k = 0; k < 8; k++) {
      crc = crc & 1 ? 0xedb88320 ^ (crc >>> 1) : crc >>> 1;
    }
  }
  return crc ^ 0xffffffff;
}

function appendU16(arr: number[], v: number): void {
  arr.push(v & 0xff, (v >> 8) & 0xff);
}
function appendU32(arr: number[], v: number): void {
  arr.push(v & 0xff, (v >> 8) & 0xff, (v >> 16) & 0xff, (v >> 24) & 0xff);
}
function pushBytes(arr: number[], bytes: Uint8Array): void {
  for (let i = 0; i < bytes.length; i++) arr.push(bytes[i]);
}

/** Build a STORE (uncompressed) ZIP archive from name/content entries. */
function zipStore(entries: Array<{ name: string; data: Uint8Array }>): Uint8Array {
  const localAndData: number[] = [];
  const central: number[] = [];
  let offset = 0;

  for (const entry of entries) {
    const nameBytes = strBytes(entry.name);
    const crc = crc32(entry.data);
    const size = entry.data.length;

    // Local file header
    appendU32(localAndData, 0x04034b50);
    appendU16(localAndData, 20); // version needed to extract (2.0)
    appendU16(localAndData, 0); // general purpose flag
    appendU16(localAndData, 0); // method: STORE
    appendU16(localAndData, 0); // mod time
    appendU16(localAndData, 0); // mod date
    appendU32(localAndData, crc);
    appendU32(localAndData, size);
    appendU32(localAndData, size);
    appendU16(localAndData, nameBytes.length);
    appendU16(localAndData, 0); // extra length
    pushBytes(localAndData, nameBytes);
    pushBytes(localAndData, entry.data);

    const localOffset = offset;
    offset += 30 + nameBytes.length + size;

    // Central directory header
    appendU32(central, 0x02014b50);
    appendU16(central, 20); // version made by
    appendU16(central, 20); // version needed
    appendU16(central, 0); // flag
    appendU16(central, 0); // method
    appendU16(central, 0); // mod time
    appendU16(central, 0); // mod date
    appendU32(central, crc);
    appendU32(central, size);
    appendU32(central, size);
    appendU16(central, nameBytes.length);
    appendU16(central, 0); // extra len
    appendU16(central, 0); // comment len
    appendU16(central, 0); // disk
    appendU16(central, 0); // internal attrs
    appendU32(central, 0); // external attrs
    appendU32(central, localOffset);
    pushBytes(central, nameBytes);
  }

  const local = new Uint8Array(localAndData);
  const centralBytes = new Uint8Array(central);
  const centralOffset = offset;

  // End of central directory record
  const eocd: number[] = [];
  appendU32(eocd, 0x06054b50);
  appendU16(eocd, 0);
  appendU16(eocd, 0);
  appendU16(eocd, entries.length);
  appendU16(eocd, entries.length);
  appendU32(eocd, centralBytes.length);
  appendU32(eocd, centralOffset);
  appendU16(eocd, 0);

  const out = new Uint8Array(local.length + centralBytes.length + eocd.length);
  out.set(local, 0);
  out.set(centralBytes, local.length);
  out.set(new Uint8Array(eocd), local.length + centralBytes.length);
  return out;
}

/* ---------------------------------- worksheet XML ---------------------------------- */

function colLetter(idx: number): string {
  // 1-based column index -> "A", "B", ... "Z", "AA", ...
  let s = "";
  let n = idx;
  while (n > 0) {
    n--;
    s = String.fromCharCode(65 + (n % 26)) + s;
    n = Math.floor(n / 26);
  }
  return s;
}

function escXml(v: string): string {
  return v
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function cellXml(ref: string, value: unknown): string {
  if (typeof value === "number" && Number.isFinite(value)) {
    return `<c r="${ref}"><v>${value}</v></c>`;
  }
  const s = value == null ? "" : String(value);
  return `<c r="${ref}" t="inlineStr"><is><t xml:space="preserve">${escXml(s)}</t></is></c>`;
}

function buildSheetXml(data: XlsxRow[]): string {
  // Headers in first-seen order across all rows
  const headers: string[] = [];
  const seen = new Set<string>();
  for (const row of data) {
    for (const k of Object.keys(row)) {
      if (!seen.has(k)) {
        seen.add(k);
        headers.push(k);
      }
    }
  }

  const parts: string[] = [
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
    '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>',
  ];

  const headerCells = headers
    .map((h, i) => cellXml(`${colLetter(i + 1)}1`, h))
    .join("");
  parts.push(`<row r="1">${headerCells}</row>`);

  data.forEach((row, ri) => {
    const r = ri + 2;
    const cells = headers
      .map((h, i) => cellXml(`${colLetter(i + 1)}${r}`, row[h]))
      .join("");
    parts.push(`<row r="${r}">${cells}</row>`);
  });

  parts.push("</sheetData></worksheet>");
  return parts.join("");
}

/* ---------------------------------- workbook assembly ---------------------------------- */

/**
 * Pure builder: convert an array of objects into a valid .xlsx byte array.
 * Exposed so it can be validated in any runtime (and unit-tested).
 */
export function buildXlsxBytes(data: XlsxRow[]): Uint8Array {
  const contentTypes =
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">' +
    '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>' +
    '<Default Extension="xml" ContentType="application/xml"/>' +
    '<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>' +
    '<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>' +
    "</Types>";

  const rels =
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
    '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>' +
    "</Relationships>";

  const workbook =
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">' +
    '<sheets><sheet name="Data" sheetId="1" r:id="rId1"/></sheets>' +
    "</workbook>";

  const workbookRels =
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
    '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>' +
    "</Relationships>";

  const files: Array<{ name: string; data: Uint8Array }> = [
    { name: "[Content_Types].xml", data: strBytes(contentTypes) },
    { name: "_rels/.rels", data: strBytes(rels) },
    { name: "xl/workbook.xml", data: strBytes(workbook) },
    { name: "xl/_rels/workbook.xml.rels", data: strBytes(workbookRels) },
    { name: "xl/worksheets/sheet1.xml", data: strBytes(buildSheetXml(data)) },
  ];

  return zipStore(files);
}

/**
 * Export an array of plain objects to a real `.xlsx` workbook and trigger a
 * browser download. Returns the generated file name, or null if empty.
 */
export function exportTableToExcel(data: XlsxRow[], fileName: string): string | null {
  if (!data || data.length === 0) return null;

  const bytes = buildXlsxBytes(data);
  const blob = new Blob([bytes as unknown as BlobPart], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const safeName = /\.xlsx$/i.test(fileName) ? fileName : `${fileName}.xlsx`;

  const a = document.createElement("a");
  a.href = url;
  a.download = safeName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 10000);

  return safeName;
}