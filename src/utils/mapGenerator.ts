export async function generateDynamicMap(itineraryDays: any[]): Promise<string> {
  const apiKey = process.env.NEXT_PUBLIC_MAPTILER_API_KEY || 'cYbsTvD4eueAzUHeHwco';
  const coords: string[] = [];

  // Try extracting locations if itineraryDays is provided
  if (itineraryDays && Array.isArray(itineraryDays)) {
    const locations = new Set<string>();
    itineraryDays.forEach(day => {
      if (day.description) {
        const matches = day.description.match(/([A-Za-z0-9\s]+):/g);
        if (matches) {
          matches.forEach((m: string) => locations.add(m.replace(':', '').trim()));
        }
      }
    });
    
    const locationNames = Array.from(locations).slice(0, 6);
    for (const loc of locationNames) {
      try {
        const res = await fetch(`https://api.maptiler.com/geocoding/${encodeURIComponent(loc + ' Egypt')}.json?key=${apiKey}`);
        const data = await res.json();
        if (data.features && data.features.length > 0) {
          const [lon, lat] = data.features[0].center;
          coords.push(`${lon},${lat}`);
        }
      } catch (e) {
        // Ignore individual fetch errors
      }
    }
  }

  // Fallback coordinates if extraction/geocoding found nothing (e.g., Luxor to Aswan route)
  if (coords.length === 0) {
    coords.push('32.6421,25.6872'); // Luxor
    coords.push('32.8998,24.0889'); // Aswan
  }

  const path = `stroke:0x1E3A8A|width:3|shortest:false|${coords.join('|')}`;
  const markers = coords.join('|');
  
  return `https://api.maptiler.com/maps/dataviz-light/static/auto/800x350@2x.png?path=${path}&markers=${markers}&key=${apiKey}`;
}