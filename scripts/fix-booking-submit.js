const fs = require('fs');
const f = 'd:/Kemerya-Itinerary-Generator/src/app/dashboard/page.tsx';
let content = fs.readFileSync(f, 'utf8');

// Add translation state clearing to handleBookingSubmit
const oldCode = `    setBookingCount((c) => c + 1);
    if (mode === "view") { setShowPDF(true); } else { setPendingDownload(config); }`;

const newCode = `    setBookingCount((c) => c + 1);
    setSelectedLanguage(null);
    setTranslatedData(null);
    setTranslationError(null);
    if (mode === "view") { setShowPDF(true); } else { setPendingDownload(config); }`;

if (content.includes(oldCode)) {
  content = content.replace(oldCode, newCode);
  fs.writeFileSync(f, content, 'utf8');
  console.log('Fixed handleBookingSubmit - added translation state clearing');
} else {
  // Try with different whitespace
  const oldCode2 = 'setBookingCount((c) => c + 1);\n    if (mode === "view") { setShowPDF(true); } else { setPendingDownload(config); }';
  const newCode2 = 'setBookingCount((c) => c + 1);\n    setSelectedLanguage(null);\n    setTranslatedData(null);\n    setTranslationError(null);\n    if (mode === "view") { setShowPDF(true); } else { setPendingDownload(config); }';
  if (content.includes(oldCode2)) {
    content = content.replace(oldCode2, newCode2);
    fs.writeFileSync(f, content, 'utf8');
    console.log('Fixed handleBookingSubmit (variant 2)');
  } else {
    console.log('Could not find handleBookingSubmit pattern. Trying to locate...');
    const idx = content.indexOf('setBookingCount');
    console.log('setBookingCount found at index:', idx);
    if (idx > -1) {
      console.log('Context:', JSON.stringify(content.substring(idx-50, idx+200)));
    }
  }
}