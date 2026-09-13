const fs = require('fs');
const path = 'd:/Kemerya-Itinerary-Generator/src/components/pdf/pdf-preview-dialog.tsx';

const part1 = `"use client";

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
  return "🎉 *" + companyInfo.name + " - Your Itinerary is Ready!*\\n\\n" +
    "Dear " + (booking.clientName || "Guest") + ",\\n\\n" +
    "Your exclusive travel itinerary \\"" + tourName + "\\" has been prepared.\\n\\n" +
    "📅 *Dates:* " + dates + "\\n" +
    "👥 *Travelers:* " + booking.travelers.adults + " adult(s)" +
    (booking.travelers.children ? ", " + booking.travelers.children + " child(ren)" : "") +
    (booking.travelers.infants ? ", " + booking.travelers.infants + " infant(s)" : "") + "\\n" +
    "💰 *Total:* " + booking.currency + " " + booking.totalPrice.toLocaleString() + "\\n\\n" +
    "📎 Attached: " + fileName + "\\n\\n" +
    "For any questions, contact us:\\n" +
    "📞 " + companyInfo.phone + "\\n" +
    "🌐 " + companyInfo.website + "\\n\\n" +
    companyInfo.name + " Team";
}

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

`;

fs.writeFileSync(path, part1, 'utf8');
console.log('Part 1 written');
