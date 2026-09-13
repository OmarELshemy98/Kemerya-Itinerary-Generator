$f = 'd:\Kemerya-Itinerary-Generator\src\app\dashboard\page.tsx'
$c = [System.IO.File]::ReadAllText($f)
$old = 'if (mode === "view") { setShowPDF(true); } else { setPendingDownload(config); }'
$new = "setSelectedLanguage(null);`n    setTranslatedData(null);`n    setTranslationError(null);`n    if (mode === ""view"") { setShowPDF(true); } else { setPendingDownload(config); }"
if ($c.Contains($old)) {
    $c = $c.Replace($old, $new)
    $tmp = $f + '.tmp'
    [System.IO.File]::WriteAllText($tmp, $c)
    Remove-Item $f
    Rename-Item $tmp $f
    Write-Host 'SUCCESS: Fixed handleBookingSubmit'
} else {
    Write-Host 'Pattern not found'
}