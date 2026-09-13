import { Font } from "@react-pdf/renderer";

// Font URLs for different scripts (using jsdelivr CDN)
const FONT_URLS = {
  arabic: {
    regular: "https://cdn.jsdelivr.net/npm/@fontsource/noto-sans-arabic@5.0.8/files/noto-sans-arabic-latin-400-normal.woff2",
    bold: "https://cdn.jsdelivr.net/npm/@fontsource/noto-sans-arabic@5.0.8/files/noto-sans-arabic-latin-700-normal.woff2",
  },
  chinese: {
    regular: "https://cdn.jsdelivr.net/npm/@fontsource/noto-sans-sc@5.0.8/files/noto-sans-sc-latin-400-normal.woff2",
    bold: "https://cdn.jsdelivr.net/npm/@fontsource/noto-sans-sc@5.0.8/files/noto-sans-sc-latin-700-normal.woff2",
  },
  japanese: {
    regular: "https://cdn.jsdelivr.net/npm/@fontsource/noto-sans-jp@5.0.8/files/noto-sans-jp-latin-400-normal.woff2",
    bold: "https://cdn.jsdelivr.net/npm/@fontsource/noto-sans-jp@5.0.8/files/noto-sans-jp-latin-700-normal.woff2",
  },
  korean: {
    regular: "https://cdn.jsdelivr.net/npm/@fontsource/noto-sans-kr@5.0.8/files/noto-sans-kr-latin-400-normal.woff2",
    bold: "https://cdn.jsdelivr.net/npm/@fontsource/noto-sans-kr@5.0.8/files/noto-sans-kr-latin-700-normal.woff2",
  },
};

// RTL language codes
const RTL_LANGUAGES = ["ar", "he", "fa", "ur", "ps", "ku", "ug"];

// Language to script mapping
const LANGUAGE_SCRIPT_MAP: Record<string, string> = {
  ar: "arabic", fa: "arabic", ps: "arabic", ku: "arabic", ug: "arabic",
  zh: "chinese", ja: "japanese", ko: "korean",
  ru: "cyrillic", be: "cyrillic", uk: "cyrillic", bg: "cyrillic",
  sr: "cyrillic", mk: "cyrillic", mn: "cyrillic", kk: "cyrillic", uz: "cyrillic",
  el: "greek",
  en: "latin", es: "latin", fr: "latin", it: "latin", de: "latin",
  pt: "latin", nl: "latin", pl: "latin", cs: "latin", sk: "latin",
  hu: "latin", ro: "latin", hr: "latin", sl: "latin",
  da: "latin", sv: "latin", fi: "latin", no: "latin", nb: "latin",
  tr: "latin", vi: "latin", th: "thai", he: "hebrew", lo: "lao",
};

// Map of script families to font families
const SCRIPT_FONT_FAMILY: Record<string, string> = {
  arabic: "Noto Sans Arabic",
  chinese: "Noto Sans SC",
  japanese: "Noto Sans JP",
  korean: "Noto Sans KR",
  cyrillic: "Roboto",
  greek: "Roboto",
  latin: "Lora",
};

function getScriptFamily(languageCode: string): string {
  const normalizedCode = languageCode.toLowerCase();
  const baseCode = normalizedCode.split("_")[0].toLowerCase();
  return LANGUAGE_SCRIPT_MAP[baseCode] || "latin";
}

/**
 * Registers the appropriate font for a given language code
 * @param languageCode - ISO language code (e.g., 'ar', 'zh', 'en')
 */
export async function registerFontForLanguage(languageCode: string): Promise<void> {
  const scriptFamily = getScriptFamily(languageCode);

  if (scriptFamily === "arabic") {
    const urls = FONT_URLS.arabic;
    await Font.register({
      family: "Noto Sans Arabic",
      fonts: [
        { src: urls.regular, fontWeight: 400 },
        { src: urls.bold, fontWeight: 700 },
      ],
    });
  } else if (scriptFamily === "chinese") {
    const urls = FONT_URLS.chinese;
    await Font.register({
      family: "Noto Sans SC",
      fonts: [
        { src: urls.regular, fontWeight: 400 },
        { src: urls.bold, fontWeight: 700 },
      ],
    });
  } else if (scriptFamily === "japanese") {
    const urls = FONT_URLS.japanese;
    await Font.register({
      family: "Noto Sans JP",
      fonts: [
        { src: urls.regular, fontWeight: 400 },
        { src: urls.bold, fontWeight: 700 },
      ],
    });
  } else if (scriptFamily === "korean") {
    const urls = FONT_URLS.korean;
    await Font.register({
      family: "Noto Sans KR",
      fonts: [
        { src: urls.regular, fontWeight: 400 },
        { src: urls.bold, fontWeight: 700 },
      ],
    });
  }
}

/**
 * Determines if a language is written right-to-left (RTL)
 */
export function isRTL(languageCode: string): boolean {
  const normalizedCode = languageCode.toLowerCase();
  const baseCode = normalizedCode.split("_")[0].toLowerCase();
  return RTL_LANGUAGES.includes(baseCode);
}

/**
 * Gets the appropriate font family for a given language
 */
export function getFontFamily(languageCode: string): string {
  const scriptFamily = getScriptFamily(languageCode);
  return SCRIPT_FONT_FAMILY[scriptFamily] || "Roboto";
}

/**
 * Checks if a specific font is available for a language
 */
export function hasSpecialFont(languageCode: string): boolean {
  const scriptFamily = getScriptFamily(languageCode);
  return scriptFamily !== "latin" && scriptFamily !== "cyrillic" && scriptFamily !== "greek";
}