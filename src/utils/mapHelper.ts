interface LocationCoords {
  lat: number;
  lon: number;
}

export const generateLuxuryMapUrl = (locations: LocationCoords[]): string | undefined => {
  if (!locations || locations.length === 0) return undefined;

  const apiKey = process.env.NEXT_PUBLIC_MAPTILER_API_KEY;
  if (!apiKey) return undefined;

  const coordPairs = locations.map(loc => `${loc.lon},${loc.lat}`).join('|');
  const path = `stroke:0x1E3A8A|width:3|shortest:false|${coordPairs}`;
  const markers = coordPairs;

  return `https://api.maptiler.com/maps/dataviz-light/static/auto/800x350@2x.png?path=${path}&markers=${markers}&key=${apiKey}`;
};