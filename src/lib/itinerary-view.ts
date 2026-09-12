import type { BookingConfig } from "@/types";

/**
 * Rebuild a BookingConfig from a stored itinerary row (top-level columns +
 * booking_data JSON) so the PDF preview/viewer can render it exactly like the
 * originally generated itinerary.
 */
export function itineraryRowToBooking(it: any): BookingConfig {
  const bd = it.booking_data || {};
  const bookingId = bd.bookingRef || `bk-${String(it.id || "").slice(0, 8).toUpperCase()}`;
  return {
    id: bookingId,
    isCustomTour: Boolean(it.is_custom_tour),
    tourId: bd.tourId || it.tour_id || undefined,
    customTourTitle: bd.customTourTitle || it.custom_tour_title || undefined,
    customTourDescription: bd.customTourDescription || it.custom_tour_description || undefined,
    customItinerary: bd.customItinerary || undefined,
    customInclusions: bd.customInclusions || undefined,
    customExclusions: bd.customExclusions || undefined,
    customRouteStops: bd.customRouteStops || undefined,
    dayRoutes: bd.dayRoutes || undefined,
    customTerms: bd.customTerms || undefined,
    inclusions: bd.inclusions || undefined,
    exclusions: bd.exclusions || undefined,
    clientWhatsapp: bd.clientWhatsapp || it.client_whatsapp || undefined,
    meetingPoint: bd.meetingPoint || undefined,
    flightArrival: bd.flightArrival || undefined,
    pricePerPerson: bd.pricePerPerson ?? it.price_per_person ?? undefined,
    mapUrl: bd.mapUrl || undefined,
    travelers: {
      adults: it.travelers_adults || 0,
      children: it.travelers_children || 0,
      infants: it.travelers_infants || 0,
    },
    currency: it.currency || "USD",
    totalPrice: Number(it.total_price || 0),
    startDate: it.start_date,
    endDate: it.end_date,
    clientName: it.client_name || undefined,
    clientEmail: it.client_email || undefined,
    clientPhone: it.client_phone || undefined,
    notes: it.notes || undefined,
    specialRequests: it.special_requests || undefined,
    createdAt: it.created_at || new Date().toISOString(),
  };
}