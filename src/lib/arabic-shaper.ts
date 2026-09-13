/**
 * Arabic text shaping for @react-pdf/renderer.
 *
 * WHY: @react-pdf's textkit performs bidi reordering (via bidi-js) but does
 * NOT apply OpenType shaping (no GSUB/GPOS feature application). Arabic
 * letters therefore render as disconnected ISOLATED forms — e.g. "جولة خاصة"
 * renders broken.
 *
 * FIX: pre-convert Arabic into Unicode "Arabic Presentation Forms"
 * (U+FE70–FEFF), baking the contextual initial/medial/final forms and the
 * lam-alef ligatures directly into the code points. textkit's bidi engine
 * classifies presentation forms as RTL (verified: embedding level 1) and
 * reorders them for display, while the pre-joined glyphs render connected.
 * Noto Naskh Arabic (the registered PDF face) covers 141/144 of these code
 * points in its cmap — verified with fontkit.
 *
 * The function is idempotent: text that already contains presentation forms
 * is returned unchanged.
 */

/**
 * Dual-joining letters: [isolated, final, initial, medial]
 * Letters that never connect to the FOLLOWING letter are in DOUBLE_FORMS
 * (right-joining only: isolated + final; no initial/medial forms).
 */
const QUADRUPLE_FORMS: Record<string, [string, string, string, string]> = {
  "\u0628": ["\uFE8F", "\uFE90", "\uFE91", "\uFE92"], // ب
  "\u062A": ["\uFE95", "\uFE96", "\uFE97", "\uFE98"], // ت
  "\u062B": ["\uFE99", "\uFE9A", "\uFE9B", "\uFE9C"], // ث
  "\u062C": ["\uFE9D", "\uFE9E", "\uFE9F", "\uFEA0"], // ج
  "\u062D": ["\uFEA1", "\uFEA2", "\uFEA3", "\uFEA4"], // ح
  "\u062E": ["\uFEA5", "\uFEA6", "\uFEA7", "\uFEA8"], // خ
  "\u0633": ["\uFEB1", "\uFEB2", "\uFEB3", "\uFEB4"], // س
  "\u0634": ["\uFEB5", "\uFEB6", "\uFEB7", "\uFEB8"], // ش
  "\u0635": ["\uFEB9", "\uFEBA", "\uFEBB", "\uFEBC"], // ص
  "\u0636": ["\uFEBD", "\uFEBE", "\uFEBF", "\uFEC0"], // ض
  "\u0637": ["\uFEC1", "\uFEC2", "\uFEC3", "\uFEC4"], // ط
  "\u0638": ["\uFEC5", "\uFEC6", "\uFEC7", "\uFEC8"], // ظ
  "\u0639": ["\uFEC9", "\uFECA", "\uFECB", "\uFECC"], // ع
  "\u063A": ["\uFECD", "\uFECE", "\uFECF", "\uFED0"], // غ
  "\u0641": ["\uFED1", "\uFED2", "\uFED3", "\uFED4"], // ف
  "\u0642": ["\uFED5", "\uFED6", "\uFED7", "\uFED8"], // ق
  "\u0643": ["\uFED9", "\uFEDA", "\uFEDB", "\uFEDC"], // ك
  "\u0644": ["\uFEDD", "\uFEDE", "\uFEDF", "\uFEE0"], // ل
  "\u0645": ["\uFEE1", "\uFEE2", "\uFEE3", "\uFEE4"], // م
  "\u0646": ["\uFEE5", "\uFEE6", "\uFEE7", "\uFEE8"], // ن
  "\u0647": ["\uFEE9", "\uFEEA", "\uFEEB", "\uFEEC"], // ه
  "\u064A": ["\uFEF1", "\uFEF2", "\uFEF3", "\uFEF4"], // ي
  // Persian/Urdu extensions
  "\u067E": ["\uFB56", "\uFB57", "\uFB58", "\uFB59"], // پ
  "\u0686": ["\uFB7A", "\uFB7B", "\uFB7C", "\uFB7D"], // چ
  "\u06A9": ["\uFB8E", "\uFB8F", "\uFB90", "\uFB91"], // ک
  "\u06AF": ["\uFB92", "\uFB93", "\uFB94", "\uFB95"], // گ
  "\u06CC": ["\uFBFC", "\uFBFD", "\uFBFE", "\uFBFF"], // ی
};

// Right-joining letters: [isolated, final]
const DOUBLE_FORMS: Record<string, [string, string]> = {
  "\u0621": ["\uFE80", "\uFE80"], // ء
  "\u0622": ["\uFE81", "\uFE82"], // آ
  "\u0623": ["\uFE83", "\uFE84"], // أ
  "\u0624": ["\uFE85", "\uFE86"], // ؤ
  "\u0625": ["\uFE87", "\uFE88"], // إ
  "\u0627": ["\uFE8D", "\uFE8E"], // ا
  "\u0629": ["\uFE93", "\uFE94"], // ة
  "\u062F": ["\uFEA9", "\uFEAA"], // د
  "\u0630": ["\uFEAB", "\uFEAC"], // ذ
  "\u0631": ["\uFEAD", "\uFEAE"], // ر
  "\u0632": ["\uFEAF", "\uFEB0"], // ز
  "\u0648": ["\uFEED", "\uFEEE"], // و
  "\u0649": ["\uFEEF", "\uFEF0"], // ى
  "\u0671": ["\uFB50", "\uFB51"], // ٱ
  // Persian extensions
  "\u0698": ["\uFB8A", "\uFB8B"], // ژ
};

// Lam-Alef ligatures: alef variant -> [isolated, final]
const LAM_ALEF: Record<string, [string, string]> = {
  "\u0622": ["\uFEF5", "\uFEF6"], // لآ
  "\u0623": ["\uFEF7", "\uFEF8"], // لأ
  "\u0625": ["\uFEF9", "\uFEFA"], // لإ
  "\u0627": ["\uFEFB", "\uFEFC"], // لا
};

const ARABIC_LETTER = /[\u0621-\u063A\u0641-\u064A\u0671\u067E\u0686\u0698\u06A9\u06AF\u06CC]/;
const ARABIC_RANGE = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;

export function containsArabic(text: string): boolean {
  return ARABIC_RANGE.test(text);
}

function isArabicLetter(ch: string | undefined): boolean {
  return ch !== undefined && ARABIC_LETTER.test(ch);
}

/** True when the letter joins to the PREVIOUS letter (connects backward). */
function joinsPrev(ch: string): boolean {
  return QUADRUPLE_FORMS[ch] !== undefined || DOUBLE_FORMS[ch] !== undefined;
}

/** True when the letter joins to the FOLLOWING letter (connects forward). */
function joinsNext(ch: string): boolean {
  return QUADRUPLE_FORMS[ch] !== undefined;
}

/**
 * Convert logical-order Arabic into Arabic Presentation Forms so that
 * @react-pdf renders connected (shaped) glyphs without OpenType shaping.
 */
export function shapeArabicText(text: string): string {
  if (!text || !ARABIC_RANGE.test(text)) return text;
  // Idempotency: presentation forms already present → already shaped.
  if (/[\uFE70-\uFEFF]/.test(text)) return text;

  const chars = Array.from(text);
  const out: string[] = [];

  for (let i = 0; i < chars.length; i += 1) {
    const ch = chars[i];

    // Lam-Alef ligature: ل + alef variant → single ligature code point.
    if (ch === "\u0644" && chars[i + 1] !== undefined && LAM_ALEF[chars[i + 1]]) {
      const prevJoins = i > 0 && isArabicLetter(chars[i - 1]) && joinsNext(chars[i - 1]);
      const [isoForm, finalForm] = LAM_ALEF[chars[i + 1]];
      out.push(prevJoins ? finalForm : isoForm);
      i += 1; // consume the alef
      continue;
    }

    if (isArabicLetter(ch)) {
      const prevJoins = i > 0 && isArabicLetter(chars[i - 1]) && joinsNext(chars[i - 1]);
      const nextJoins =
        joinsNext(ch) &&
        i + 1 < chars.length &&
        isArabicLetter(chars[i + 1]) &&
        joinsPrev(chars[i + 1]);

      const quad = QUADRUPLE_FORMS[ch];
      if (quad) {
        // [isolated, final, initial, medial]
        if (prevJoins && nextJoins) out.push(quad[3]);
        else if (prevJoins) out.push(quad[1]);
        else if (nextJoins) out.push(quad[2]);
        else out.push(quad[0]);
        continue;
      }

      const dbl = DOUBLE_FORMS[ch];
      if (dbl) {
        out.push(prevJoins ? dbl[1] : dbl[0]);
        continue;
      }
    }

    out.push(ch);
  }

  return out.join("");
}

/**
 * PDF-safe shaping entry point. Applies Arabic shaping only when the text
 * actually contains Arabic characters (no-op for Latin/CJK/… so call sites
 * can apply it unconditionally).
 */
export function shapeForPdf(text: string): string {
  if (!text) return text;
  return shapeArabicText(text);
}
