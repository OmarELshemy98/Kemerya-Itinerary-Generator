const fs = require('fs');
const path = 'd:/Kemerya-Itinerary-Generator/src/app/dashboard/page.tsx';
const content = fs.readFileSync(path, 'utf8');
const oldText = 'if (mode === "view") { setShowPDF(true); } else { setPendingDownload(config); }';
const newText = 'setSelectedLanguage(null);\n    setTranslatedData(null);\n    setTranslationError(null);\n    if (mode === "view") { setShowPDF(true); } else { setPendingDownload(config); }';

if (!content.includes(oldText)) {
  console.log('Pattern not found');
  process.exit(1);
}

const updated = content.replace(oldText, newText);
const tmpPath = path + '.new';
fs.writeFileSync(tmpPath, updated, 'utf8');
console.log('Temp file created. Old size:', content.length, 'New size:', updated.length);
