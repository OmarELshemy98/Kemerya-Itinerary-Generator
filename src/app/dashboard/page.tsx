"use client";

import * as React from "react";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { Map, FileText, Sparkles, CheckCircle2, Layers, Compass, MessageCircle, Copy, Check, Globe, Users, Calendar, CreditCard, Eye } from "lucide-react";
import { useToursData } from "@/components/tours-data-provider";
import type { Tour, BookingConfig } from "@/types";
import { TourSearchBar } from "@/components/tour-search-bar";
import { HierarchicalCategorySelector } from "@/components/hierarchical-category-selector";
import { BookingConfigurationForm } from "@/components/booking-configuration-form";
import { PDFPreviewDialog, buildWhatsAppMessage } from "@/components/pdf/pdf-preview-dialog";
import { PDFDownloader, buildItineraryFileName } from "@/components/pdf/pdf-downloader";
import { LanguageSelector } from "@/components/language-selector";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { KEMERYA_COMPANY_INFO } from "@/data/company";
import { formatDateShort, formatCurrency, cn } from "@/lib/utils";
import { itineraryRowToBooking } from "@/lib/itinerary-view";
import { SupportedLanguageCode } from "@/lib/languages";
import { translateItineraryData } from "@/lib/translate-client";

function GreetingMessageButton({ booking, tour }: { booking: BookingConfig; tour: Tour | null }) {
  const [copied, setCopied] = React.useState(false);
  const message = React.useMemo(() => buildWhatsAppMessage(booking, tour, KEMERYA_COMPANY_INFO, buildItineraryFileName(booking, tour)), [booking, tour]);
  const clientPhone = booking.clientWhatsapp || booking.clientPhone || "";
  const phone = clientPhone.replace(/[^\d]/g, "");
  const handleCopy = async () => { try { await navigator.clipboard.writeText(message); setCopied(true); setTimeout(() => setCopied(false), 2500); } catch(e) { /* ignore */ } };
  const handleSend = () => { if (phone.length >= 10) { window.open("https://wa.me/" + phone + "?text=" + encodeURIComponent(message), "_blank", "noopener,noreferrer"); } else { handleCopy(); } };
  return (<><Button variant="outline" size="sm" className="h-9" onClick={handleCopy}>{copied ? <Check className="mr-2 h-4 w-4 text-emerald-600" /> : <Copy className="mr-2 h-4 w-4" />}{copied ? "Copied!" : "Copy Greeting"}</Button><Button size="sm" className="h-9 bg-emerald-500 text-white hover:bg-emerald-600" onClick={handleSend}><MessageCircle className="mr-2 h-4 w-4" />Greeting Message</Button></>);
}

function WhatsAppButton({ phoneNumber }: { phoneNumber: string }) {
  const [copied, setCopied] = React.useState(false);
  const sanitized = phoneNumber.replace(/[^\d]/g, "");
  const whatsappUrl = "https://wa.me/" + sanitized;
  const handleClick = async () => { try { await navigator.clipboard.writeText(sanitized); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch(e) { /* ignore */ } window.open(whatsappUrl, "_blank", "noopener,noreferrer"); };
  return (<Button variant="outline" size="sm" className="h-9 gap-2" onClick={handleClick}>{copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}<MessageCircle className="h-4 w-4" />WhatsApp</Button>);
}

function DashboardInner() {
  const { tours, mainCategories, subCategories, source, getTourById } = useToursData();
  const [selectedTour, setSelectedTour] = React.useState<Tour | null>(null);
  const [isCustomMode, setIsCustomMode] = React.useState(false);
  const [bookingConfig, setBookingConfig] = React.useState<BookingConfig | null>(null);
  const [showPDF, setShowPDF] = React.useState(false);
  const [pendingDownload, setPendingDownload] = React.useState<BookingConfig | null>(null);
  const [bookingCount, setBookingCount] = React.useState(0);
  const [pendingItinerary, setPendingItinerary] = React.useState<any>(null);
  const [selectedLanguage, setSelectedLanguage] = React.useState<SupportedLanguageCode | null>(null);
  const [translatedData, setTranslatedData] = React.useState<Record<string, unknown> | null>(null);
  const [isTranslating, setIsTranslating] = React.useState(false);
  const [translationError, setTranslationError] = React.useState<string | null>(null);
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const viewId = params.get("view");
    if (!viewId) return;
    fetch("/api/itineraries?id=" + encodeURIComponent(viewId), { cache: "no-store" }).then((res) => res.json()).then((json) => { if (json.ok && json.itinerary) setPendingItinerary(json.itinerary); else console.error("Itinerary view failed:", json); }).catch((e) => console.error("Itinerary view fetch error:", e));
  }, []);

  React.useEffect(() => {
    if (!pendingItinerary) return;
    const it = pendingItinerary;
    const cfg = itineraryRowToBooking(it);
    let tour = null;
    if (!it.is_custom_tour && it.tour_id) { tour = getTourById(it.tour_id) || null; }
    const tourSettled = source !== "loading";
    if (!it.is_custom_tour && it.tour_id && !tour && !tourSettled) return;
    setPendingItinerary(null);
    setBookingConfig(cfg);
    setSelectedTour(tour);
    setIsCustomMode(Boolean(it.is_custom_tour));
    setShowPDF(true);
  }, [pendingItinerary, source, getTourById]);

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
    setTimeout(() => { const el = document.getElementById("booking-section"); if (el) el.scrollIntoView({ behavior: "smooth", block: "start" }); }, 100);
  };

  const handleBookingSubmit = (config: BookingConfig, mode: "download" | "view") => {
    setBookingConfig(config);
    setBookingCount((c) => c + 1);
    if (mode === "view") { setShowPDF(true); } else { setPendingDownload(config); }
    fetch("/api/itineraries", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ tour: selectedTour, booking: config }) }).catch(console.error);
  };

  const handleClearSelection = () => {
    setSelectedTour(null);
    setBookingConfig(null);
    setSelectedLanguage(null);
    setTranslatedData(null);
    setTranslationError(null);
  };

  const handleTranslate = (languageCode: SupportedLanguageCode | null): void => {
    if (!languageCode) {
      setSelectedLanguage(null);
      setTranslatedData(null);
      setTranslationError(null);
      return;
    }
    if (!bookingConfig || !selectedTour) return;

    setSelectedLanguage(languageCode);
    setIsTranslating(true);
    setTranslationError(null);

    translateItineraryData(languageCode, selectedTour, bookingConfig, KEMERYA_COMPANY_INFO)
      .then((result) => {
        if (result.success && result.translatedData) {
          setTranslatedData(result.translatedData);
          console.log("Gemini Raw Output:", result.translatedData);
        } else {
          setTranslationError(result.error || "Translation failed");
          setTranslatedData(null);
        }
      })
      .catch((err) => {
        const message = err instanceof Error ? err.message : "Translation request failed";
        setTranslationError(message);
        setTranslatedData(null);
      })
      .finally(() => {
        setIsTranslating(false);
      });
  };



  const totalTravelers = React.useMemo(() => { if (!bookingConfig) return 0; return bookingConfig.travelers.adults + bookingConfig.travelers.children + bookingConfig.travelers.infants; }, [bookingConfig]);

  return (
    <div className="space-y-6">
      <section className="mb-8">
        <div className="relative rounded-2xl border border-slate-200 bg-gradient-to-br from-white via-white to-[#C9A962]/5 p-6 shadow-sm sm:p-8">
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Create Itinerary</h1>
              <p className="mt-1 text-sm text-slate-500">Select a tour and configure booking details to generate a premium PDF itinerary.</p>
            </div>
            <div className="flex items-center gap-2"><Badge variant="gold" className="text-xs">{tours.length} Tours</Badge></div>
          </div>
          <div className="mb-6"><TourSearchBar onTourSelect={handleTourSelect} /></div>
          <HierarchicalCategorySelector onTourSelect={handleTourSelect} selectedTourId={selectedTour?.id} />
        </div>
      </section>

      {selectedTour && (<SelectedTourBanner tour={selectedTour} onClear={handleClearSelection} />)}

      {selectedTour && (
        <section id="booking-section" className="mb-8">
          <SectionHeader icon={<FileText className="h-4 w-4" />} step="02" title="Booking Configuration" subtitle="Configure travelers, dates, and pricing for this tour." />
          <BookingConfigurationForm selectedTour={selectedTour} isCustomMode={isCustomMode} onCustomModeChange={setIsCustomMode} onSubmit={handleBookingSubmit} />
        </section>
      )}

      {/* Language Selection - BEFORE PDF preview */}
      {bookingConfig && (
        <section className="mb-8">
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#C9A962]/15 text-[#C9A962]"><Globe className="h-4 w-4" /></div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">Translate PDF</p>
                  <p className="mt-0.5 text-xs text-slate-500">Select a language to translate the itinerary</p>
                </div>
              </div>
              {selectedLanguage && (
                <Badge variant="gold" className="self-start">
                  {selectedLanguage}{" \u2014 "}{translatedData ? "Translated" : isTranslating ? "Translating..." : "Ready"}
                </Badge>
              )}
            </div>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <LanguageSelector value={selectedLanguage} onChange={handleTranslate} disabled={!bookingConfig || isTranslating} showLabel={false} />
              {isTranslating && (
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <svg className="h-4 w-4 animate-spin text-[#C9A962]" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                  Translating...
                </div>
              )}
              {selectedLanguage && !isTranslating && !translationError && (
                <Button variant="outline" size="sm" onClick={() => { setSelectedLanguage(null); setTranslatedData(null); setTranslationError(null); }}>Clear</Button>
              )}
            </div>
            {translationError && (
              <div className="mt-3 flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                <svg className="h-4 w-4 shrink-0 text-red-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                {translationError}
              </div>
            )}
          </div>
        </section>
      )}

      {bookingConfig && bookingConfig.totalPrice > 0 && (
        <section className="mb-8">
          <SectionHeader icon={<Compass className="h-4 w-4" />} step="03" title="Preview & Download" subtitle="Review the itinerary summary and download the PDF." />
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#C9A962]/15 text-[#C9A962]"><Layers className="h-4 w-4" /></div>
              <div><p className="text-sm font-semibold text-slate-900">Itinerary Summary</p><p className="text-xs text-slate-500">{bookingConfig.isCustomTour ? bookingConfig.customTourTitle || "Custom Tour" : selectedTour?.title || "Tour"}</p></div>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatCard label="Travelers" value={totalTravelers} icon={<Users className="h-4 w-4" />} />
              <StatCard label="Duration" value={selectedTour?.durationDays || 0} icon={<Calendar className="h-4 w-4" />} />
              <StatCard label="Price" value={bookingConfig.totalPrice} icon={<CreditCard className="h-4 w-4" />} />
              <StatCard label="Nights" value={selectedTour?.durationNights || 0} icon={<Map className="h-4 w-4" />} />
            </div>
            <Separator className="my-4" />
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <SummaryLine label="Client" value={bookingConfig.clientName || "Not specified"} />
              <SummaryLine label="Dates" value={formatDateShort(bookingConfig.startDate) + " \u2192 " + formatDateShort(bookingConfig.endDate)} />
              <SummaryLine label="Currency" value={bookingConfig.currency} />
              <SummaryLine label="Adults" value={String(bookingConfig.travelers.adults)} />
              <SummaryLine label="Children" value={String(bookingConfig.travelers.children)} />
              <SummaryLine label="Infants" value={String(bookingConfig.travelers.infants)} />
            </div>
            <Separator className="my-4" />
            <div className="flex flex-wrap items-center gap-3">
              <Button className="h-9 gap-2 bg-[#C9A962] text-white hover:bg-[#b89555]" onClick={() => setShowPDF(true)}><Eye className="h-4 w-4" />View PDF</Button>
              <Button variant="outline" className="h-9 gap-2 border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100" onClick={() => setPendingDownload(bookingConfig)}><FileText className="h-4 w-4" />Download PDF</Button>
              {bookingConfig.clientPhone && <GreetingMessageButton booking={bookingConfig} tour={selectedTour} />}
            </div>
          </div>
        </section>
      )}
      <PDFPreviewDialog open={showPDF} onOpenChange={setShowPDF} tour={selectedTour} booking={bookingConfig} translatedData={translatedData || undefined} languageCode={selectedLanguage || undefined} translationError={translationError || undefined} />
      <PDFDownloader booking={pendingDownload} tour={selectedTour} onDone={() => setPendingDownload(null)} translatedData={translatedData || undefined} languageCode={selectedLanguage || undefined} />
    </div>
  );
}

function SectionHeader({ icon, step, title, subtitle }: { icon: React.ReactNode; step: string; title: string; subtitle?: string }) {
  return (
    <div className="mb-4 flex items-start gap-3 px-1">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#C9A962]/15 text-[#C9A962]">{icon}</div>
      <div className="flex-1">
        <div className="mb-1 flex items-center gap-2"><Badge variant="gold" className="rounded-full text-[10px] px-2.5 py-0.5">{step}</Badge></div>
        <h2 className="text-lg font-semibold tracking-tight text-slate-900">{title}</h2>
        {subtitle && <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>}
      </div>
    </div>
  );
}

function SelectedTourBanner({ tour, onClear }: { tour: Tour; onClear: () => void }) {
  return (
    <div className="relative z-10 mt-5 flex flex-col items-start gap-3 rounded-xl border border-[#C9A962]/50 bg-[#C9A962]/5 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-lg bg-[#C9A962] text-white shadow"><Sparkles className="h-4 w-4" /></div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[#8b7435]">Tour Selected</p>
          <h3 className="text-sm font-bold text-slate-900 sm:text-base">{tour.title}</h3>
          <p className="mt-0.5 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-slate-500">
            <span className="font-medium text-slate-700">{tour.durationDays} day{tour.durationDays !== 1 ? "s" : ""}{tour.durationNights ? " / " + tour.durationNights + " nights" : ""}</span>
            {(() => { const usd = tour.basePriceUSD !== undefined ? tour.basePriceUSD : tour.basePriceEUR !== undefined ? Math.round(tour.basePriceEUR / 0.92) : undefined; return usd !== undefined ? (<span>From {formatCurrency(usd, "USD")} / pax</span>) : null; })()}
          </p>
        </div>
      </div>
      <Button variant="ghost" size="sm" onClick={onClear} className="text-sm text-slate-600 hover:text-red-600">Clear selection</Button>
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#C9A962]/15 text-[#C9A962]">{icon}</div>
      <div className="min-w-0"><p className="text-lg font-bold leading-none text-slate-900">{value}</p><p className="mt-1 truncate text-[11px] font-medium uppercase tracking-wider text-slate-500">{label}</p></div>
    </div>
  );
}

function SummaryLine({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">{label}</p>
      <p className={cn("mt-0.5 truncate text-sm font-semibold text-slate-800")} title={value}>{value}</p>
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
