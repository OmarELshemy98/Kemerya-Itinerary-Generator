"use client";

import * as React from "react";
import { pdf } from "@react-pdf/renderer";
import type { Tour, BookingConfig } from "@/types";
import { ItineraryPDF } from "./itinerary-pdf";
import { KEMERYA_COMPANY_INFO } from "@/data/company";
import { generateLuxuryMapUrl } from "@/utils/mapHelper";

interface PDFDownloaderProps {
  booking: BookingConfig | null;
  tour: Tour | null;
  onDone?: () => void;
}

export function buildItineraryFileName(
  booking: BookingConfig,
  tour: Tour | null
): string {
  const bookingRef = booking.id.toUpperCase().replace(/-/g, "").slice(-8);
  const tourTitle = booking.isCustomTour
    ? booking.customTourTitle || "Custom-Tour"
    : tour?.title || "Kemerya-Tour";
  const safeName = tourTitle
    .replace(/[^a-zA-Z0-9\-_ ]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 60);
  return `Kemerya-Itinerary-${safeName}-${bookingRef.slice(-4)}.pdf`;
}

/**
 * PDFDownloader — generates the PDF imperatively (pdf().toBlob()) and
 * triggers a direct download. Renders nothing; runs only in the browser.
 */
export function PDFDownloader({ booking, tour, onDone }: PDFDownloaderProps) {
  const startedRef = React.useRef<BookingConfig | null>(null);

  React.useEffect(() => {
    if (!booking) {
      startedRef.current = null;
      return;
    }
    // Guard against double-execution for the same booking object
    if (startedRef.current === booking) return;
    startedRef.current = booking;

    let cancelled = false;
    (async () => {
      try {
        const mockLocations = [
          { lat: 29.9792, lon: 31.1342 }, // Giza
          { lat: 29.8713, lon: 31.2165 }, // Saqqara
          { lat: 29.8499, lon: 31.2536 }  // Memphis
        ];
        const mapUrl = generateLuxuryMapUrl(mockLocations);
        const bookingWithMap: BookingConfig = { ...booking, mapUrl };
        const blob = await pdf(
          <ItineraryPDF tour={tour} booking={bookingWithMap} companyInfo={KEMERYA_COMPANY_INFO} />
        ).toBlob();
        if (cancelled) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = buildItineraryFileName(booking, tour);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 10000);
        onDone?.();
      } catch (err) {
        console.error("PDF generation failed:", err);
        alert(
          "Sorry, the PDF could not be generated. Please check your connection and try again.\n\n" +
            String(err)
        );
        onDone?.();
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [booking, tour]);

  return null;
}
