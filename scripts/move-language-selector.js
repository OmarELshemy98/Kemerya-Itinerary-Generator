const fs = require('fs');
const f = 'd:/Kemerya-Itinerary-Generator/src/app/dashboard/page.tsx';
let c = fs.readFileSync(f, 'utf8');

const languageSection = `      {/* Language Selection - appears before PDF preview */}
      {bookingConfig && (
        <section className="mb-8">
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl bg-[#C9A962]/15 text-[#C9A962]"><Globe className="h-4 w-4" /></div>
                <div><p className="text-sm font-semibold text-slate-900">Translate PDF</p><p className="mt-0.5 text-xs text-slate-500">Select a language to translate the itinerary</p></div>
              </div>
              {selectedLanguage && (<Badge variant="gold" className="self-start">{selectedLanguage} — {translatedData ? "Translated" : isTranslating ? "Translating..." : "Ready"}</Badge>)}
            </div>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <LanguageSelector value={selectedLanguage} onChange={handleTranslate} disabled={!bookingConfig || isTranslating} showLabel={false} />
              {isTranslating && (<div className="flex items-center gap-2 text-sm text-slate-600"><svg className="h-4 w-4 animate-spin text-[#C9A962]" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Translating...</div>)}
              {selectedLanguage && !isTranslating && !translationError && (<Button variant="outline" size="sm" onClick={() => { setSelectedLanguage(null); setTranslatedData(null); setTranslationError(null); }}>Clear</Button>)}
            </div>
            {translationError && (<div className="mt-3 flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"><svg className="h-4 w-4 shrink-0 text-red-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>{translationError}</div>)}
          </div>
        </section>
      )}

`;

// Insert before the Preview & Download section
c = c.replace('      {bookingConfig && bookingConfig.totalPrice > 0 && (', languageSection + '      {bookingConfig && bookingConfig.totalPrice > 0 && (');

fs.writeFileSync(f, c, 'utf8');
console.log('Language selector added before preview section');
