// Known Egyptian tourist locations with coordinates [lon, lat]
export const EGYPT_LOCATIONS: Record<string, [number, number]> = {
  'pyramids of giza': [31.1342, 29.9792],
  'pyramids': [31.1342, 29.9792],
  'giza': [31.1342, 29.9792],
  'great sphinx': [31.1372, 29.9753],
  'sphinx': [31.1372, 29.9753],
  'egyptian museum': [31.2327, 30.0477],
  'khan el-khalili': [31.2310, 30.0477],
  'khan el khalili': [31.2310, 30.0477],
  'old cairo': [31.2310, 30.0000],
  'coptic cairo': [31.2310, 29.9900],
  'islamic cairo': [31.2310, 30.0500],
  'citadel': [31.2611, 30.0294],
  'saladin citadel': [31.2611, 30.0294],
  'cairo': [31.2357, 30.0444],
  'saqqara': [31.2165, 29.8713],
  'memphis': [31.2536, 29.8499],
  'dahshur': [31.2165, 29.7900],
  'luxor': [32.6421, 25.6872],
  'karnak': [32.6573, 25.7188],
  'karnak temple': [32.6573, 25.7188],
  'luxor temple': [32.6400, 25.6995],
  'valley of the kings': [32.6573, 25.7400],
  'valley of the queens': [32.6573, 25.7280],
  'hatshepsut temple': [32.6573, 25.7380],
  'colossi of memnon': [32.6573, 25.7200],
  'aswan': [32.8998, 24.0889],
  'abu simbel': [33.8366, 22.3450],
  'philae': [32.6573, 24.0250],
  'philae temple': [32.6573, 24.0250],
  'high dam': [32.8998, 23.9700],
  'unfinished obelisk': [32.8998, 24.0200],
  'alexandria': [31.2001, 29.9187],
  'bibliotheca alexandria': [31.2089, 29.9090],
  'library of alexandria': [31.2089, 29.9090],
  'qaitbay citadel': [31.2140, 29.8850],
  'pompey pillar': [31.2140, 29.8900],
  'montaza': [31.2140, 30.0100],
  'hurghada': [33.8129, 27.2579],
  'sharm el sheikh': [34.3306, 27.9158],
  'dahab': [34.5136, 28.5091],
  'mount sinai': [34.4667, 28.5500],
  'st catherine': [33.9783, 28.5500],
  'blue hole': [34.5136, 28.5800],
  'siwa': [32.6573, 25.5200],
  'siwa oasis': [32.6573, 25.5200],
  'bahariya': [32.6573, 28.3700],
  'white desert': [32.6573, 27.0000],
  'fayoum': [31.2357, 29.3000],
  'suez': [32.5498, 29.9668],
  'ismailia': [32.2715, 30.6000],
  'port said': [32.3078, 31.2625],
  'marsa alam': [33.8129, 25.0700],
  'edfu': [32.6573, 24.9800],
  'kom ombo': [32.6573, 24.4500],
  'esna': [32.6573, 25.2900],
  'nile': [31.2357, 30.0444],
  'nile river': [31.2357, 30.0444],
  'bazaar': [31.2310, 30.0477],
  'zamalek': [31.2357, 30.0600],
  'maadi': [31.2357, 29.9600],
  'heliopolis': [31.2357, 30.0900],
  'ras mohammed': [34.3306, 27.7100],
  'nuweiba': [34.6681, 29.0200],
  'taba': [34.8882, 29.5300],
  'dakhla': [32.6573, 25.5000],
  'kharga': [32.6573, 25.4500],
  'minya': [31.2357, 28.0833],
  'asyut': [31.2357, 27.1833],
  'sohag': [31.2357, 26.5500],
  'qena': [31.2357, 26.1667],
  'mansoura': [31.2357, 31.0409],
  'damietta': [31.2357, 31.4165],
  'zagazig': [31.2357, 30.5877],
  'tanta': [31.2357, 30.7865],
  'safaga': [33.8129, 26.7300],
  'el quseir': [33.8129, 26.1000],
};

// Extract known Egyptian locations from itinerary text
function extractLocationsFromText(text: string): string[] {
  if (!text) return [];
  const lower = text.toLowerCase();
  const found: string[] = [];
  
  // Sort by length (longest first) to match "pyramids of giza" before "giza"
  const sortedKeys = Object.keys(EGYPT_LOCATIONS).sort((a, b) => b.length - a.length);
  
  for (const loc of sortedKeys) {
    if (lower.includes(loc)) {
      found.push(loc);
    }
  }
  return found;
}

export async function generateDynamicMap(itineraryDays: any[]): Promise<string> {
  const apiKey = process.env.NEXT_PUBLIC_MAPTILER_API_KEY || 'cYbsTvD4eueAzUHeHwco';
  const coords: [number, number][] = [];
  const usedCoords = new Set<string>(); // Avoid duplicate coordinates

  // Extract locations from all itinerary days (title + description)
  if (itineraryDays && Array.isArray(itineraryDays)) {
    for (const day of itineraryDays) {
      const dayText = `${day.title || ''} ${day.description || ''}`;
      const locations = extractLocationsFromText(dayText);
      
      for (const loc of locations) {
        const coord = EGYPT_LOCATIONS[loc];
        const coordKey = `${coord[0]},${coord[1]}`;
        if (!usedCoords.has(coordKey)) {
          usedCoords.add(coordKey);
          coords.push(coord);
        }
      }
    }
  }

  // Fallback if no locations found
  if (coords.length === 0) {
    coords.push([31.1342, 29.9792]); // Giza Pyramids
    coords.push([32.6421, 25.6872]); // Luxor
    coords.push([32.8998, 24.0889]); // Aswan
  }

  // Build coordinate strings for URL
  const coordPairs = coords.map(([lon, lat]) => `${lon},${lat}`).join('|');
  const path = `stroke:0x1E3A8A|width:3|shortest:false|${coordPairs}`;
  const markers = coordPairs;
  
  return `https://api.maptiler.com/maps/dataviz-light/static/auto/800x350@2x.png?path=${path}&markers=${markers}&key=${apiKey}`;
}