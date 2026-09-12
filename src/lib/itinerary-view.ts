import type { BookingConfig, ItineraryDay } from "@/types";

/** Unknown JSON record coming from Supabase (booking_data / row). */
type UnknownRecord = Record<string, unknown>;

function asString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value : undefined;
}

function asStringArray(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const clean = value
    .filter((v): v is string => typeof v === "string")
    .map((v) => v.trim())
    .filter(Boolean);
  return clean.length > 0 ? clean : undefined;
}

function asNumber(value: unknown): number | undefined {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : undefined;
}

function asDayRoutes(value: unknown): BookingConfig["dayRoutes"] {
  if (!Array.isArray(value)) return undefined;
  const routes = value
    .filter((r): r is UnknownRecord => typeof r === "object" && r !== null)
    .map((r) => ({
      day: Number(r.day),
      stops: Array.isArray(r.stops)
        ? r.stops
            .filter((s): s is string => typeof s === "string")
            .map((s) => s.trim())
            .filter(Boolean)
        : [],
    }))
    .filter((r) => Number.isFinite(r.day) && r.day > 0 && r.stops.length > 0);
  return routes.length > 0 ? routes : undefined;
}

/**
 * Rebuild a BookingConfig from a stored itinerary row (top-level columns +
 * booking_data JSON) so the PDF preview/viewer can render it exactly like the
 * originally generated itinerary.
 */
export function itineraryRowToBooking(it: {
  id?: unknown;
  tour_id?: unknown;
  is_custom_tour?: unknown;
  custom_tour_title?: unknown;
  custom_tour_description?: unknown;
  travelers_adults?: unknown;
  travelers_children?: unknown;
  travelers_infants?: unknown;
  currency?: unknown;
  total_price?: unknown;
  offer_price?: unknown;
  price_per_person?: unknown;
  start_date?: unknown;
  end_date?: unknown;
  client_name?: unknown;
  client_email?: unknown;
  client_phone?: unknown;
  client_whatsapp?: unknown;
  notes?: unknown;
  special_requests?: unknown;
  created_at?: unknown;
  booking_data?: unknown;
}): BookingConfig {
  const bd: UnknownRecord =
    typeof it.booking_data === "object" && it.booking_data !== null
      ? (it.booking_data as UnknownRecord)
      : {};
  const bookingId =
    asString(bd.bookingRef) ??
    `bk-${String(it.id ?? "").slice(0, 8).toUpperCase()}`;
  const offerRaw = it.offer_price ?? bd.offerPrice;
  const offerNum = offerRaw == null ? 0 : Number(offerRaw);
  return {
    id: bookingId,
    isCustomTour: Boolean(it.is_custom_tour),
    tourId: asString(bd.tourId) ?? asString(it.tour_id),
    customTourTitle: asString(bd.customTourTitle) ?? asString(it.custom_tour_title),
    customTourDescription:
      asString(bd.customTourDescription) ?? asString(it.custom_tour_description),
    customItinerary: Array.isArray(bd.customItinerary)
      ? (bd.customItinerary as ItineraryDay[])
      : undefined,
    customDayRoutes: Array.isArray(bd.customDayRoutes)
      ? (bd.customDayRoutes as string[][])
      : undefined,
    customInclusions: asStringArray(bd.customInclusions),
    customExclusions: asStringArray(bd.customExclusions),
    customRouteStops: Array.isArray(bd.customRouteStops)
      ? (bd.customRouteStops as BookingConfig["customRouteStops"])
      : undefined,
    dayRoutes: asDayRoutes(bd.dayRoutes),
    customTerms: asStringArray(bd.customTerms),
    customPrivacy: asStringArray(bd.customPrivacy),
    offerTitle: asString(bd.offerTitle),
    offerNote: asString(bd.offerNote),
    inclusions: asStringArray(bd.inclusions),
    exclusions: asStringArray(bd.exclusions),
    clientWhatsapp: asString(bd.clientWhatsapp) ?? asString(it.client_whatsapp),
    meetingPoint: asString(bd.meetingPoint),
    flightArrival: asString(bd.flightArrival),
    pricePerPerson: asNumber(bd.pricePerPerson) ?? asNumber(it.price_per_person),
    mapUrl: asString(bd.mapUrl),
    travelers: {
      adults: asNumber(it.travelers_adults) ?? 0,
      children: asNumber(it.travelers_children) ?? 0,
      infants: asNumber(it.travelers_infants) ?? 0,
    },
    currency: it.currency === "EUR" || it.currency === "USD" ? it.currency : "USD",
    totalPrice: asNumber(it.total_price) ?? 0,
    offerPrice: offerNum > 0 ? offerNum : undefined,
    startDate: asString(it.start_date) ?? "",
    endDate: asString(it.end_date) ?? "",
    clientName: asString(it.client_name),
    clientEmail: asString(it.client_email),
    clientPhone: asString(it.client_phone),
    notes: asString(it.notes),
    specialRequests: asString(it.special_requests),
    createdAt: asString(it.created_at) ?? new Date().toISOString(),
  };
}
