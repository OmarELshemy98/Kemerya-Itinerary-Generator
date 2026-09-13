const fs = require('fs');
const f = 'd:/Kemerya-Itinerary-Generator/src/app/dashboard/page.tsx';
let content = fs.readFileSync(f, 'utf8');

// 1. Add translation state after pendingItinerary
content = content.replace(
  'const [pendingItinerary, setPendingItinerary] = React.useState<any>(null);',
  `const [pendingItinerary, setPendingItinerary] = React.useState<any>(null);
  const [selectedLanguage, setSelectedLanguage] = React.useState<SupportedLanguageCode | null>(null);
  const [translatedData, setTranslatedData] = React.useState<Record<string, unknown> | null>(null);
  const [isTranslating, setIsTranslating] = React.useState(false);
  const [translationError, setTranslationError] = React.useState<string | null>(null);`
);

// 2. Add handleTranslate function after handleClearSelection
const handleTranslateFn = `
  const handleTranslate = (languageCode: SupportedLanguageCode | null): void => {
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

content = content.replace(
  'const handleClearSelection = () => {\n    setSelectedTour(null);\n    setBookingConfig(null);\n  };',
  `const handleClearSelection = () => {
    setSelectedTour(null);
    setBookingConfig(null);
    setSelectedLanguage(null);
    setTranslatedData(null);
    setTranslationError(null);
  };
${handleTranslateFn}`
);

// 3. Add language selector section before Preview & Download
const languageSection = `      {/* Language Selection - BEFORE PDF preview */}
      {bookingConfig && (
        <section className="mb-8">
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#C9A962]/15 text-[#C9A962]"><Globe className="h-4 w-4" /></div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">Translate PDF</p>
                  <p className="mt-0.5 text-xs text-slate-500">Select a language to translate the itinerary</p>
                </div>
              </div>
              {selectedLanguage && (
                <Badge variant="gold" className="self-start">
                  {selectedLanguage} — {translatedData ? "Translated" : isTranslating ? "Translating..." : "Ready"}
                </Badge>
              )}
            </div>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <LanguageSelector value={selectedLanguage} onChange={handleTranslate} disabled={!bookingConfig || isTranslating} showLabel={false} />
              {isTranslating && (
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <svg className="h-4 w-4 animate-spin text-[#C9A962]" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                  Translating...
                </div>
              )}
              {selectedLanguage && !isTranslating && !translationError && (
                <Button variant="outline" size="sm" onClick={() => { setSelectedLanguage(null); setTranslatedData(null); setTranslationError(null); }}>Clear</Button>
              )}
            </div>
            {translationError && (
              <div className="mt-3 flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                <svg className="h-4 w-4 shrink-0 text-red-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                {translationError}
              </div>
            )}
          </div>
        </section>
      )}

`;

content = content.replace(
  '      {bookingConfig && bookingConfig.totalPrice > 0 && (',
  languageSection + '      {bookingConfig && bookingConfig.totalPrice > 0 && ('
);

// 4. Remove duplicate language section inside Preview section
const separatorLine = '<Separator className="my-3 bg-emerald-100" />';
const pdfPreviewLine = '      <PDFPreviewDialog';
if (content.includes(separatorLine) && content.includes(pdfPreviewLine)) {
  const sepIdx = content.indexOf(separatorLine);
  const pdfIdx = content.indexOf(pdfPreviewLine);
  if (sepIdx > -1 && pdfIdx > -1 && pdfIdx > sepIdx) {
    content = content.substring(0, sepIdx) + content.substring(pdfIdx);
  }
}

fs.writeFileSync(f, content, 'utf8');
console.log('All changes applied');
