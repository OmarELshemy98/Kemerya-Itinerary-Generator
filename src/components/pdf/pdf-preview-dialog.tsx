"use client";

import * as React from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ItineraryPDF } from "./itinerary-pdf";
import { KEMERYA_COMPANY_INFO } from "@/data/company";
import type { Tour, BookingConfig } from "@/types";
import { pdf } from "@react-pdf/renderer";
import { generateDynamicMap } from "@/utils/mapGenerator";
import { buildItineraryFileName } from "./pdf-downloader";

export interface PDFPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tour: Tour | null;
  booking: BookingConfig | null;
  translatedData?: Record<string, unknown>;
  languageCode?: string;
  translationError?: string | null;
}

export function buildWhatsAppMessage(
  booking: BookingConfig,
  tour: Tour | null,
  companyInfo: { name: string; phone: string; website: string },
  fileName: string
): string {
  const tourName = booking.isCustomTour
    ? booking.customTourTitle || "Custom Tour"
    : tour?.title || "Kemerya Tour";
  const dates = booking.startDate.replace("T", " ") + " → " + booking.endDate.replace("T", " ");
  return "🎉 *" + companyInfo.name + " - Your Itinerary is Ready!*\n\n" +
    "Dear " + (booking.clientName || "Guest") + ",\n\n" +
    "Your exclusive travel itinerary \"" + tourName + "\" has been prepared.\n\n" +
    "📅 *Dates:* " + dates + "\n" +
    "👥 *Travelers:* " + booking.travelers.adults + " adult(s)" +
    (booking.travelers.children ? ", " + booking.travelers.children + " child(ren)" : "") +
    (booking.travelers.infants ? ", " + booking.travelers.infants + " infant(s)" : "") + "\n" +
    "💰 *Total:* " + booking.currency + " " + booking.totalPrice.toLocaleString() + "\n\n" +
    "📎 Attached: " + fileName + "\n\n" +
    "For any questions, contact us:\n" +
    "📞 " + companyInfo.phone + "\n" +
    "🌐 " + companyInfo.website + "\n\n" +
    companyInfo.name + " Team";
}

export function PDFPreviewDialog({
  open,
  onOpenChange,
  tour,
  booking,
  translatedData,
  languageCode,
  translationError,
}: PDFPreviewDialogProps) {
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [pdfUrl, setPdfUrl] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!open || !booking) {
      setPdfUrl(null);
      return;
    }

    let objectUrl: string | null = null;

    const generatePDF = async () => {
      setIsGenerating(true);
      setError(null);
      setPdfUrl(null);

      try {
        const itineraryDays = booking.isCustomTour
          ? booking.customItinerary || []
          : tour?.itinerary || [];

        const mapUrl = await generateDynamicMap(itineraryDays);
        const bookingWithMap = { ...booking, mapUrl: mapUrl || booking.mapUrl };

        const blob = await pdf(
          <ItineraryPDF
            tour={tour}
            booking={bookingWithMap}
            companyInfo={KEMERYA_COMPANY_INFO}
            translatedData={translatedData}
            languageCode={languageCode}
          />
        ).toBlob();

        objectUrl = URL.createObjectURL(blob);
        setPdfUrl(objectUrl);
      } catch (err) {
        console.error("PDF preview generation error:", err);
        setError(err instanceof Error ? err.message : "Failed to generate PDF preview");
      } finally {
        setIsGenerating(false);
      }
    };

    generatePDF();

    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      setPdfUrl(null);
      setError(null);
    };
  }, [open, booking, tour, translatedData, languageCode]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl p-0 overflow-hidden">
        <div className="flex flex-col h-[80vh]">
          <div className="flex items-center justify-between border-b border-slate-200 p-4 bg-white">
            <div className="flex items-center gap-3">
              <svg className="h-5 w-5 text-[#C9A962]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zM6 20V4h7v5h5v11H6z" />
              </svg>
              <h2 className="text-lg font-semibold text-slate-900">
                PDF Preview
                {languageCode && <span className="ml-2 text-sm font-normal text-slate-500">({languageCode})</span>}
              </h2>
            </div>
            <button onClick={() => onOpenChange(false)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex-1 bg-slate-100">
            {translationError && (
              <div className="p-4 text-red-600 text-sm">
                {translationError}
              </div>
            )}
            {isGenerating ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-[#C9A962] border-t-transparent" />
                  <p className="mt-4 text-sm text-slate-600">Generating PDF preview...</p>
                </div>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center max-w-sm p-6">
                  <svg className="h-16 w-16 mx-auto text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <p className="mt-4 text-sm text-red-600">{error}</p>
                  <button onClick={() => onOpenChange(false)} className="mt-4 px-4 py-2 text-sm font-medium text-white bg-[#C9A962] rounded-lg hover:bg-[#b89555]">Close</button>
                </div>
              </div>
            ) : pdfUrl ? (
              <iframe title="PDF Preview" className="w-full h-full bg-white" src={pdfUrl} />
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-sm text-slate-500">No PDF to display</p>
              </div>
            )}
          </div>

          <div className="border-t border-slate-200 p-3 bg-white">
            <p className="text-xs text-slate-500 text-center">
              {languageCode ? "PDF translated to " + languageCode + ". Click Download to save." : "Click Download PDF to save the full-quality document."}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

