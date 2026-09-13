import type { Tour, BookingConfig, CompanyInfo, ItineraryDay } from "@/types";
import { getLanguageNativeName } from "./languages";

/**
 * Translation client for the Universal Multi-Language PDF system
 */

export interface TranslationRequest {
  targetLanguage: string;
  itineraryData: Record<string, unknown>;
  staticLabels: Record<string, string>;
  languageCode: string;
}

export interface TranslationResponse {
  success: boolean;
  translatedData?: Record<string, unknown>;
  languageCode?: string;
  targetLanguage?: string;
  error?: string;
}

/**
 * Get static labels that need translation
 */
export function getStaticLabels(): Record<string, string> {
  return {
    "tour.title": "Tour Title",
    "tour.description": "Tour Description",
    "tour.inclusions": "What's Included",
    "tour.exclusions": "What's Not Included",
    "section.overview": "Tour Overview",
    "section.summary": "Booking Summary",
    "section.roadmap": "Day-by-Day Itinerary",
    "section.inclusions": "Inclusions",
    "section.exclusions": "Exclusions",
    "section.pricing": "Pricing Details",
    "section.terms": "Terms & Conditions",
    "section.contact": "Contact Information",
    "general.thankYou": "Thank You",
    "general.safeTravels": "Safe Travels",
    "general.operationsTeam": "Operations Team",
    "general.support": "Support",
    "general.247": "24/7 Support",
    "general.privacyPolicy": "Privacy Policy",

    // Hero stat labels
    "hero.subtitle": "Your Exclusive Travel Itinerary",
    "hero.departureDate": "Departure Date",
    "hero.returnDate": "Return Date",
    "hero.duration": "Duration",
    "hero.travelers": "Travelers",
    "hero.totalPrice": "Total Price",
    "hero.reference": "Reference",

    // Booking summary labels
    "summary.totalTravelers": "Total Travelers",
    "summary.tourDuration": "Tour Duration",
    "summary.travelPeriod": "Travel Period",
    "summary.totalAmount": "Total Amount",
    "summary.clientName": "Client Name",
    "summary.clientEmail": "Client Email",
    "summary.clientPhone": "Client Phone",
    "summary.clientWhatsapp": "Client WhatsApp",
    "summary.meetingPoint": "Meeting Point",
    "summary.airportArrival": "Airport Arrival / Tour Start",
    "summary.pickupTime": "Pickup Time",

    // Day card labels
    "day.roadmap": "Today's Roadmap",
    "day.stay": "Stay",
    "day.meals": "Meals",

    // Pricing labels
    "pricing.description": "Description",
    "pricing.amount": "Amount",
    "pricing.tourPackage": "Tour Package",
    "pricing.adults": "Adults",
    "pricing.children": "Children",
    "pricing.infants": "Infants",
    "pricing.totalAmountDue": "Total Amount Due",

    // Operations labels
    "ops.roundClock": "Your Operations Team \u2014 Available Round the Clock",
    "ops.manager": "Operations Manager",
    "ops.directMobile": "Direct Mobile",
    "ops.email": "Operations Email",
    "ops.whatsapp": "WhatsApp Hotline",
    "ops.headOffice": "Head Office",
    "ops.companyEmail": "Company Email",
    "ops.website": "Website",
    "ops.address": "Office Address",

    // Terms / policy labels
    "terms.policy": "Terms & Policy",

    // Review labels
    "review.title": "Leave a Review",
    "review.subtitle": "Loved your tour? Your feedback on Google Business helps travelers like you find us.",
  };
}

/**
 * Transform BookingConfig and Tour data into a flat structure for translation
 */
export function transformItineraryData(
  tour: Tour | null,
  booking: BookingConfig,
  companyInfo: CompanyInfo
): Record<string, unknown> {
  const data: Record<string, unknown> = {};

  // Tour information
  if (tour) {
    data["tour.title"] = tour.title;
    data["tour.shortDescription"] = tour.shortDescription || "";
    data["tour.longDescription"] = tour.longDescription || "";
  }

  // Booking information
  data["booking.clientName"] = booking.clientName || "";
  data["booking.clientEmail"] = booking.clientEmail || "";
  data["booking.clientPhone"] = booking.clientPhone || "";
  data["booking.travelers.adults"] = booking.travelers.adults;
  data["booking.travelers.children"] = booking.travelers.children;
  data["booking.travelers.infants"] = booking.travelers.infants;
  data["booking.totalPrice"] = booking.totalPrice;
  data["booking.currency"] = booking.currency;
  // startDate and endDate are already ISO strings - use them directly
  data["booking.startDate"] = booking.startDate;
  data["booking.endDate"] = booking.endDate;
  data["booking.bookingReference"] = booking.id.replace(/^bk-/, "").toUpperCase();
  data["booking.isCustomTour"] = booking.isCustomTour;
  data["booking.customTourTitle"] = booking.customTourTitle || "";

  // Company information
  data["company.name"] = companyInfo.name;
  data["company.address"] = companyInfo.address || "";
  data["company.phone"] = companyInfo.operationsManager?.phone || "";
  data["company.email"] = companyInfo.operationsManager?.email || "";
  data["company.website"] = companyInfo.website || "";

  // Itinerary days - use available fields from ItineraryDay type
  const days = booking.isCustomTour
    ? booking.customItinerary || []
    : tour?.itinerary || [];
  data["itinerary.days"] = days.map((day: ItineraryDay, index: number) => ({
    "day.day": index + 1,
    "day.title": day.title,
    "day.description": day.description,
    "day.accommodation": day.accommodation || "",
    "day.meals": day.meals ? day.meals.join(", ") : "",
    // Use dayRoute if available (newer field name), otherwise empty
    "day.transport": day.dayRoute?.join(", ") || "",
  }));

  // Inclusions and exclusions
  data["inclusions"] = [
    "All transfers in private vehicles",
    "Accommodation in hotels",
    "Full board meals",
    "Professional tour guide",
    "All entrance fees",
    "All taxes and services",
  ];
  data["exclusions"] = [
    "International airfare",
    "Visa fees",
    "Travel insurance",
    "Personal expenses",
    "Tips and gratuities",
    "Optional activities",
  ];

  return data;
}

/**
 * Translate itinerary data to the target language using Gemini API
 */
export async function translateItineraryData(
  targetLanguage: string,
  tour: Tour | null,
  booking: BookingConfig,
  companyInfo: CompanyInfo
): Promise<TranslationResponse> {
  const staticLabels = getStaticLabels();
  const itineraryData = transformItineraryData(tour, booking, companyInfo);

  try {
    const response = await fetch("/api/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        targetLanguage,
        itineraryData,
        staticLabels,
        languageCode: targetLanguage,
      }),
    });

    const data = await response.json();
    if (!response.ok || !data.success) {
      console.error("Detailed API Error:", data);
      return {
        success: false,
        error: data.error || data.details || `HTTP ${response.status}: Translation failed`,
      };
    }

    return data;
  } catch (error) {
    console.error("Translation error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Translation request failed",
    };
  }
}

/**
 * Get translated value from translated data or fall back to original
 */
export function getTranslatedValue(
  translatedData: Record<string, unknown> | undefined,
  key: string,
  fallback: string
): string {
  if (!translatedData) return fallback;

  // Try direct key match
  if (translatedData[key] !== undefined) {
    return String(translatedData[key]);
  }

  // Try nested path
  const parts = key.split(".");
  let value: unknown = translatedData;
  for (const part of parts) {
    if (value && typeof value === "object" && part in value) {
      value = (value as Record<string, unknown>)[part];
    } else {
      return fallback;
    }
  }

  return value !== undefined ? String(value) : fallback;
}

/**
 * Human-readable language name
 */
export function getLanguageDisplayName(code: string): string {
  return getLanguageNativeName(code) || code;
}
