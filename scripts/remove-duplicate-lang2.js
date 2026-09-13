const fs = require('fs');
const f = 'd:/Kemerya-Itinerary-Generator/src/app/dashboard/page.tsx';
let lines = fs.readFileSync(f, 'utf8').split('\n');

// Find and remove the duplicate language section (lines ~210-228)
// It's the second occurrence of "Translate to Language" inside the Preview section
let newLines = [];
let inDuplicate = false;
let duplicateStart = -1;
let braceCount = 0;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  
  // Detect start of duplicate section (second occurrence of Separator before PDF)
  if (line.includes('Separator className="my-3 bg-emerald-100"') && duplicateStart === -1) {
    duplicateStart = i;
    inDuplicate = true;
    continue;
  }
  
  if (inDuplicate) {
    // Count braces to find end of section
    const opens = (line.match(/\{/g) || []).length;
    const closes = (line.match(/\}/g) || []).length;
    braceCount += opens - closes;
    
    // When we hit the closing </section> tag for this block
    if (line.includes('</section>') && braceCount <= 0) {
      inDuplicate = false;
      continue;
    }
    continue;
  }
  
  newLines.push(line);
}

fs.writeFileSync(f, newLines.join('\n'), 'utf8');
console.log('Removed duplicate language section. Lines:', newLines.length);
