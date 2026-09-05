"use client";

import * as React from "react";
import { BlobProvider } from "@react-pdf/renderer";
import {
  Download,
  Loader2,
  FileText,
  X,
  ExternalLink,
  MessageCircle,
  Copy,
  Check,
  Edit3,
} from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatDateShort, formatCurrency, cn } from "@/lib/utils";

interface PDFPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tour: Tour | null;
  booking: BookingConfig | null;
  companyInfo?: CompanyInfo;
}

function sanitizePhone(phone: string): string {
  return phone.replace(/[^\d]/g, "");
}

function buildWhatsAppMessage(
  booking: BookingConfig,
  tour: Tour | null,
  companyInfo: CompanyInfo,
  fileName: string
): string {
  const totalTravelers =
    booking.travelers.adults +
    booking.travelers.children +
    booking.travelers.infants;
  const tourTitle = booking.isCustomTour
    ? booking.customTourTitle || "Custom Tour"
    : tour?.title || "Kemerya Tours";
  const bookingRef = booking.id
    .toUpperCase()
    .replace(/-/g, "")
    .slice(-8);

  const travelersParts: string[] = [];
  if (booking.travelers.adults > 0)
    travelersParts.push(
      `${booking.travelers.adults} Adult${booking.travelers.adults > 1 ? "s" : ""}`
    );
  if (booking.travelers.children > 0)
    travelersParts.push(
      `${booking.travelers.children} Child${booking.travelers.children > 1 ? "ren" : ""}`
    );
  if (booking.travelers.infants > 0)
    travelersParts.push(
      `${booking.travelers.infants} Infant${booking.travelers.infants > 1 ? "s" : ""}`
    );

  const greeting = booking.clientName
    ? `Dear ${booking.clientName},`
    : "Dear Valued Guest,";

  const lines = [
    `${greeting} 👋`,
    "",
    `Greetings from *${companyInfo.name}*! ✨`,
    "",
    `Here are the details of your exclusive trip itinerary:`,
    "",
    `🏷️ *Booking Reference:* #${bookingRef}`,
    `📍 *Tour:* ${tourTitle}`,
    `📅 *Travel Dates:* ${formatDateShort(booking.startDate)} → ${formatDateShort(booking.endDate)}`,
    `⏳ *Duration:* ${booking.travelers.adults + booking.travelers.children + booking.travelers.infants > 0 ? Math.max(1, Math.ceil(Math.abs(new Date(booking.endDate).getTime() - new Date(booking.startDate).getTime()) / (1000 * 60 * 60 * 24))) + 1 : 1} Days / ${Math.max(0, Math.ceil(Math.abs(new Date(booking.endDate).getTime() - new Date(booking.startDate).getTime()) / (1000 * 60 * 60 * 24)))} Nights`,
    `👥 *Travelers:* ${totalTravelers} Guest${totalTravelers > 1 ? "s" : ""} (${travelersParts.join(", ")})`,
    `💰 *Total Price:* ${formatCurrency(booking.totalPrice, booking.currency)}`,
    "",
    `📄 The detailed itinerary PDF (${fileName}) is attached to this message for your review.`,
    "",
    `If you have any questions or need any adjustments, please don't hesitate to contact our 24/7 Operations Team:`,
    `📞 *${companyInfo.operationsManager.name} — ${companyInfo.operationsManager.phone}*`,
    `💬 WhatsApp: ${companyInfo.whatsapp}`,
    `📧 Email: ${companyInfo.operationsManager.email}`,
    "",
    `We look forward to welcoming you to Egypt! 🇪🇬🏛️`,
    "",
    `Warm regards,`,
    `*${companyInfo.name} Team*`,
    `${companyInfo.website}`,
  ];

  return lines.join("\n");
}

export function PDFPreviewDialog({
  open,
  onOpenChange,
  tour,
  booking,
  companyInfo = KEMERYA_COMPANY_INFO,
}: PDFPreviewDialogProps) {
  const [error, setError] = React.useState<string | null>(null);
  const [whatsappPhone, setWhatsappPhone] = React.useState<string>("");
  const [customPhone, setCustomPhone] = React.useState<string>("");
  const [showPhoneEditor, setShowPhoneEditor] = React.useState<boolean>(false);
  const [copied, setCopied] = React.useState<boolean>(false);

  React.useEffect(() => {
    if (open) {
      setError(null);
      setCopied(false);
      if (booking?.clientWhatsapp) {
        setWhatsappPhone(sanitizePhone(booking.clientWhatsapp));
        setCustomPhone(booking.clientWhatsapp);
      } else if (booking?.clientPhone) {
        setWhatsappPhone(sanitizePhone(booking.clientPhone));
        setCustomPhone(booking.clientPhone);
      } else {
        setWhatsappPhone("");
        setCustomPhone("");
      }
      setShowPhoneEditor(false);
    }
  }, [open, booking, tour]);

  const fileName = React.useMemo(() => {
    if (!booking) return "Kemerya-Itinerary.pdf";
    const base = (
      booking.customTourTitle ||
      tour?.title ||
      "Booking"
    )
      .replace(/[^a-zA-Z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 40);
    return `Kemerya-Itinerary-${base}-${booking.id.slice(-4).toUpperCase()}.pdf`;
  }, [booking, tour]);

  const totalTravelers = booking
    ? booking.travelers.adults +
      booking.travelers.children +
      booking.travelers.infants
    : 0;

  const whatsappMessage = React.useMemo(
    () => booking
      ? buildWhatsAppMessage(booking, tour, companyInfo, fileName)
      : "",
    [booking, tour, companyInfo, fileName]
  );

  if (!booking) return null;

  const finalPhone = sanitizePhone(customPhone || whatsappPhone);
  const canSendWhatsApp = finalPhone.length >= 10;

  const whatsappUrl = `https://wa.me/${finalPhone}?text=${encodeURIComponent(whatsappMessage)}`;

  const handleSendWhatsApp = () => {
    if (!canSendWhatsApp) return;
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  };

  const handleCopyMessage = async () => {
    try {
      await navigator.clipboard.writeText(whatsappMessage);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // ignore
    }
  };

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
                  Preview, download, and send the itinerary to your client via
                  WhatsApp. File:{" "}
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
                {formatDateShort(booking.startDate)} →{" "}
                {formatDateShort(booking.endDate)}
              </Badge>
              <Badge variant="emerald" className="rounded-full">
                {formatCurrency(booking.totalPrice, booking.currency)}
              </Badge>
            </div>
          </div>

          {/* WhatsApp Configuration */}
          <div className="mt-4 flex flex-col gap-3 rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500 text-white">
                  <MessageCircle className="h-4 w-4" />
                </div>
                <div>
                  <Label className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                    Send via WhatsApp to Client
                  </Label>
                  <p className="text-[11px] text-emerald-700/80">
                    Opens WhatsApp Web/App with pre-composed message. After
                    opening, manually attach the downloaded PDF file ({fileName}
                    ) before sending.
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
                <div className="relative flex-1">
                  <Label className="mb-1 block text-[11px] font-semibold text-emerald-900">
                    Client WhatsApp Number
                  </Label>
                  {showPhoneEditor ? (
                    <div className="flex gap-2">
                      <Input
                        value={customPhone}
                        onChange={(e) => setCustomPhone(e.target.value)}
                        placeholder="+20 1xx xxx xxxx"
                        className="h-9 border-emerald-300 bg-white text-sm focus:border-emerald-500 focus:ring-emerald-500"
                      />
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="h-9 border-emerald-200 bg-white text-emerald-700 hover:bg-emerald-100"
                        onClick={() => setShowPhoneEditor(false)}
                      >
                        <Check className="h-3.5 w-3.5 mr-1" />
                        Save
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between gap-2 rounded-lg border border-emerald-300 bg-white px-3 py-2">
                      <span className="font-mono text-sm font-semibold text-emerald-900">
                        {customPhone || whatsappPhone || (
                          <span className="text-emerald-700/50">
                            No WhatsApp number set in booking
                          </span>
                        )}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-emerald-700 hover:bg-emerald-100"
                        onClick={() => setShowPhoneEditor(true)}
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    onClick={handleCopyMessage}
                    variant="outline"
                    size="sm"
                    className="h-9 shrink-0 border-slate-300 text-slate-700 hover:bg-slate-100"
                  >
                    {copied ? (
                      <>
                        <Check className="mr-1.5 h-4 w-4 text-emerald-600" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="mr-1.5 h-4 w-4" />
                        Copy Message
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    onClick={handleSendWhatsApp}
                    disabled={!canSendWhatsApp}
                    className={cn(
                      "h-9 shrink-0 text-white shadow-md transition-all",
                      canSendWhatsApp
                        ? "bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700"
                        : "bg-emerald-300 cursor-not-allowed"
                    )}
                    size="sm"
                  >
                    <MessageCircle className="mr-1.5 h-4 w-4" />
                    Open WhatsApp
                  </Button>
                </div>
              </div>
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
                        Rendering {booking.isCustomTour ? "custom" : "standard"}{" "}
                        tour layout with all sections
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
                <p className="text-xs text-slate-500 max-w-md">
                  💡 <span className="font-semibold text-emerald-700">Tip:</span>{" "}
                  Download the PDF first → Open WhatsApp with the green button
                  above → In the WhatsApp chat, click 📎 and attach the
                  downloaded PDF file to send alongside the pre-written
                  message.
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!url || loading}
                    onClick={() => {
                      if (url)
                        window.open(url, "_blank", "noopener,noreferrer");
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
