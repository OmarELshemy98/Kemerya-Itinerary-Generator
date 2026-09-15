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

/* ────────────────────────────────────────────────────────────────────────────
 * Terms & Privacy content — single source of truth shared by the PDF and the
 * translation payload so these sections are translated like everything else.
 * ──────────────────────────────────────────────────────────────────────────── */

export const TERMS_URL = "https://www.kemeryatours.com/page/terms-and-conditions";
export const PRIVACY_URL = "https://www.kemeryatours.com/page/privacy-policy";

export const DEFAULT_PRIVACY_ITEMS: string[] = [
  "Who We Are: Kemerya Tours is an Egyptian travel company providing tours, accommodation, transfers, guiding services and Nile cruises.",
  "Information We Collect: Name, nationality, email, phone / WhatsApp, country of residence, travel dates, destinations, accommodation preferences, and passport details only when required for bookings or permits.",
  "Children's Privacy: We never collect children's data directly — any required details must be provided by a parent or legal guardian.",
  "How We Use Your Data: Strictly to prepare itineraries and quotations, manage bookings, process secure payments, communicate before / during / after your trip, and comply with Egyptian legal requirements.",
  "Sharing: We never sell your data. Details are shared only with trusted partners (hotels, cruises, airlines, guides) to fulfil your booking.",
  "Cookies & Marketing: Essential cookies keep the website running and help us understand visits. Marketing messages are sent only with your consent — you can opt out anytime.",
  "Data Retention & Your Rights: Data is kept only as long as needed for your trip, accounting or legal duties, then securely deleted. You may request access, correction or deletion via info@kemeryatours.com (subject: Privacy Request — Kemerya Tours).",
];

export const DEFAULT_TERMS_ITEMS: string[] = [
  "Booking Confirmation: A booking is locked in only when Kemerya Tours confirms availability in writing, the required deposit is paid, and the official Booking Confirmation is issued. The lead traveler accepts these terms for every person included in the reservation.",
  "Deposits & Balance: A non-refundable deposit equal to 35% of the total trip cost is required upon booking confirmation. The remaining 65% balance must be paid upon arrival.",
  "Pricing & Fees: Quotes are issued in USD or EUR. Bank conversion rates and card processing fees are the traveler's responsibility. If government agencies increase monument ticket fees, taxes, port fees, or fuel surcharges before the trip, the total will be updated to cover those mandatory charges.",
  "Services & Suppliers: Certain travel components are provided by independent third-party suppliers (hotels, airlines, cruise operators, carriers, and site authorities). Services included are strictly those detailed in the confirmed quotation and itinerary.",
  "Cancellations & Changes: Most bookings can be changed or canceled depending on the airline, hotel, or service provider's policy. Deposits are non-refundable; cancellation fees follow the confirmed booking terms.",
  "Liability: Kemerya Tours' maximum financial liability for any dispute, injury, damage, or expense connected to the trip never exceeds the total amount paid for the specific booking. Indirect or consequential damages are excluded.",
  "In-Trip Complaints: Report any issue to your guide or local representative immediately so it can be fixed on the spot; otherwise send a detailed email complaint within 15 days of finishing the trip.",
  "Emergency & Governing Law: A 24/7 emergency line is printed on the confirmation voucher. Egyptian law governs these booking terms.",
];

function safeParseStringList(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed
          .filter((v): v is string => typeof v === "string")
          .map((v) => v.trim())
          .filter(Boolean)
      : [];
  } catch {
    return [];
  }
}

/** Resolves the effective Terms items: booking overrides → saved settings → defaults. */
export function getTermsItems(booking?: BookingConfig): string[] {
  if (booking?.customTerms && booking.customTerms.length > 0) {
    return booking.customTerms;
  }
  if (typeof window !== "undefined") {
    const stored = safeParseStringList(localStorage.getItem("kemerya_terms"));
    if (stored.length > 0) return stored;
  }
  return DEFAULT_TERMS_ITEMS;
}

/** Resolves the effective Privacy items: booking overrides → saved settings → defaults. */
export function getPrivacyItems(booking?: BookingConfig): string[] {
  const custom = booking?.customPrivacy?.filter((t) => t && t.trim().length > 0);
  if (custom && custom.length > 0) return custom.filter(Boolean);
  if (typeof window !== "undefined") {
    const stored = safeParseStringList(localStorage.getItem("kemerya_privacy"));
    if (stored.length > 0) return stored;
  }
  return DEFAULT_PRIVACY_ITEMS;
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
    "section.pricingGlance": "Pricing at a Glance",
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
    "day.day": "Day",

    // Pricing labels
    "pricing.description": "Description",
    "pricing.amount": "Amount",
    "pricing.tourPackage": "Tour Package",
    "pricing.adults": "Adults",
    "pricing.children": "Children",
    "pricing.infants": "Infants",
    "pricing.totalAmountDue": "Total Amount Due",
    // PRICING AT A GLANCE — financial breakdown table (PDF page 1)
    "pricing.packageTotal": "Package Total",
    "pricing.perPerson": "Price Per Person",
    "pricing.perPersonUnit": "per person",
    "pricing.bookingDeposit": "35% Booking Deposit",
    "pricing.remainingBalance": "Remaining 65%",

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
    "terms.readFull": "Read the full terms on our website:",
    "privacy.readFull": "Read the full privacy policy:",

    // Notes labels
    "notes.title": "Itinerary Notes",
    "notes.specialRequests": "Special Requests",

    // Review labels
    "review.title": "Leave a Review",
    "review.subtitle": "Loved your tour? Your feedback on Google Business helps travelers like you find us.",
    "review.cta": "Write a Review",

    // Payment terms (5 bullets)
    "terms.payment.1": "A 30% non-refundable deposit is required to confirm the booking.",
    "terms.payment.2": "The remaining balance must be paid no later than 14 days prior to departure.",
    "terms.payment.3": "Accepted payment methods: Bank transfer, credit/debit card, or cash at our office.",
    "terms.payment.4": "Cancellations received 30+ days before departure: Deposit retained. 14–29 days: 50% of total due. Less than 14 days: No refund.",
    "terms.payment.5": "{companyName} reserves the right to modify the itinerary due to local conditions, safety, or force majeure.",

    // Footer labels
    "footer.tagline": "Curated Egyptian Journeys · Est. Luxury",

    // Social link names
    "social.facebook": "Facebook",
    "social.instagram": "Instagram",
    "social.youtube": "YouTube",
    "social.twitter": "X (Twitter)",
    "social.googleBusiness": "Google Business",

    // Fallback empty state strings
    "fallback.inclusions": "Customized inclusions to be confirmed by Operations team.",
    "fallback.exclusions": "Standard exclusion terms apply.",

    // Extra hardcoded strings now routed through label() so they never stay
    // in English — every one of these is wrapped in {label(key, fallback)}
    // in itinerary-pdf.tsx, so adding them here guarantees 100% coverage.
    "hero.bookingRef": "Booking Reference",
    "hero.refLabel": "Ref",
    "hero.dayNight": "Days / Nights",
    "general.days": "Days",
    "general.nights": "Nights",
    "general.guest": "Guest",
    "general.guests": "Guests",
    "general.adult": "Adult",
    "general.adults": "Adults",
    "general.child": "Child",
    "general.children": "Children",
    "general.infant": "Infant",
    "general.infants": "Infants",
    "general.off": "OFF",
    "offer.special": "Special Offer",
    "offer.save": "Save",
    "offer.youSave": "You save",
    "overview.duration": "Duration",
    "overview.location": "Location",
    "overview.group": "Group",
    "overview.language": "Language",
    "pricing.extraRequest": "Extra Request",
    "footer.page": "Page",
    "footer.whatsapp": "WhatsApp",

    // FIX #3 (protocol aliases): the SAME four headline labels keyed by their
    // exact on-page text, so Gemini output maps dynamically in the JSX via
    // translatedData?.ui?.terms || "TERMS & CONDITIONS" style lookups.
    "BOOKING SUMMARY": "Booking Summary",
    "WHAT'S INCLUDED": "What's Included",
    "TERMS & CONDITIONS": "Terms & Conditions",
    "YOUR EXCLUSIVE TRAVEL ITINERARY": "Your Exclusive Travel Itinerary",
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
    if (tour.overview && tour.overview.length > 0) {
      data["tour.overview"] = tour.overview;
    }
  }

  // Terms & Privacy — INCLUDED in the payload so Gemini translates these
  // sections like every other value (previously they were hardcoded English
  // in the PDF and bypassed translation entirely).
  data["terms.items"] = getTermsItems(booking);
  data["privacy.items"] = getPrivacyItems(booking);

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
    // Use dayRoute if available (newer field name), otherwise empty
    "day.transport": day.dayRoute?.join(", ") || "",
  }));

  // Inclusions and exclusions — send the ACTUAL items rendered in the PDF
  // (booking overrides, then custom tour lists, then the tour's own lists)
  // so Gemini translates the real strings instead of generic placeholders.
  const realInclusions =
    booking.inclusions && booking.inclusions.length > 0
      ? booking.inclusions
      : booking.isCustomTour && booking.customInclusions && booking.customInclusions.length > 0
        ? booking.customInclusions
        : tour?.inclusions && tour.inclusions.length > 0
          ? tour.inclusions
          : [];
  const realExclusions =
    booking.exclusions && booking.exclusions.length > 0
      ? booking.exclusions
      : booking.isCustomTour && booking.customExclusions && booking.customExclusions.length > 0
        ? booking.customExclusions
        : tour?.exclusions && tour.exclusions.length > 0
          ? tour.exclusions
          : [];
  data["inclusions"] = realInclusions.length > 0 ? realInclusions : ["Customized inclusions to be confirmed by Operations team."];
  data["exclusions"] = realExclusions.length > 0 ? realExclusions : ["Standard exclusion terms apply."];

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
 * Get a translated STRING ARRAY from the payload, falling back to the
 * original English array when no translation is available.
 */
export function getTranslatedArray(
  translatedData: Record<string, unknown> | undefined,
  key: string,
  fallback: string[]
): string[] {
  if (!translatedData) return fallback;
  const raw = translatedData[key];
  if (!Array.isArray(raw)) return fallback;
  const strings = raw
    .filter((v): v is string => typeof v === "string" && v.trim().length > 0)
    .map((v) => v.trim());
  return strings.length > 0 ? strings : fallback;
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
