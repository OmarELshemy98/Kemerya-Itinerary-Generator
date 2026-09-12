"use client";

import * as React from "react";
import { pdf } from "@react-pdf/renderer";
import { Download, Loader2 } from "lucide-react";
import type { Tour, BookingConfig } from "@/types";
import { ItineraryPDF } from "@/components/pdf/itinerary-pdf";
import { KEMERYA_COMPANY_INFO } from "@/data/company";
import { Button } from "@/components/ui/button";
import { itineraryRowToBooking } from "@/lib/itinerary-view";
import { buildItineraryFileName } from "@/components/pdf/pdf-downloader";
import { generateDynamicMap } from "@/utils/mapGenerator";

// Simple module-level cache for the tour catalog (fetched lazily on first use)
let toursCache: Tour[] | null = null;
async function getTourByIdLazy(id: string): Promise<Tour | null> {
  if (!toursCache) {
    try {
      const res = await fetch("/api/tours", { cache: "no-store" });
      const json = await res.json();
      toursCache = json.ok ? json.tours || [] : [];
    } catch {
      toursCache = [];
    }
  }
  return (toursCache || []).find((t) => t.id === id) || null;
}

/**
 * Self-contained "Download PDF" button for a saved itinerary row. Fetches the
 * booking, rebuilds the BookingConfig, resolves the tour (if standard) and
 * generates/downloads the PDF client-side. Works anywhere (no provider needed).
 */
export function ItineraryDownloader({ id }: { id: string }) {
  const [state, setState] = React.useState<"idle" | "loading">("idle");

  const handleDownload = async () => {
    if (state === "loading") return;
    setState("loading");
    try {
      const res = await fetch(`/api/itineraries?id=${encodeURIComponent(id)}`, {
        cache: "no-store",
      });
      const json = await res.json();
      if (!json.ok || !json.itinerary) {
        throw new Error(json.error || "Itinerary not found");
      }
      const row = json.itinerary;
      const booking = itineraryRowToBooking(row);

      let tour: Tour | null = null;
      if (!row.is_custom_tour) {
        tour = await getTourByIdLazy(row.tour_id);
      }

      const days = booking.isCustomTour
        ? booking.customItinerary || []
        : tour?.itinerary || [];
      const mapUrl = await generateDynamicMap(days);
      const bookingWithMap: BookingConfig = {
        ...booking,
        mapUrl: mapUrl || booking.mapUrl,
      };

      const blob = await pdf(
        <ItineraryPDF tour={tour} booking={bookingWithMap} companyInfo={KEMERYA_COMPANY_INFO} />
      ).toBlob();

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = buildItineraryFileName(booking, tour);
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 10000);
    } catch (e) {
      console.error("Itinerary download failed:", e);
      window.alert(
        "Could not generate the PDF. Please check your connection and try again.\n\n" +
          String((e as any)?.message || e)
      );
    } finally {
      setState("idle");
    }
  };

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={handleDownload}
      disabled={state === "loading"}
      title="Download PDF"
    >
      {state === "loading" ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Download className="h-4 w-4" />
      )}
    </Button>
  );
}