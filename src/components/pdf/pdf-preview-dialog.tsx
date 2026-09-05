"use client";

import * as React from "react";
import { BlobProvider } from "@react-pdf/renderer";
import { Download, Loader2, FileText, X, ExternalLink } from "lucide-react";
import type { Tour, BookingConfig, CompanyInfo } from "@/types";
import { ItineraryPDF } from "./itinerary-pdf";
import { KEMERYA_COMPANY_INFO } from "@/data/company";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDateShort, formatCurrency } from "@/lib/utils";

interface PDFPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tour: Tour | null;
  booking: BookingConfig | null;
  companyInfo?: CompanyInfo;
}

export function PDFPreviewDialog({
  open,
  onOpenChange,
  tour,
  booking,
  companyInfo = KEMERYA_COMPANY_INFO,
}: PDFPreviewDialogProps) {
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (open) setError(null);
  }, [open, booking, tour]);

  if (!booking) return null;

  const fileName = `Kemerya-Itinerary-${(booking.customTourTitle || tour?.title || "Booking")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40)}-${booking.id.slice(-4).toUpperCase()}.pdf`;

  const totalTravelers =
    booking.travelers.adults + booking.travelers.children + booking.travelers.infants;

  const pdfDocument = (
    <ItineraryPDF tour={tour} booking={booking} companyInfo={companyInfo} />
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[92vh] max-w-6xl flex-col gap-0 overflow-hidden p-0">
        <DialogHeader className="border-b border-slate-200 bg-gradient-to-r from-slate-50 via-white to-[#C9A962]/5 p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#C9A962]/15 text-[#C9A962]">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold text-slate-900">
                  Professional Itinerary PDF
                </DialogTitle>
                <DialogDescription className="mt-0.5 max-w-xl">
                  Preview and download the client itinerary. File name:{" "}
                  <span className="font-mono text-xs text-slate-600">
                    {fileName}
                  </span>
                </DialogDescription>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="rounded-full">
                {totalTravelers} Travelers
              </Badge>
              <Badge variant="gold" className="rounded-full">
                {formatDateShort(booking.startDate)} → {formatDateShort(booking.endDate)}
              </Badge>
              <Badge variant="emerald" className="rounded-full">
                {formatCurrency(booking.totalPrice, booking.currency)}
              </Badge>
            </div>
          </div>
        </DialogHeader>

        <BlobProvider document={pdfDocument}>
          {({ blob, url, loading }) => (
            <>
              {/* Preview Area */}
              <div className="relative flex-1 overflow-hidden bg-slate-100">
                {loading && !url ? (
                  <div className="flex h-full flex-col items-center justify-center gap-3 p-6">
                    <div className="relative">
                      <Loader2 className="h-12 w-12 animate-spin text-[#C9A962]" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-semibold text-slate-700">
                        Generating your PDF itinerary...
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        Rendering {booking.isCustomTour ? "custom" : "standard"} tour
                        layout with all sections
                      </p>
                    </div>
                  </div>
                ) : error ? (
                  <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
                      <X className="h-6 w-6" />
                    </div>
                    <p className="text-sm font-semibold text-red-700">
                      Failed to render PDF preview
                    </p>
                    <p className="max-w-md text-xs text-red-500">{error}</p>
                  </div>
                ) : !url && !blob ? (
                  <div className="flex h-full items-center justify-center p-6">
                    <p className="text-sm text-slate-500">PDF not available.</p>
                  </div>
                ) : (
                  <div className="h-full w-full bg-slate-200">
                    <iframe
                      title="Itinerary Preview"
                      src={url || undefined}
                      className="h-full w-full border-0 bg-white"
                      onError={() =>
                        setError(
                          "Browser failed to render PDF inline. Use the Download button to open externally."
                        )
                      }
                    />
                  </div>
                )}
              </div>

              {/* Footer Action Bar */}
              <div className="flex flex-col gap-3 border-t border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-slate-500">
                  Tip: Use the Download button to save the PDF locally, then email it to
                  your client. Preview is rendered at screen DPI; the downloaded PDF is
                  print-quality.
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!url || loading}
                    onClick={() => {
                      if (url) window.open(url, "_blank", "noopener,noreferrer");
                    }}
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Open in New Tab
                  </Button>
                  <Button
                    variant="gold"
                    size="sm"
                    disabled={!url || loading}
                    onClick={() => {
                      if (!url) return;
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = fileName;
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                    }}
                  >
                    {loading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Download className="mr-2 h-4 w-4" />
                    )}
                    {loading ? "Preparing..." : "Download PDF"}
                  </Button>
                </div>
              </div>
            </>
          )}
        </BlobProvider>
      </DialogContent>
    </Dialog>
  );
}
