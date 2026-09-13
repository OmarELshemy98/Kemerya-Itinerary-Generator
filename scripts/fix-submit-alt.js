const fs = require('fs');
const f = 'd:/Kemerya-Itinerary-Generator/src/app/dashboard/page.tsx';
let content = fs.readFileSync(f, 'utf8');

const marker = 'setBookingCount((c) => c + 1);\n    if (mode === "view")';
const idx = content.indexOf(marker);

if (idx > -1) {
  const insertPoint = idx + 'setBookingCount((c) => c + 1);\n'.length;
  const toInsert = '    setSelectedLanguage(null);\n    setTranslatedData(null);\n    setTranslationError(null);\n';
  content = content.slice(0, insertPoint) + toInsert + content.slice(insertPoint);
  fs.writeFileSync(f, content, 'utf8');
  console.log('SUCCESS: Fixed handleBookingSubmit');
} else {
  console.log('Pattern not found');
}