const fs = require('fs');
const f = 'd:/Kemerya-Itinerary-Generator/src/app/dashboard/page.tsx';
let content = fs.readFileSync(f, 'utf8');

// Find and replace the handleTranslate function
const oldFnStart = content.indexOf('  const handleTranslate = (languageCode: SupportedLanguageCode | null) => {');
const oldFnEnd = content.indexOf('};\n\n  const totalTravelers');

if (oldFnStart > -1 && oldFnEnd > -1) {
  const newFn = `  const handleTranslate = (languageCode: SupportedLanguageCode | null): void => {
    if (!languageCode) {
      setSelectedLanguage(null);
      setTranslatedData(null);
      setTranslationError(null);
      return;
    }
    if (!bookingConfig || !selectedTour) return;

    setSelectedLanguage(languageCode);
    setIsTranslating(true);
    setTranslationError(null);

    translateItineraryData(languageCode, selectedTour, bookingConfig, KEMERYA_COMPANY_INFO)
      .then((result) => {
        if (result.success && result.translatedData) {
          setTranslatedData(result.translatedData);
        } else {
          setTranslationError(result.error || "Translation failed");
          setTranslatedData(null);
        }
      })
      .catch((err) => {
        const message = err instanceof Error ? err.message : "Translation request failed";
        setTranslationError(message);
        setTranslatedData(null);
      })
      .finally(() => {
        setIsTranslating(false);
      });
  };

`;

  content = content.substring(0, oldFnStart) + newFn + content.substring(oldFnEnd + 2);
  fs.writeFileSync(f, content, 'utf8');
  console.log('handleTranslate replaced');
} else {
  console.log('Could not find handleTranslate function');
}
