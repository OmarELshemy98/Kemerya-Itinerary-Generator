const fs = require('fs');
const f = 'd:/Kemerya-Itinerary-Generator/src/app/dashboard/page.tsx';
let c = fs.readFileSync(f, 'utf8');

// Fix SectionHeader type annotation
c = c.replace('function SectionHeader({ icon, step, title, subtitle }) {', 'function SectionHeader({ icon, step, title, subtitle }: { icon: React.ReactNode; step: string; title: string; subtitle?: string }) {');

// Fix SelectedTourBanner type annotation
c = c.replace('function SelectedTourBanner({ tour, onClear }) {', 'function SelectedTourBanner({ tour, onClear }: { tour: Tour; onClear: () => void }) {');

fs.writeFileSync(f, c, 'utf8');
console.log('Fixed SectionHeader and SelectedTourBanner types');
