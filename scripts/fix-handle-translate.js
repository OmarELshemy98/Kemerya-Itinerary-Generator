const fs = require('fs');
const f = 'd:/Kemerya-Itinerary-Generator/src/app/dashboard/page.tsx';
let content = fs.readFileSync(f, 'utf8');

// Replace the handleTranslate function with a proper async version
const oldFn = `  const handleTranslate = (languageCode: SupportedLanguageCode | null) => {
    if (!languageCode || !bookingConfig || !selectedTour) {
      if (languageCode === null) { setSelectedLanguage(null); setTranslatedData(null); setTranslationError(null); }
      return;
    }
    setSelectedLanguage(languageCode);
    setIsTranslating(true);
    setTranslationError(null);
    (async () => {
      try {
        const result = await translateItineraryData(languageCode, selectedTour, bookingConfig, KEMERYA_COMPANY_INFO);
        if (result.success && result.translatedData) { setTranslatedData(result.translatedData); }
        else { setTranslationError(result.error || "Translation failed"); setTranslatedData(null); }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Translation request failed";
        setTranslationError(message);
        setTranslatedData(null);
      } finally { setIsTranslating(false); }
    })();
  };`;

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
  };`;

content = content.replace(oldFn, newFn);

fs.writeFileSync(f, content, 'utf8');
console.log('Fixed handleTranslate function');
