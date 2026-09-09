"use client";

import * as React from "react";
import { BlobProvider } from "@react-pdf/renderer";
import type { Tour, BookingConfig } from "@/types";
import { ItineraryPDF } from "./itinerary-pdf";
import { KEMERYA_COMPANY_INFO } from "@/data/company";

interface PDFDownloaderProps {
  booking: BookingConfig | null;
  tour: Tour | null;
  onDone?: () => void;
}

/**
 * Hidden helper that triggers the actual file download once the PDF blob
 * is ready. Extracted as its own component so the useEffect inside
 * BlobProvider's render prop is a real component hook.
 */
function TriggerDownload({
  blob,
  loading,
  fileName,
  onDone,
}: {
  blob: Blob | null;
  loading: boolean;
  fileName: string;
  onDone?: () => void;
}) {
  React.useEffect(() => {
    if (!blob || loading) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    // Give the browser a moment before revoking, then notify parent.
    setTimeout(() => URL.revokeObjectURL(url), 5000);
    onDone?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blob, loading, fileName]);

  return null;
}

/**
 * PDFDownloader — mounts an off-screen BlobProvider for the given booking
 * and automatically downloads the generated PDF. Used when the employee
 * clicks "Generate PDF Itinerary" (direct download, no preview dialog).
 */
export function PDFDownloader({ booking, tour, onDone }: PDFDownloaderProps) {
  if (!booking) return null;

  const bookingRef = booking.id.toUpperCase().replace(/-/g, "").slice(-8);
  const tourTitle = booking.isCustomTour
    ? booking.customTourTitle || "Custom-Tour"
    : tour?.title || "Kemerya-Tour";
  const safeName = tourTitle.replace(/[^a-z0-9\-_ ]/gi, "").trim().replace(/\s+/g, "-");
  const fileName = `Kemerya-Itinerary-${safeName}-${bookingRef}.pdf`;

  return (
    <div style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }} aria-hidden>
      <BlobProvider document={<ItineraryPDF tour={tour} booking={booking} />}>
        {({ blob, loading }) => (
          <TriggerDownload
            blob={blob}
            loading={loading}
            fileName={fileName}
            onDone={onDone}
          />
        )}
      </BlobProvider>
    </div>
  );
}
