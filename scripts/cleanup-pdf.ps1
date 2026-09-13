# Cleans up all Journey Route references from itinerary-pdf.tsx
$ErrorActionPreference = "Stop"
Set-Location "d:/Kemerya-Itinerary-Generator"

$pdf = Get-Content "src/components/pdf/itinerary-pdf.tsx" -Raw -Encoding UTF8

# 1. Remove Svg, Path, G from imports
$imports = @"
  Document,
  Page,
  View,
  Text,
  StyleSheet,
  Font,
  Link,
  Image,
  Svg,
  Path,
  G,
"@
$newImports = @"
  Document,
  Page,
  View,
  Text,
  StyleSheet,
  Font,
  Link,
  Image,
"@
$pdf = $pdf.Replace($imports, $newImports)

# 2. Remove EGYPT_LOCATIONS import
$pdf = $pdf -replace '(?m)^\s*import\s*\{ EGYPT_LOCATIONS \}\s*from\s*"@/utils/mapGenerator";\s*\r?\n', ''

# 3. Remove ItineraryDay from type import
$pdf = $pdf.Replace('import type { Tour, BookingConfig, CompanyInfo, ItineraryDay } from "@/types";',
                     'import type { Tour, BookingConfig, CompanyInfo } from "@/types";')

# 4. Remove extractDayLocations function
$pdf = $pdf -replace '(?ms)\n\s*// Helper to extract location names.*?\n\s*return found;\n\s*\};', ''

# 5. Remove dayRoutesByDay useMemo block
$pdf = $pdf -replace '(?ms)\n\s*// Build route stops.*?\n\s*return map;\n\s*\}[\s]*,\s*\[booking\.dayRoutes\]\);', ''

# 6. Remove routeStops computation
$pdf = $pdf -replace '(?ms)\n\s*const routeStops = hasCustomStops.*?\n\s*return \{ day: key, label: dayLabel, locations \};\n\s*\}\);', ''

# 7. Remove allLocations computation  
$pdf = $pdf -replace '(?ms)\n\s*// Collect all unique locations.*?\n\s*\);[\s\n]*\n', "\n"

# 8. Remove Journey Route timeline JSX
$pdf = $pdf -replace '(?ms)\n\s+/\*\* JOURNEY ROUTE TIMELINE \*/.*?\}\s*\)\s*\n', "\n"

# 9. Remove Destinations Overview JSX
$pdf = $pdf -replace '(?ms)\n\s+/\*\* DESTINATIONS OVERVIEW.*?\n\s*\}\s*\)\s*\n', "\n"

# 10. Remove route styles
$pdf = $pdf -replace '(?ms)\n\s*routeWrapper: \{.*?destinationName: \{.*?\},\n', "\n"

# 11. Remove RouteTimeline component
$pdf = $pdf -replace '(?ms)\n\s*// Route Timeline Component.*?</Svg>\s*\n\s*\}\n', "\n"

# 12. Remove any orphaned <Svg> tags
$pdf = $pdf -replace '(?ms)<Svg[^>]*>.*?</Svg>', ''

# 13. Remove orphaned <Path> tags inside orphaned <G>
$pdf = $pdf -replace '(?ms)<G>\s*<Path[^/]*/>\s*</G>', ''

# Write clean file
[System.IO.File]::WriteAllText("src/components/pdf/itinerary-pdf.tsx", $pdf)

Write-Host "PDF Cleanup done."
Write-Host "Svg in file:" $pdf.Contains("Svg,")
Write-Host "Path in file:" $pdf.Contains("Path,")
Write-Host "G in file:" $pdf.Contains("G,")
Write-Host "RouteTimeline:" $pdf.Contains("RouteTimeline")
Write-Host "Journey Route:" $pdf.Contains("JOURNEY ROUTE")
Write-Host "dayRoutesByDay:" $pdf.Contains("dayRoutesByDay")
Write-Host "extractDayLocations:" $pdf.Contains("extractDayLocations")
Write-Host "routeStops:" $pdf.Contains("const routeStops")
Write-Host "customRouteStops:" $pdf.Contains("customRouteStops")
Write-Host "allLocations:" $pdf.Contains("allLocations")
Write-Host "Svg JSX:" $pdf.Contains("<Svg")
Write-Host "Path JSX:" $pdf.Contains("<Path")
Write-Host "Total lines:" ($pdf -split "`n").Count
