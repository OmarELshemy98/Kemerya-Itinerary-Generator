"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { Map, FileText, Sparkles, CheckCircle2 } from "lucide-react";
import { ToursDataProvider, useToursData } from "@/components/tours-data-provider";
import type { Tour, BookingConfig } from "@/types";
import { DashboardHeader } from "@/components/dashboard-header";
import { TourSearchBar } from "@/components/tour-search-bar";
import { HierarchicalCategorySelector } from "@/components/hierarchical-category-selector";
import { BookingConfigurationForm } from "@/components/booking-configuration-form";
import { PDFPreviewDialog } from "@/components/pdf/pdf-preview-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { KEMERYA_COMPANY_INFO } from "@/data/company";
import { formatDateShort, formatCurrency, cn } from "@/lib/utils";

function DashboardInner() {
  const { tours, getTourById } = useToursData();
  const [selectedTour, setSelectedTour] = React.useState<Tour | null>(null);
  const [isCustomMode, setIsCustomMode] = React.useState(false);
  const [bookingConfig, setBookingConfig] = React.useState<BookingConfig | null>(null);
  const [showPDF, setShowPDF] = React.useState(false);
  const [bookingCount, setBookingCount] = React.useState(0);

  const handleTourSelect = (tour: Tour) => {
    const fullTour = getTourById(tour.id) ?? tour;
    setSelectedTour(fullTour);
    setIsCustomMode(false);
    setTimeout(() => {
      const el = document.getElementById("booking-section");
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const handleBookingSubmit = (config: BookingConfig) => {
    setBookingConfig(config);
    setBookingCount((c) => c + 1);
    setShowPDF(true);
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
    <div className="min-h-screen bg-slate-50">
      <DashboardHeader />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Section: Hero Search */}
        <section className="mb-8">
          <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-white via-white to-[#C9A962]/5 p-6 shadow-sm sm:p-8">
            <div className="absolute right-0 top-0 h-64 w-64 translate-x-1/3 -translate-y-1/3 rounded-full bg-[#C9A962]/10 blur-3xl" />
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
              <div className="relative z-10">
                <TourSearchBar
                  onTourSelect={handleTourSelect}
                  placeholder="Search for any tour by title (e.g. 'Pyramids', 'Nile Cruise', 'Luxor', 'Siwa', 'Hurghada'...)"
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
              <div className="mb-3 flex items-start justify-between gap-3">
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
                <Button variant="gold" size="sm" onClick={() => setShowPDF(true)}>
                  <FileText className="mr-2 h-4 w-4" />
                  Re-open PDF
                </Button>
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

        {/* Footer */}
        <footer className="mt-12 border-t border-slate-200 bg-white/50 py-6 backdrop-blur">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-900">
                {KEMERYA_COMPANY_INFO.name}
              </p>
              <p className="text-xs text-slate-500">
                Itinerary Generator v1.0 · Internal Operations Dashboard
              </p>
            </div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs text-slate-500 sm:grid-cols-3">
              <p>
                <span className="font-medium text-slate-700">Operations:</span>{" "}
                {KEMERYA_COMPANY_INFO.operationsManager.phone}
              </p>
              <p>
                <span className="font-medium text-slate-700">WhatsApp:</span>{" "}
                {KEMERYA_COMPANY_INFO.whatsapp}
              </p>
              <p className="col-span-2 sm:col-span-1">
                <span className="font-medium text-slate-700">Email:</span>{" "}
                {KEMERYA_COMPANY_INFO.email}
              </p>
            </div>
          </div>
        </footer>
      </main>

      {/* PDF Dialog */}
      <PDFPreviewDialog
        open={showPDF}
        onOpenChange={setShowPDF}
        tour={selectedTour}
        booking={bookingConfig}
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
            {tour.basePriceUSD !== undefined ? (
              <span>
                From {formatCurrency(tour.basePriceUSD, "USD")} / pax
              </span>
            ) : tour.basePriceEUR !== undefined ? (
              <span>
                From {formatCurrency(tour.basePriceEUR, "EUR")} / pax
              </span>
            ) : null}
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
    <ToursDataProvider>
      <DashboardInner />
    </ToursDataProvider>
  );
}
