export async function generateDynamicMap(itineraryDays: any[]): Promise<string | null> {
  const apiKey = process.env.NEXT_PUBLIC_MAPTILER_API_KEY || 'cYbsTvD4eueAzUHeHwco';
  const locations = new Set<string>();

  // 1. Extract location names
  itineraryDays.forEach(day => {
    if (day.activities && Array.isArray(day.activities)) {
      day.activities.forEach((act: any) => {
        if (act.title) locations.add(act.title);
      });
    } else if (day.description) {
      const matches = day.description.match(/([A-Za-z0-9\s]+):/g);
      if (matches) {
        matches.forEach((m: string) => locations.add(m.replace(':', '').trim()));
      }
    }
  });
  
  const locationNames = Array.from(locations).slice(0, 8);
  if (locationNames.length === 0) return null;

  // 2. Geocode using MapTiler
  const coords: [number, number][] = [];
  for (const loc of locationNames) {
    try {
      const res = await fetch(`https://api.maptiler.com/geocoding/${encodeURIComponent(loc + ' Egypt')}.json?key=${apiKey}`);
      const data = await res.json();
      if (data.features && data.features.length > 0) {
        const [lon, lat] = data.features[0].center;
        coords.push([lon, lat]);
      }
    } catch (e) {
      console.error("Geocoding failed for", loc);
    }
  }

  if (coords.length === 0) return null;

  // 3. Build Static Map URL with correct MapTiler format
  const coordPairs = coords.map(([lon, lat]) => `${lon},${lat}`).join('|');
  const path = `stroke:0x1E3A8A|width:3|shortest:false|${coordPairs}`;
  const markers = coordPairs;
  
  return `https://api.maptiler.com/maps/dataviz-light/static/auto/800x350@2x.png?path=${path}&markers=${markers}&key=${apiKey}`;
}