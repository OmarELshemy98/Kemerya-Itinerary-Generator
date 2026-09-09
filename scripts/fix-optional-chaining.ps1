function Fix-OptionalChaining {
    $w = "D:\Kemerya-Itinerary-Generator\src\components\booking-configuration-form.tsx"
    $t = Get-Content $w -Raw
    # Fix inclusions/exclusions optional access
    $t = $t -replace 'selectedTour\.inclusions\.length', '(selectedTour.inclusions ?? []).length'
    $t = $t -replace 'selectedTour\.exclusions\.length', '(selectedTour.exclusions ?? []).length'
    $t = $t -replace 'selectedTour\.inclusions\.map', '(selectedTour.inclusions ?? []).map'
    $t = $t -replace 'selectedTour\.exclusions\.map', '(selectedTour.exclusions ?? []).map'
    Set-Content $w $t -NoNewline -Force
    Write-Host "Fixed booking-configuration-form.tsx"
}

Fix-OptionalChaining
