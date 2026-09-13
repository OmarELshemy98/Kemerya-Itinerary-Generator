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
}

/**
 * Build a WhatsApp greeting message for a booking
 */
export function buildWhatsAppMessage(
  booking: BookingConfig,
  tour: Tour | null,
  companyInfo: {
    name: string;
    phone: string;
    website: string;
  },
  fileName: string
): string {
  const tourName = booking.isCustomTour
    ? booking.customTourTitle || "Custom Tour"
    : tour?.title || "Kemerya Tour";

  const dates = `${booking.startDate.replace("T", " ")} → ${booking.endDate.replace("T", " ")}`;

  return `🎉 *${companyInfo.name} - Your Itinerary is Ready!*\n\n` +
    `Dear ${booking.clientName || "Guest"},\n\n` +
    `Your exclusive travel itinerary "${tourName}" has been prepared.\n\n` +
    `📅 *Dates:* ${dates}\n` +
    `👥 *Travelers:* ${booking.travelers.adults} adult(s)${booking.travelers.children ? `, ${booking.travelers.children} child(ren)` : ""}${booking.travelers.infants ? `, ${booking.travelers.infants} infant(s)` : ""}\n` +
    `💰 *Total:* ${booking.currency} ${booking.totalPrice.toLocaleString()}\n\n` +
    `📎 Attached: ${fileName}\n\n` +
    `For any questions, contact us:\n` +
    `📞 ${companyInfo.phone}\n` +
    `🌐 ${companyInfo.website}\n\n` +
    `${companyInfo.name} Team`;
}

/**
 * PDFPreviewDialog - Displays a preview of the generated PDF in a dialog
 */
export function PDFPreviewDialog({
  open,
  onOpenChange,
  tour,
  booking,
  translatedData,
  languageCode,
}: PDFPreviewDialogProps) {
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const dialogRef = React.useRef<HTMLDialogElement>(null);

  // Generate PDF when dialog opens
  React.useEffect(() => {
    if (!open || !booking) return;

    const generatePDF = async () => {
      setIsGenerating(true);
      setError(null);

      try {
        const itineraryDays = booking.isCustomTour
          ? booking.customItinerary || []
          : tour?.itinerary || [];

        const mapUrl = await generateDynamicMap(itineraryDays);
        const bookingWithMap = { ...booking, mapUrl: mapUrl || booking.mapUrl };

        // Generate PDF blob
        await pdf(
          <ItineraryPDF
            tour={tour}
            booking={bookingWithMap}
            companyInfo={KEMERYA_COMPANY_INFO}
            translatedData={translatedData}
            languageCode={languageCode}
          />
        ).toBlob();
      } catch (err) {
        console.error("PDF preview generation error:", err);
        setError(
          err instanceof Error ? err.message : "Failed to generate PDF preview"
        );
      } finally {
        setIsGenerating(false);
      }
    };

    generatePDF();

    // Reset state when dialog closes
    return () => {
      setError(null);
      setIsGenerating(false);
    };
  }, [open, booking, tour, translatedData, languageCode]);

  // Handle escape key and outside click
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        onOpenChange(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onOpenChange]);

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      aria-describedby="pdf-preview-description"
    >
      <DialogContent className="sm:max-w-2xl p-0 overflow-hidden">
        <div className="flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-200 p-4 bg-white">
            <div className="flex items-center gap-3">
              <svg
                className="h-5 w-5 text-[#C9A962]"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zM6 20V4h7v5h5v11H6z" />
              </svg>
              <h2 className="text-lg font-semibold text-slate-900">
                PDF Preview
              </h2>
            </div>
            <button
              onClick={() => onOpenChange(false)}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors"
              aria-label="Close dialog"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 bg-slate-50">
            {isGenerating ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-[#C9A962] border-t-transparent" />
                  <p className="mt-3 text-sm text-slate-600">
                    Generating PDF preview...
                  </p>
                </div>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center max-w-sm">
                  <svg
                    className="h-12 w-12 mx-auto text-red-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                  <p className="mt-3 text-sm text-red-600">{error}</p>
                  <button
                    onClick={() => window.location.reload()}
                    className="mt-4 px-4 py-2 text-sm font-medium text-white bg-[#C9A962] rounded-lg hover:bg-[#b89555] transition-colors"
                  >
                    Retry
                  </button>
                </div>
              </div>
            ) : (
              <iframe
                title="PDF Preview"
                className="w-full h-[600px] bg-white"
                src="about:blank"
                aria-label="PDF document preview"
              />
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-slate-200 p-4 bg-white">
            <p id="pdf-preview-description" className="text-xs text-slate-500 text-center">
              This is a preview of your itinerary PDF. Click the download button
              in the dashboard to save the full-quality PDF.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}