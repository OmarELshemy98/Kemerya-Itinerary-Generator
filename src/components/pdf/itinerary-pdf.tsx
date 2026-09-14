"use client";

import React from "react";
import { Document, Page, View, Text, Font, Image } from "@react-pdf/renderer";
import type { Tour, BookingConfig, CompanyInfo, ItineraryDay } from "@/types";
import { KEMERYA_COMPANY_INFO } from "@/data/company";
import { calculateNights } from "@/lib/utils";
import { isRTL, getGlobalFont, isLatinDisplayLanguage } from "@/lib/pdf-fonts";
import { getTranslatedValue, getTranslatedArray, getTermsItems, getPrivacyItems } from "@/lib/translate-client";
import { shapeForPdf } from "@/lib/arabic-shaper";

import { S } from "./pdf-styles";
import { hasText } from "./pdf-primitives";

import { BookingReference } from "./sections/BookingReference";
import { BookingSummary } from "./sections/BookingSummary";
import { SpecialOffer } from "./sections/SpecialOffer";
import { TourDescription } from "./sections/TourDescription";
import { DayByDayItinerary } from "./sections/DayByDayItinerary";
import { OptionalTours } from "./sections/OptionalTours";
import { ExtraServices } from "./sections/ExtraServices";
import { InclusionsExclusions } from "./sections/InclusionsExclusions";
import { TermsAndPrivacy } from "./sections/TermsAndPrivacy";
import { AgentSignature } from "./sections/AgentSignature";
import { CompanyDetails } from "./sections/CompanyDetails";

export interface ItineraryPDFProps {
  tour: Tour | null;
  booking: BookingConfig;
  companyInfo?: CompanyInfo;
  translatedData?: Record<string, unknown>;
  languageCode?: string;
}

Font.registerHyphenationCallback((word) => [word]);

function label(data: Record<string, unknown> | undefined, key: string, fb: string): string {
  const t = getTranslatedValue(data, key, fb);
  return hasText(t) ? t : fb;
}

export default function ItineraryPDF({ tour, booking, companyInfo, translatedData, languageCode = "en" }: ItineraryPDFProps) {
  const rtl = isRTL(languageCode);
  const bodyFont = getGlobalFont(languageCode);
  const latinDisplay = isLatinDisplayLanguage(languageCode);
  const cinzelFont = latinDisplay ? "Cinzel Decorative" : bodyFont;
  const cinzelStyle: Record<string, string> = { fontFamily: cinzelFont };
  const headingStyle: Record<string, string> = { fontFamily: cinzelFont };
  const c = companyInfo || KEMERYA_COMPANY_INFO;

  const tourTitle = booking.isCustomTour ? booking.customTourTitle || "Custom Private Tour" : tour?.title || "Kemerya Tours";
  const nights = calculateNights(new Date(booking.startDate), new Date(booking.endDate));
  const daysCount = nights + 1;

  const travelerParts: string[] = [];
  if (booking.travelers.adults > 0) travelerParts.push(`${booking.travelers.adults} ${label(translatedData, booking.travelers.adults > 1 ? "general.adults" : "general.adult", booking.travelers.adults > 1 ? "Adults" : "Adult")}`);
  if (booking.travelers.children > 0) travelerParts.push(`${booking.travelers.children} ${label(translatedData, booking.travelers.children > 1 ? "general.children" : "general.child", booking.travelers.children > 1 ? "Children" : "Child")}`);
  if (booking.travelers.infants > 0) travelerParts.push(`${booking.travelers.infants} ${label(translatedData, booking.travelers.infants > 1 ? "general.infants" : "general.infant", booking.travelers.infants > 1 ? "Infants" : "Infant")}`);
  const travelersText = travelerParts.join(", ");

  const tourDescription = booking.isCustomTour
    ? booking.customTourDescription || tourTitle
    : tour?.overview?.length ? tour.overview.join(" ") : tour?.longDescription || tour?.shortDescription || tourTitle;

  const tourMeta: Array<{ label: string; value: string }> = [];
  if (tour?.durationLabel) tourMeta.push({ label: label(translatedData, "overview.duration", "Duration"), value: tour.durationLabel });
  if (tour?.location) tourMeta.push({ label: label(translatedData, "overview.location", "Location"), value: tour.location });
  if (tour?.group) tourMeta.push({ label: label(translatedData, "overview.group", "Group"), value: tour.group });
  if (tour?.language) tourMeta.push({ label: label(translatedData, "overview.language", "Language"), value: tour.language });

  const itinerary: ItineraryDay[] = booking.isCustomTour && booking.customItinerary?.length ? booking.customItinerary : tour?.itinerary ?? [];
  const fallbackDay: ItineraryDay | null = itinerary.length === 0 ? { day: 1, title: "Custom Arranged Itinerary", description: "This is a fully customized tour. Your dedicated Operations Manager will design each day according to your preferences." } : null;

  const translatedDays: Array<Record<string, unknown>> = Array.isArray(translatedData?.["itinerary.days"]) ? translatedData["itinerary.days"] as Array<Record<string, unknown>> : [];
  const dayField = (idx: number, field: string): string | undefined => {
    const day = translatedDays[idx];
    if (!day) return undefined;
    const value = day[field];
    return hasText(value) ? (value as string) : undefined;
  };

  const inclusions = booking.inclusions?.length ? booking.inclusions : booking.isCustomTour && booking.customInclusions?.length ? booking.customInclusions : tour?.inclusions ?? [];
  const exclusions = booking.exclusions?.length ? booking.exclusions : booking.isCustomTour && booking.customExclusions?.length ? booking.customExclusions : tour?.exclusions ?? [];

  const termsItems = getTranslatedArray(translatedData, "terms.items", getTermsItems(booking)).map(shapeForPdf).filter(hasText);
  const privacyItems = getTranslatedArray(translatedData, "privacy.items", getPrivacyItems(booking)).map(shapeForPdf).filter(hasText);
  const optionalTours: Array<{ title: string; description?: string; price: number }> = [];

  let sectionCounter = 0;
  const nextSectionNumber = (): string => String(++sectionCounter).padStart(2, "0");
  const ctx = { S, label: (k: string, fb: string) => label(translatedData, k, fb), headingStyle, cinzelStyle };
  return (
    <Document title={`${tourTitle} - Kemerya Tours Itinerary`} author="Kemerya Tours" creator="Kemerya Tours Dashboard">
      <Page size="A4" style={[S.page, { direction: rtl ? "rtl" : "ltr", fontFamily: bodyFont }]} wrap>
        <View style={[S.contentLayer, { fontFamily: bodyFont, direction: rtl ? "rtl" : "ltr" }]}>
          <View style={S.headerBox} fixed>
            <Image src="/logo-kemerya.png" style={S.headerLogo} />
            <View style={S.headerText}>
              <Text style={[S.brandTitle, { fontFamily: cinzelFont }]}>{c.name || "KEMERYA TOURS"}</Text>
              {hasText(c.tagline) && <Text style={S.brandTagline}>{shapeForPdf(c.tagline)}</Text>}
            </View>
          </View>

          <BookingReference S={S} label={(k, fb) => label(translatedData, k, fb)} bookingRef={booking.id} cinzelStyle={cinzelStyle} />
          <BookingSummary ctx={ctx} booking={booking} daysCount={daysCount} nights={nights} travelersText={travelersText} sectionNumber={nextSectionNumber()} />
          <SpecialOffer ctx={ctx} booking={booking} sectionNumber={nextSectionNumber()} />
          <TourDescription ctx={ctx} tourTitle={label(translatedData, "tour.title", tourTitle)} description={shapeForPdf(tourDescription)} meta={tourMeta} sectionNumber={nextSectionNumber()} />
          <DayByDayItinerary ctx={ctx} itinerary={itinerary} dayField={dayField} sectionNumber={nextSectionNumber()} fallbackDay={fallbackDay} />
          <OptionalTours ctx={ctx} items={optionalTours} sectionNumber={nextSectionNumber()} />
          <ExtraServices ctx={ctx} notes={booking.notes || ""} specialRequests={booking.specialRequests || ""} specialRequestItems={booking.specialRequestItems} currency={booking.currency} sectionNumber={nextSectionNumber()} />
          <InclusionsExclusions ctx={ctx} inclusions={inclusions} exclusions={exclusions} sectionNumber={nextSectionNumber()} />
          <TermsAndPrivacy ctx={ctx} termsItems={termsItems} privacyItems={privacyItems} sectionNumber={nextSectionNumber()} />
          <AgentSignature ctx={ctx} companyInfo={c} sectionNumber={nextSectionNumber()} />
          <CompanyDetails ctx={ctx} companyInfo={c} sectionNumber={nextSectionNumber()} />
        </View>
      </Page>
    </Document>
  );
}