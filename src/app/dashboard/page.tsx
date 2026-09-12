"use client";

import * as React from "react";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { Map, FileText, Sparkles, CheckCircle2, Layers, Compass, MessageCircle, Copy, Check } from "lucide-react";
import { useToursData } from "@/components/tours-data-provider";
import type { Tour, BookingConfig } from "@/types";
import { TourSearchBar } from "@/components/tour-search-bar";
import { HierarchicalCategorySelector } from "@/components/hierarchical-category-selector";
import { BookingConfigurationForm } from "@/components/booking-configuration-form";
import { PDFPreviewDialog, buildWhatsAppMessage } from "@/components/pdf/pdf-preview-dialog";
import { PDFDownloader, buildItineraryFileName } from "@/components/pdf/pdf-downloader";
import { TourPreview } from "@/components/tour-preview";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { KEMERYA_COMPANY_INFO } from "@/data/company";
import { formatDateShort, formatCurrency, cn } from "@/lib/utils";
import { itineraryRowToBooking } from "@/lib/itinerary-view";

function GreetingMessageButton({
  booking,
  tour,
}: {
  booking: BookingConfig;
  tour: Tour | null;
}) {
  const [copied, setCopied] = React.useState(false);

  const message = React.useMemo(
    () =>
      buildWhatsAppMessage(
        booking,
        tour,
        KEMERYA_COMPANY_INFO,
        buildItineraryFileName(booking, tour)
      ),
    [booking, tour]
  );

  const clientPhone = booking.clientWhatsapp || booking.clientPhone || "";
  const phone = clientPhone.replace(/[^\d]/g, "");

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // ignore
    }
  };

  const handleSend = () => {
    if (phone.length >= 10) {
      window.open(
        `https://wa.me/${phone}?text=${encodeURIComponent(message)}`,
        "_blank",
        "noopener,noreferrer"
      );
    } else {
      handleCopy();
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="h-9"
        onClick={handleCopy}
      >
        {copied ? (
          <Check className="mr-2 h-4 w-4 text-emerald-600" />
        ) : (
          <Copy className="mr-2 h-4 w-4" />
        )}
        {copied ? "Copied!" : "Copy Greeting"}
      </Button>
      <Button
        size="sm"
        className="h-9 bg-emerald-500 text-white hover:bg-emerald-600"
        onClick={handleSend}
      >
        <MessageCircle className="mr-2 h-4 w-4" />
        Greeting Message
      </Button>
    </>
  );
}

function WhatsAppButton({ phoneNumber }: { phoneNumber: string }) {
  const [copied, setCopied] = React.useState(false);

  const sanitized = phoneNumber.replace(/[^\d]/g, "");
  const whatsappUrl = `https://wa.me/${sanitized}`;

  const handleClick = async () => {
    try {
      await navigator.clipboard.writeText(sanitized);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore copy errors
    }
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <Button
      onClick={handleClick}
      variant="outline"
      size="sm"
      className="h-9 gap-2 border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800"
    >
      {copied ? (
        <Check className="h-4 w-4" />
      ) : (
        <Copy className="h-4 w-4" />
      )}
      <MessageCircle className="h-4 w-4" />
      WhatsApp
    </Button>
  );
}

function DashboardInner() {
  const { tours, mainCategories, subCategories, source, getTourById } = useToursData();
  const [selectedTour, setSelectedTour] = React.useState<Tour | null>(null);
  const [isCustomMode, setIsCustomMode] = React.useState(false);
  const [bookingConfig, setBookingConfig] = React.useState<BookingConfig | null>(null);
  const [showPDF, setShowPDF] = React.useState(false);
  const [pendingDownload, setPendingDownload] = React.useState<BookingConfig | null>(null);
  const [bookingCount, setBookingCount] = React.useState(0);
  const [pendingItinerary, setPendingItinerary] = React.useState<any | null>(null);

  // Open a saved itinerary from ?view=<id>
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const viewId = params.get("view");
    if (!viewId) return;
    fetch(`/api/itineraries?id=${encodeURIComponent(viewId)}`, {
      cache: "no-store",
    })
      .then((res) => res.json())
      .then((json) => {
        if (json.ok && json.itinerary) setPendingItinerary(json.itinerary);
        else console.error("Itinerary view failed:", json);
      })
      .catch((e) => console.error("Itinerary view fetch error:", e));
  }, []);

  React.useEffect(() => {
    if (!pendingItinerary) return;
    const it = pendingItinerary;
    const cfg = itineraryRowToBooking(it);
    let tour: Tour | null = null;
    if (!it.is_custom_tour && it.tour_id) {
      tour = getTourById(it.tour_id) || null;
    }
    // For standard tours, wait until the tour catalog has finished loading so
    // the PDF can attach itinerary days, prices and terms before opening.
    const tourSettled = source !== "loading";
    if (!it.is_custom_tour && it.tour_id && !tour && !tourSettled) return;

    setPendingItinerary(null);
    setBookingConfig(cfg);
    setSelectedTour(tour);
    setIsCustomMode(Boolean(it.is_custom_tour));
    setShowPDF(true);
  }, [pendingItinerary, source, getTourById]);

  // Safety net: force-open the viewer even if the tour catalog never settles.
  React.useEffect(() => {
    if (!pendingItinerary) return;
    const timer = setTimeout(() => {
      const it = pendingItinerary;
      setPendingItinerary(null);
      setBookingConfig(itineraryRowToBooking(it));
      setSelectedTour(!it.is_custom_tour && it.tour_id ? getTourById(it.tour_id) || null : null);
      setIsCustomMode(Boolean(it.is_custom_tour));
      setShowPDF(true);
    }, 10000);
    return () => clearTimeout(timer);
  }, [pendingItinerary, getTourById]);

  const handleTourSelect = (tour: Tour) => {
    const fullTour = getTourById(tour.id) ?? tour;
    setSelectedTour(fullTour);
    setIsCustomMode(false);
    setTimeout(() => {
      const el = document.getElementById("booking-section");
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const handleBookingSubmit = (config: BookingConfig, mode: "download" | "view") => {
    setBookingConfig(config);
    setBookingCount((c) => c + 1);

    if (mode === "view") {
      setShowPDF(true);
    } else {
      setPendingDownload(config);
    }

    // Save itinerary to database
    fetch("/api/itineraries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tour: selectedTour, booking: config }),
    }).catch(console.error);
  };

  const handleClearSelection = () => {
    setSelectedTour(null);
    setBookingConfig(null);
  };

  const totalTravelers = React.useMemo(() => {
    if (!bookingConfig) return 0;
    return (
      bookingConfig.travelers.adults +
      bookingConfig.travelers.children +
      bookingConfig.travelers.infants
    );
  }, [bookingConfig]);

  return (
    <div className="space-y-6">
      {/* Section: Hero Search */}
      <section className="mb-8">
        <div className="relative rounded-2xl border border-slate-200 bg-gradient-to-br from-white via-white to-[#C9A962]/5 p-6 shadow-sm sm:p-8">
          <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl"><div className="absolute right-0 top-0 h-64 w-64 translate-x-1/3 -translate-y-1/3 rounded-full bg-[#C9A962]/10 blur-3xl" /></div>
          <div className="relative">
            <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <Badge variant="gold" className="rounded-full px-3 py-1">
                    Step 1 · Find the Tour
                  </Badge>
                  <Badge variant="outline" className="rounded-full px-3 py-1">
                    Or jump to Custom Tour in the form
                  </Badge>
                </div>
                <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                  Find a tour from our {tours.length}+ catalog
                </h2>
                <p className="mt-1 max-w-2xl text-sm text-slate-500">
                  Instantly search across every tour in the Kemerya catalog by
                  title, then fine-tune using the hierarchical category
                  browser below.
                </p>
              </div>
            </div>
            <div className="relative z-20"><TourSearchBar
                onTourSelect={handleTourSelect}
                placeholder="Search for any tour by title (e.g. 'Pyramids', 'Nile Cruise', 'Luxor', 'Siwa', 'Hurghada'...)"
              />
            </div>

            {/* Live catalog stats */}
            <div className="relative z-10 mt-5 grid grid-cols-3 gap-3">
              <StatCard
                label="Main Categories"
                value={mainCategories.length}
                icon={<Map className="h-4 w-4" />}
              />
              <StatCard
                label="Sub Categories"
                value={subCategories.length}
                icon={<Layers className="h-4 w-4" />}
              />
              <StatCard
                label="Tours"
                value={tours.length}
                icon={<Compass className="h-4 w-4" />}
              />
            </div>

            {selectedTour && !isCustomMode && (
              <SelectedTourBanner
                tour={selectedTour}
                onClear={handleClearSelection}
              />
            )}
          </div>
        </div>
      </section>

      {/* Section: Hierarchical Browser */}
      <section className="mb-8">
        <SectionHeader
          icon={<Map className="h-4 w-4" />}
          step="Step 2 (Alternative)"
          title="Browse by Category Hierarchy"
          subtitle="Navigate Main Categories → Sub Categories → Tours"
        />
        <HierarchicalCategorySelector
          onTourSelect={handleTourSelect}
          selectedTourId={selectedTour?.id}
        />
      </section>

      {/* Section: Tour preview — same data as kemeryatours.com */}
      {selectedTour && !isCustomMode && (
        <section className="mb-8">
          <SectionHeader
            icon={<FileText className="h-4 w-4" />}
            step="Tour Details"
            title="Tour Preview — as on the website"
            subtitle="Overview, Itinerary, Meeting Point, Included / Excluded, Prices, Trip Notes"
          />
          <TourPreview tour={selectedTour} />
        </section>
      )}

      {/* Section: Booking Form */}
      <section id="booking-section" className="mb-8 scroll-mt-6">
        <SectionHeader
          icon={<FileText className="h-4 w-4" />}
          step="Step 3"
          title="Booking & Itinerary Configuration"
          subtitle="Fill in traveler count, dates, pricing, notes — or switch to custom mode"
        />
        <BookingConfigurationForm
          selectedTour={selectedTour}
          isCustomMode={isCustomMode}
          onCustomModeChange={(val) => {
            setIsCustomMode(val);
            if (val) setSelectedTour(null);
          }}
          onSubmit={handleBookingSubmit}
        />
      </section>

      {/* Section: Recent Itineraries Summary */}
      {bookingConfig && (
        <section className="mb-8">
          <div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-[#C9A962]/5 p-5 sm:p-6">
            <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-emerald-900">
                    Itinerary Ready!
                  </p>
                  <p className="text-xs text-emerald-700">
                    Booking ref #{bookingConfig.id.slice(-8).toUpperCase()} —
                    click below to re-open the PDF preview
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {(bookingConfig.clientWhatsapp || bookingConfig.clientPhone) && (
                  <WhatsAppButton
                    phoneNumber={bookingConfig.clientWhatsapp || bookingConfig.clientPhone || ""}
                  />
                )}
                <GreetingMessageButton
                  booking={bookingConfig}
                  tour={bookingConfig.isCustomTour ? null : selectedTour}
                />
                <Button variant="gold" size="sm" onClick={() => setShowPDF(true)}>
                  <FileText className="mr-2 h-4 w-4" />
                  Re-open PDF
                </Button>
              </div>
            </div>
            <Separator className="my-3 bg-emerald-100" />
            <div className="grid grid-cols-2 gap-3 text-xs sm:grid-cols-4 md:grid-cols-6">
              <SummaryLine
                label="Tour"
                value={
                  bookingConfig.isCustomTour
                    ? bookingConfig.customTourTitle || "Custom Tour"
                    : selectedTour?.title || "—"
                }
              />
              <SummaryLine
                label="Travelers"
                value={`${totalTravelers} Guests`}
              />
              <SummaryLine
                label="Dates"
                value={`${formatDateShort(bookingConfig.startDate)} → ${formatDateShort(bookingConfig.endDate)}`}
              />
              <SummaryLine
                label="Price"
                value={formatCurrency(bookingConfig.totalPrice, bookingConfig.currency)}
              />
              <SummaryLine
                label="Mode"
                value={bookingConfig.isCustomTour ? "Custom" : "Standard"}
              />
              <SummaryLine
                label="Itineraries today"
                value={String(bookingCount)}
              />
            </div>
          </div>
        </section>
      )}

      {/* PDF Dialog (View mode) */}
      <PDFPreviewDialog
        open={showPDF}
        onOpenChange={setShowPDF}
        tour={selectedTour}
        booking={bookingConfig}
      />

      {/* Direct download (Generate mode) */}
      <PDFDownloader
        booking={pendingDownload}
        tour={selectedTour}
        onDone={() => setPendingDownload(null)}
      />
    </div>
  );
}

function SectionHeader({
  icon,
  step,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  step: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mb-4 flex items-start gap-3 px-1">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#C9A962]/15 text-[#C9A962]">
        {icon}
      </div>
      <div className="flex-1">
        <div className="mb-1 flex items-center gap-2">
          <Badge variant="gold" className="rounded-full text-[10px] px-2.5 py-0.5">
            {step}
          </Badge>
        </div>
        <h2 className="text-lg font-semibold tracking-tight text-slate-900">
          {title}
        </h2>
        {subtitle && <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>}
      </div>
    </div>
  );
}

function SelectedTourBanner({
  tour,
  onClear,
}: {
  tour: Tour;
  onClear: () => void;
}) {
  return (
    <div className="relative z-10 mt-5 flex flex-col items-start gap-3 rounded-xl border border-[#C9A962]/50 bg-[#C9A962]/5 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-lg bg-[#C9A962] text-white shadow">
          <Sparkles className="h-4 w-4" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[#8b7435]">
            Tour Selected
          </p>
          <h3 className="text-sm font-bold text-slate-900 sm:text-base">
            {tour.title}
          </h3>
          <p className="mt-0.5 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-slate-500">
            <span className="font-medium text-slate-700">
              {tour.durationDays} day{tour.durationDays !== 1 ? "s" : ""}
              {tour.durationNights ? ` / ${tour.durationNights} nights` : ""}
            </span>
            {(() => {
              const usd =
                tour.basePriceUSD !== undefined
                  ? tour.basePriceUSD
                  : tour.basePriceEUR !== undefined
                  ? Math.round(tour.basePriceEUR / 0.92)
                  : undefined;
              return usd !== undefined ? (
                <span>
                  From {formatCurrency(usd, "USD")} / pax
                </span>
              ) : null;
            })()}
          </p>
        </div>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={onClear}
        className="text-sm text-slate-600 hover:text-red-600"
      >
        Clear selection
      </Button>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#C9A962]/15 text-[#C9A962]">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-lg font-bold leading-none text-slate-900">
          {value}
        </p>
        <p className="mt-1 truncate text-[11px] font-medium uppercase tracking-wider text-slate-500">
          {label}
        </p>
      </div>
    </div>
  );
}

function SummaryLine({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
        {label}
      </p>
      <p
        className={cn(
          "mt-0.5 truncate text-sm font-semibold text-slate-800"
        )}
        title={value}
      >
        {value}
      </p>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <DashboardInner />
    </DashboardLayout>
  );
}
