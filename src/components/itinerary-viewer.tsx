"use client";

import * as React from "react";
import { BlobProvider } from "@react-pdf/renderer";
import {
  ArrowLeft,
  Download,
  Loader2,
  FileText,
  MessageCircle,
  Copy,
  Check,
  X,
} from "lucide-react";
import type { Tour, BookingConfig } from "@/types";
import { ItineraryPDF } from "@/components/pdf/itinerary-pdf";
import { KEMERYA_COMPANY_INFO } from "@/data/company";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PriceWithOffer } from "@/components/offer-price";
import { itineraryRowToBooking } from "@/lib/itinerary-view";
import { buildItineraryFileName } from "@/components/pdf/pdf-downloader";
import { formatDateShort } from "@/lib/utils";
import { generateDynamicMap } from "@/utils/mapGenerator";
import { useToursData } from "@/components/tours-data-provider";

/**
 * Standalone, shareable itinerary viewer. Loads a single booking by its id
 * and renders the full PDF itinerary full-screen with Download + WhatsApp
 * share actions. Used by /itinerary/<id>.
 */
export function ItineraryViewer({ id }: { id: string }) {
  const { source, getTourById } = useToursData();
  const [booking, setBooking] = React.useState<BookingConfig | null>(null);
  const [tour, setTour] = React.useState<Tour | null>(null);
  const [tourResolved, setTourResolved] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [copied, setCopied] = React.useState(false);
  const [dynamicMapUrl, setDynamicMapUrl] = React.useState<string | null>(null);
  const rowRef = React.useRef<any>(null);

  // Fetch the booking data (public endpoint)
  React.useEffect(() => {
    let cancelled = false;
    fetch(`/api/public/itineraries/${encodeURIComponent(id)}`, {
      cache: "no-store",
    })
      .then((res) => res.json())
      .then((json) => {
        if (cancelled) return;
        if (!json.ok || !json.itinerary) {
          setError(json.error || "Itinerary not found");
          return;
        }
        const row = json.itinerary;
        rowRef.current = row;
        setBooking(itineraryRowToBooking(row));
        if (row.is_custom_tour) {
          setTour(null);
          setTourResolved(true);
        }
      })
      .catch((e) => {
        if (!cancelled) setError(String(e));
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  // Resolve the tour for standard tours once the catalog has loaded
  React.useEffect(() => {
    if (!booking || booking.isCustomTour || tourResolved) return;
    const tourId = rowRef.current?.tour_id;
    if (!tourId) {
      setTour(null);
      setTourResolved(true);
      return;
    }
    const found = getTourById(tourId);
    if (found) {
      setTour(found);
      setTourResolved(true);
      return;
    }
    if (source !== "loading") {
      setTour(null);
      setTourResolved(true);
    }
  }, [booking, source, tourResolved, getTourById]);

  // Safety net — force-open even if the catalog never settles
  React.useEffect(() => {
    if (!booking || tourResolved) return;
    const timer = setTimeout(() => {
      const tourId = rowRef.current?.tour_id;
      setTour(tourId ? getTourById(tourId) || null : null);
      setTourResolved(true);
    }, 10000);
    return () => clearTimeout(timer);
  }, [booking, tourResolved, getTourById]);

  // Dynamic journey map
  React.useEffect(() => {
    if (!booking) return;
    const days = booking.isCustomTour
      ? booking.customItinerary || []
      : tour?.itinerary || [];
    if (days.length === 0) {
      setDynamicMapUrl(null);
      return;
    }
    let cancelled = false;
    generateDynamicMap(days).then((u) => {
      if (!cancelled) setDynamicMapUrl(u);
    });
    return () => {
      cancelled = true;
    };
  }, [booking, tour]);

  // Error screen
  if (error) {
    return (
      <div className="flex min-h-full flex-1 flex-col items-center justify-center gap-3 p-10 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-600">
          <X className="h-7 w-7" />
        </div>
        <p className="text-lg font-semibold text-slate-900">Itinerary unavailable</p>
        <p className="max-w-md text-sm text-slate-500">{error}</p>
        <a href="/dashboard" className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-[#C9A962] hover:underline">
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </a>
      </div>
    );
  }

  // Loading screen
  if (!booking || !tourResolved) {
    return (
      <div className="flex min-h-full flex-1 flex-col items-center justify-center gap-3 p-10 text-center">
        <Loader2 className="h-10 w-10 animate-spin text-[#C9A962]" />
        <p className="text-sm font-semibold text-slate-700">Loading itinerary…</p>
      </div>
    );
  }

  const bookingWithMap: BookingConfig = booking
    ? { ...booking, mapUrl: dynamicMapUrl || booking.mapUrl }
    : booking;
  const fileName = buildItineraryFileName(booking, tour);
  const title = booking.isCustomTour
    ? booking.customTourTitle || "Custom Tour"
    : tour?.title || booking.tourId || "Itinerary";
  const pageUrl = window.location.href;
  const phone = (booking.clientWhatsapp || booking.clientPhone || "").replace(/[^\d]/g, "");
  const message = `Here is your luxury itinerary: ${pageUrl}`;
  const shareUrl =
    phone.length >= 10
      ? `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
      : `https://wa.me/?text=${encodeURIComponent(message)}`;

  const totalTravelers =
    booking.travelers.adults +
    booking.travelers.children +
    booking.travelers.infants;

  const pdfDocument = (
    <ItineraryPDF tour={tour} booking={bookingWithMap} companyInfo={KEMERYA_COMPANY_INFO} />
  );

  return (
    <BlobProvider document={pdfDocument}>
      {({ url, loading, error: blobError }) => {
        const renderError = blobError ? String(blobError?.message || blobError) : null;
        return (
          <div className="flex h-screen min-h-full flex-col bg-slate-50">
            {/* Header action bar */}
            <header className="border-b border-slate-200 bg-white shadow-sm">
              <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <a href="/dashboard" className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100" title="Back to Dashboard">
                    <ArrowLeft className="h-4 w-4" />
                  </a>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[#C9A962]/15 text-[#C9A962]">
                        <FileText className="h-3.5 w-3.5" />
                      </span>
                      <h1 className="truncate text-base font-bold text-slate-900">{title}</h1>
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-1.5">
                      <Badge variant="outline" className="rounded-full"># {booking.id.replace(/^bk-/, "").toUpperCase()}</Badge>
                      <Badge variant="outline" className="rounded-full">{totalTravelers} Travelers</Badge>
                      <Badge variant="outline" className="rounded-full">{formatDateShort(booking.startDate)} → {formatDateShort(booking.endDate)}</Badge>
                      <Badge variant="gold" className="rounded-full">
                        <PriceWithOffer
                          totalPrice={booking.totalPrice}
                          offerPrice={booking.offerPrice}
                          currency={booking.currency}
                        />
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(pageUrl);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                  >
                    {copied ? <Check className="mr-1.5 h-4 w-4 text-emerald-600" /> : <Copy className="mr-1.5 h-4 w-4" />}
                    {copied ? "Copied!" : "Copy Link"}
                  </Button>
                  {url && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={loading}
                      onClick={() => {
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = fileName;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                      }}
                    >
                      {loading ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Download className="mr-1.5 h-4 w-4" />}
                      {loading ? "Preparing…" : "Download PDF"}
                    </Button>
                  )}
                  <Button type="button" size="sm" className="bg-emerald-500 text-white hover:bg-emerald-600" onClick={() => window.open(shareUrl, "_blank", "noopener,noreferrer")}>
                    <MessageCircle className="mr-1.5 h-4 w-4" />
                    Share via WhatsApp
                  </Button>
                </div>
              </div>
            </header>

            {/* PDF preview */}
            <main className="relative flex-1 overflow-hidden bg-slate-200">
              {loading && !url ? (
                <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
                  <Loader2 className="h-12 w-12 animate-spin text-[#C9A962]" />
                  <p className="text-sm font-semibold text-slate-700">Generating your PDF itinerary…</p>
                </div>
              ) : error || renderError ? (
                <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
                    <X className="h-6 w-6" />
                  </div>
                  <p className="text-sm font-semibold text-red-700">Failed to render PDF</p>
                  <p className="max-w-md text-xs text-red-500">{error || renderError}</p>
                </div>
              ) : !url ? (
                <div className="flex h-full items-center justify-center text-sm text-slate-500">PDF not available.</div>
              ) : (
                <iframe title="Itinerary Preview" src={url} className="h-full w-full border-0 bg-white" />
              )}
            </main>
          </div>
        );
      }}
    </BlobProvider>
  );
}