export const SUPPORTED_LANGUAGES = [
  { code: "en", name: "English", nativeName: "English", rtl: false },
  { code: "ar", name: "Arabic", nativeName: "العربية", rtl: true },
  { code: "zh", name: "Chinese (Simplified)", nativeName: "简体中文", rtl: false },
  { code: "zh-TW", name: "Chinese (Traditional)", nativeName: "繁體中文", rtl: false },
  { code: "ja", name: "Japanese", nativeName: "日本語", rtl: false },
  { code: "ko", name: "Korean", nativeName: "한국어", rtl: false },
  { code: "ru", name: "Russian", nativeName: "Русский", rtl: false },
  { code: "es", name: "Spanish", nativeName: "Español", rtl: false },
  { code: "fr", name: "French", nativeName: "Français", rtl: false },
  { code: "de", name: "German", nativeName: "Deutsch", rtl: false },
  { code: "it", name: "Italian", nativeName: "Italiano", rtl: false },
  { code: "pt", name: "Portuguese", nativeName: "Português", rtl: false },
  { code: "nl", name: "Dutch", nativeName: "Nederlands", rtl: false },
  { code: "pl", name: "Polish", nativeName: "Polski", rtl: false },
  { code: "tr", name: "Turkish", nativeName: "Türkçe", rtl: false },
  { code: "vi", name: "Vietnamese", nativeName: "Tiếng Việt", rtl: false },
  { code: "th", name: "Thai", nativeName: "ไทย", rtl: false },
  { code: "he", name: "Hebrew", nativeName: "עברית", rtl: true },
] as const;

export type SupportedLanguageCode = (typeof SUPPORTED_LANGUAGES)[number]["code"];

export function getLanguageByCode(code: string): (typeof SUPPORTED_LANGUAGES)[number] | undefined {
  return SUPPORTED_LANGUAGES.find((lang) => lang.code === code);
}

export function isRTLByCode(code: string): boolean {
  const lang = getLanguageByCode(code);
  return lang?.rtl ?? false;
}

export function getLanguageName(code: string): string {
  return getLanguageByCode(code)?.name ?? code;
}

export function getLanguageNativeName(code: string): string {
  return getLanguageByCode(code)?.nativeName ?? code;
}