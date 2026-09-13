const fs = require('fs');
const f = 'd:/Kemerya-Itinerary-Generator/src/app/dashboard/page.tsx';
let content = fs.readFileSync(f, 'utf8');

// Find and remove the duplicate language section inside Preview section
// It starts with <Separator className="my-3 bg-emerald-100" and ends with </section> before the PDF components
const separatorIdx = content.indexOf('<Separator className="my-3 bg-emerald-100"');
if (separatorIdx > -1) {
  // Find the next </section> after the separator that's followed by PDF components
  const afterSeparator = content.substring(separatorIdx);
  const sectionEndMatch = afterSeparator.match(/<\/section>\n\s*<\/Separator>/);
  if (sectionEndMatch) {
    const removeEnd = separatorIdx + afterSeparator.indexOf(sectionEndMatch[0]) + sectionEndMatch[0].length;
    const removeStart = separatorIdx;
    content = content.substring(0, removeStart) + content.substring(removeEnd);
    console.log('Removed duplicate language section');
  } else {
    // Try another approach - remove from separator to the next PDF Dialog
    const pdfDialogIdx = content.indexOf('      <PDFPreviewDialog');
    if (pdfDialogIdx > -1) {
      // Find the line before PDFPreviewDialog
      const beforePdf = content.substring(0, pdfDialogIdx);
      const lastNewline = beforePdf.lastIndexOf('\n      </section>');
      if (lastNewline > separatorIdx) {
        content = content.substring(0, separatorIdx) + '\n\n' + content.substring(lastQuick + 18);
        console.log('Removed duplicate language section (alt method)');
      }
    }
  }
}

fs.writeFileSync(f, content, 'utf8');
console.log('Done');
