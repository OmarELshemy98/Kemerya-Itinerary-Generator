$ErrorActionPreference = 'Stop'

function File-Replace($path, $old, $new) {
    $content = [System.IO.File]::ReadAllText($path)
    $i = $content.IndexOf($old, [System.StringComparison]::Ordinal)
    if ($i -lt 0) {
        Write-Error "NOT FOUND: $($old.Substring(0, [Math]::Min(60, $old.Length))"
        exit 1
    }
    $content = $content.Substring(0, $i) + $new + $content.Substring($i + $old.Length)
    [System.IO.File]::WriteAllText($path, $content)
}

$p = "d:\Kemerya-Itinerary-Generator\src\components\pdf\itinerary-pdf.tsx"

# 1. Remove EGYPT_LOCATIONS import
File-Replace $p "import { EGYPT_LOCATIONS } from `"@/utils/mapGenerator`";`n" ""

# 2. Remove extractDayLocations function (full block)
$oldExtract = @'
  // Helper to extract location names from day text using mapGenerator's location DB
  const extractDayLocations = (day: ItineraryDay): string[] => {
    const dayText = `${day.title || ''} ${day.description || ''}`;
    const lower = dayText.toLowerCase();
    const found: string[] = [];
    
    // Sort by length (longest first) to match "pyramids of giza" before "giza"
    const sortedKeys = Object.keys(EGYPT_LOCATIONS).sort((a, b) => b.length - a.length);
    
    for (const loc of sortedKeys) {
      if (lower.includes(loc)) {
        // Use title case for display
        const displayName = loc.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        if (!found.includes(displayName)) {
          found.push(displayName);
        }
      }
    }
    return found;
  };
"@

File-Replace $p $oldExtract ""

# 3. Remove hasCustomStops + dayRoutesByDay + routeStops + allLocations block
$oldLogic = @'
  // Build route stops - customRouteStops win, else per-day editable roadmaps, else auto-extract
  const hasCustomStops = booking.customRouteStops && booking.customRouteStops.length > 0;
  const dayRoutesByDay = React.useMemo(() => {
    const map = new Map<number, string[]>();
    (booking.dayRoutes || []).forEach((r) => {
      const stops = (r.stops || []).map((s) => String(s).trim()).filter(Boolean);
      if (stops.length > 0) map.set(r.day, stops);
    });
    return map;
  }, [booking.dayRoutes]);

  const routeStops = hasCustomStops
    ? (booking.customRouteStops || []).sort((a, b) => a.order - b.order).map((stop, i) => ({
        day: i + 1,
        label: stop.name || `Stop ${i + 1}`,
        locations: stop.name ? [stop.name] : [`Stop ${i + 1}`],
      }))
    : (itinerary || []).map((day, i) => {
        const key = day.day || i + 1;
        const editable = dayRoutesByDay.get(key);
        const auto = extractDayLocations(day);
        const dayLabel = day.title && day.title.trim()
          ? day.title.trim()
          : `Day ${i + 1}`;
        const locations = editable && editable.length > 0
          ? editable
          : auto.length > 0 ? auto : [dayLabel];
        return { day: key, label: dayLabel, locations };
      });

  // Collect all unique locations for the roadmap
  const allLocations = hasCustomStops
    ? (booking.customRouteStops || []).sort((a, b) => a.order - b.order).map(s => s.name).filter(Boolean)
    : Array.from(
        new Set(
          routeStops.flatMap(stop => stop.locations)
        )
      );

  return (
"@

File-Replace $p $oldLogic @"
  return (
"@

# 4. Remove Journey Route timeline JSX block + Destinations Overview
$oldJsx = @'
        {/* JOURNEY ROUTE TIMELINE */}
        {routeStops.length > 0 && (
          <View style={styles.routeWrapper}>
            <View style={styles.routeHeader}>
              <Text style={styles.routeTitle}>JOURNEY ROUTE</Text>
            </View>
            <View style={styles.routeContainer}>
              <RouteTimeline stops={routeStops} />
            </View>
          </View>
        )}

        {/* DESTINATIONS OVERVIEW - All places to visit */}
        {allLocations.length > 0 && (
          <View style={styles.destinationsWrapper}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionNumber}><Text>02</Text></View>
              <Text style={styles.sectionTitle}>Destinations Overview</Text>
              <View style={styles.sectionUnderline} />
            </View>
            <Text style={styles.destinationsSubtitle}>
              Explore the magnificent locations included in your journey
            </Text>
            <View style={styles.destinationsGrid}>
              {allLocations.map((location, i) => (
                <View key={i} style={styles.destinationCard}>
                  <View style={styles.destinationIcon}>
                    <Text style={styles.destinationIconText}>◆</Text>
                  </View>
                  <Text style={styles.destinationName}>{location}</Text>
                </View>
              ))}
            </View>
          </View>
        )}