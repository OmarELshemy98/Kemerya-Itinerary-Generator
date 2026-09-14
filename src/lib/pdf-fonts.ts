import { Font } from "@react-pdf/renderer";

/**
 * PDF font registration for multi-language itineraries.
 *
 * All fonts are served LOCALLY from /public/fonts (no external CDN) so PDF
 * generation always works, even offline / behind firewalls.
 *
 * IMPORTANT: Only register fonts whose files actually contain the glyphs of
 * the target script (the old CDN URLs pointed at the *latin* subset of Noto
 * Sans Arabic, which is why Arabic rendered as gibberish).
 */

// Resolve font path: in the browser use /public path, in Node.js use absolute path
const fontPath = (filename: string) => {
  if (typeof window !== "undefined") {
    return `/fonts/${filename}`;
  }
  // Node.js environment — resolve relative to project public folder
  return `${process.cwd()}/public/fonts/${filename}`;
};

// Arabic + Latin (static Noto Naskh Arabic TTF — full Arabic & Latin glyph
// coverage; variable TTFs are not supported by @react-pdf's fontkit build)
Font.register({
  family: "Cairo",
  fonts: [
    { src: fontPath("notonaskharabic-400.ttf"), fontWeight: 400 },
    { src: fontPath("notonaskharabic-700.ttf"), fontWeight: 700 },
  ],
});

// Hebrew (regular + bold)
Font.register({
  family: "NotoSansHebrew",
  fonts: [
    { src: fontPath("notosanshebrew-400.ttf"), fontWeight: 400 },
    { src: fontPath("notosanshebrew-700.ttf"), fontWeight: 700 },
  ],
});

// Chinese Simplified + Japanese (static CFF OTFs, full CJK coverage)
Font.register({
  family: "NotoSansSC",
  fonts: [
    { src: fontPath("notosanssc-400.otf"), fontWeight: 400 },
    { src: fontPath("notosanssc-700.otf"), fontWeight: 700 },
  ],
});
Font.register({
  family: "NotoSansJP",
  fonts: [
    { src: fontPath("notosansjp-400.otf"), fontWeight: 400 },
    { src: fontPath("notosansjp-700.otf"), fontWeight: 700 },
  ],
});

// Latin faces (default + decorative display) — registered here so every
// language path has a complete font set available.
Font.register({
  family: "Lora",
  fonts: [
    { src: fontPath("lora-latin-400-normal.woff") },
    { src: fontPath("lora-latin-400-italic.woff"), fontStyle: "italic" },
    { src: fontPath("lora-latin-700-normal.woff"), fontWeight: 700 },
  ],
});
Font.register({
  family: "Cinzel",
  fonts: [
    { src: fontPath("cinzel-latin-400-normal.woff"), fontWeight: 400 },
    { src: fontPath("cinzel-latin-700-normal.woff"), fontWeight: 700 },
  ],
});
// Decorative display face — headings, tour titles & day numbers only.
Font.register({
  family: "Cinzel Decorative",
  fonts: [{ src: fontPath("cinzel-decorative-latin-400-normal.woff"), fontWeight: 400 }],
});

/**
 * The single global font used for ALL body text in the PDF, chosen by
 * language code. Must match the family names registered above exactly.
 *  - ar        → Cairo   (Arabic)
 *  - he        → NotoSansHebrew (Cairo has no Hebrew glyphs)
 *  - zh / ja   → NotoSansSC / NotoSansJP (CJK)
 *  - everything else (Latin, Cyrillic, Greek, Thai…) → Lora
 */
export function getGlobalFont(code: string): string {
  const base = (code || "en").toLowerCase().split("-")[0];
  if (base === "ar") return "Cairo";
  if (base === "he") return "NotoSansHebrew";
  if (base === "zh") return "NotoSansSC";
  if (base === "ja") return "NotoSansJP";
  return "Lora";
}

/**
 * Languages whose scripts the Latin display faces (Cinzel / Cinzel Decorative)
 * can render. For every other language the global font is used for headings.
 */
export function isLatinDisplayLanguage(code: string): boolean {
  const base = (code || "en").toLowerCase().split("-")[0];
  return !["ar", "he", "zh", "ja", "ko", "ru", "th"].includes(base);
}

// RTL language codes
const RTL_LANGUAGES = ["ar", "he", "fa", "ur", "ps", "ku", "ug"];

/**
 * Determines if a language is written right-to-left (RTL)
 */
export function isRTL(languageCode: string): boolean {
  const base = (languageCode || "en").toLowerCase().split("-")[0];
  return RTL_LANGUAGES.includes(base);
}

/**
 * Gets the appropriate font family for a given language
 */
export function getFontFamily(languageCode: string): string {
  return getGlobalFont(languageCode);
}