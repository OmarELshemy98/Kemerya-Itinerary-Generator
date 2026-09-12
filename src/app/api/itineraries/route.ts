import { NextResponse } from "next/server";
import { z } from "zod";
import { supabase, getServiceSupabase } from "@/lib/supabase";
import { dbError, requireAuthWithRole, requireUser, serverError } from "@/lib/api-helpers";
import type { BookingConfig, ItineraryDay, Tour } from "@/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Narrow runtime validation for the itinerary POST payload (defense in depth — the form already validates with zod). */
const itineraryDaySchema = z.object({
  day: z.number().int().min(1),
  title: z.string(),
  description: z.string(),
});

const dayRouteSchema = z.object({
  day: z.number().int().min(1),
  stops: z.array(z.string()),
});

const bookingSchema = z.object({
  id: z.string().min(1),
  isCustomTour: z.boolean(),
  tourId: z.string().optional(),
  customTourTitle: z.string().optional(),
  customTourDescription: z.string().optional(),
  customItinerary: z.array(itineraryDaySchema).optional(),
  customDayRoutes: z.array(z.array(z.string())).optional(),
  customInclusions: z.array(z.string()).optional(),
  customExclusions: z.array(z.string()).optional(),
  customRouteStops: z
    .array(z.object({ id: z.string(), name: z.string(), order: z.number() }))
    .optional(),
  dayRoutes: z.array(dayRouteSchema).optional(),
  customTerms: z.array(z.string()).optional(),
  customPrivacy: z.array(z.string()).optional(),
  offerPrice: z.number().min(0).optional(),
  offerTitle: z.string().optional(),
  offerNote: z.string().optional(),
  inclusions: z.array(z.string()).optional(),
  exclusions: z.array(z.string()).optional(),
  travelers: z.object({
    adults: z.number().int().min(0),
    children: z.number().int().min(0),
    infants: z.number().int().min(0),
  }),
  currency: z.enum(["USD", "EUR"]),
  totalPrice: z.number().min(0),
  pricePerPerson: z.number().min(0).optional(),
  startDate: z.string().min(1),
  endDate: z.string().min(1),
  clientName: z.string().optional(),
  clientEmail: z.string().email().optional().or(z.literal("")),
  clientPhone: z.string().optional(),
  clientWhatsapp: z.string().optional(),
  meetingPoint: z.string().optional(),
  flightArrival: z.string().optional(),
  notes: z.string().optional(),
  specialRequests: z.string().optional(),
  isApproved: z.boolean().optional(),
  mapUrl: z.string().optional(),
});

const postBodySchema = z.object({
  tour: z
    .object({ id: z.string(), title: z.string() })
    .passthrough()
    .nullable()
    .optional(),
  booking: bookingSchema,
});


export async function GET(request: Request) {
  try {
    const auth = await requireAuthWithRole();
    if (!auth.ok) return auth.response;
    const { userId, isAdmin } = auth.ctx;

    // Get filter type from query params
    const { searchParams } = new URL(request.url);
    const filterType = searchParams.get("type"); // "custom", "approved", "hold", or null for all
    const idParam = searchParams.get("id"); // fetch a single itinerary

    // Use serviceSupabase to bypass RLS
    const serviceSupabase = getServiceSupabase();
    const client = serviceSupabase || supabase;

    // Build query - simple select without join
    let query = client.from("itineraries").select("*");
    const fetchSingle = Boolean(idParam);

    if (idParam) {
      query = query.eq("id", idParam).limit(1);
    } else {
      query = query.order("created_at", { ascending: false });
    }

    // Non-admin users can only see their own itineraries
    if (!isAdmin) {
      query = query.eq("user_id", userId);
    }

    // Apply filters based on type (list endpoint only)
    if (!idParam) {
      if (filterType === "custom") {
        query = query.eq("is_custom_tour", true);
      } else if (filterType === "approved") {
        // Approved page: ONLY approved itineraries
        query = query.eq("is_approved", true);
      } else if (filterType === "offers") {
        // Offers page: ONLY itineraries with a special offer price
        query = query.not("offer_price", "is", null);
      } else if (filterType === "hold") {
        // Hold = NOT approved (false OR NULL for old rows)
        query = query.or("is_approved.is.null,is_approved.eq.false");
      }
    }

    const { data, error } = await query;

    if (error) {
      // If table doesn't exist, return empty array
      if (error.message?.includes("does not exist") || error.code === "42P01") {
        return NextResponse.json({ ok: true, itineraries: [] });
      }
      return dbError(error.message);
    }

    // Get user info for each itinerary
    const userIds = [...new Set((data || []).map((row) => row.user_id as string))];
    const { data: profiles } = await client
      .from("profiles")
      .select("id, full_name, email")
      .in("id", userIds);

    const profileMap = new Map(
      (profiles || []).map((p) => [p.id as string, p] as const)
    );

    // Transform data to include user info
    const itineraries = (data || []).map((row) => ({
      id: row.id,
      user_id: row.user_id,
      user_email: profileMap.get(row.user_id)?.email || null,
      user_name: profileMap.get(row.user_id)?.full_name || null,
      tour_id: row.tour_id,
      tour_title: row.tour_title,
      is_custom_tour: row.is_custom_tour,
      custom_tour_title: row.custom_tour_title,
      custom_tour_description: row.custom_tour_description,
      client_name: row.client_name,
      client_email: row.client_email,
      client_phone: row.client_phone,
      client_whatsapp: row.client_whatsapp,
      travelers_adults: row.travelers_adults,
      travelers_children: row.travelers_children,
      travelers_infants: row.travelers_infants,
      total_price: row.total_price,
      currency: row.currency,
      price_per_person: row.price_per_person,
      start_date: row.start_date,
      end_date: row.end_date,
      notes: row.notes,
      special_requests: row.special_requests,
      created_at: row.created_at,
      is_approved: row.is_approved ?? false,
      offer_price: row.offer_price ?? null,
      booking_data: row.booking_data ?? {},
    }));

    if (fetchSingle) {
      // Single itinerary: return it as `itinerary` so a viewer can rebuild it
      return NextResponse.json({ ok: true, itinerary: itineraries[0] });
    }

    return NextResponse.json({ ok: true, itineraries });
  } catch (e) {
    return serverError(e, "GET /api/itineraries failed");
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireUser();
    if (!auth.ok) return auth.response;
    const userId = auth.userId;

    const json = await request.json().catch(() => null);
    const parsed = postBodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: "Invalid booking payload" },
        { status: 400 }
      );
    }
    const { tour, booking } = parsed.data as {
      tour: Tour | null | undefined;
      booking: BookingConfig;
    };

    const itineraryData = {
      user_id: userId,
      tour_id: tour?.id || null,
      tour_title: tour?.title || null,
      is_custom_tour: booking.isCustomTour,
      custom_tour_title: booking.customTourTitle || null,
      custom_tour_description: booking.customTourDescription || null,
      client_name: booking.clientName || null,
      client_email: booking.clientEmail || null,
      client_phone: booking.clientPhone || null,
      client_whatsapp: booking.clientWhatsapp || null,
      travelers_adults: booking.travelers.adults,
      travelers_children: booking.travelers.children,
      travelers_infants: booking.travelers.infants,
      total_price: booking.totalPrice,
      currency: booking.currency,
      price_per_person: booking.pricePerPerson || null,
      start_date: booking.startDate,
      end_date: booking.endDate,
      notes: booking.notes || null,
      special_requests: booking.specialRequests || null,
      is_approved: booking.isApproved || false,
      offer_price:
        booking.offerPrice && booking.offerPrice > 0 ? booking.offerPrice : null,
      booking_data: {
        bookingRef: booking.id,
        isCustomTour: booking.isCustomTour,
        offerPrice: booking.offerPrice || null,
        offerTitle: booking.offerTitle || null,
        offerNote: booking.offerNote || null,
        tourId: booking.tourId,
        customTourTitle: booking.customTourTitle,
        customTourDescription: booking.customTourDescription,
        customItinerary: booking.customItinerary,
        customDayRoutes: booking.customDayRoutes || null,
        customInclusions: booking.customInclusions,
        customExclusions: booking.customExclusions,
        customRouteStops: booking.customRouteStops,
        dayRoutes: booking.dayRoutes,
        customTerms: booking.customTerms,
        customPrivacy: booking.customPrivacy || null,
        inclusions: booking.inclusions,
        exclusions: booking.exclusions,
        clientWhatsapp: booking.clientWhatsapp,
        meetingPoint: booking.meetingPoint,
        flightArrival: booking.flightArrival,
        pricePerPerson: booking.pricePerPerson,
        mapUrl: booking.mapUrl,
      },
    };

    // Use serviceSupabase to bypass RLS
    const serviceSupabase = getServiceSupabase();
    const client = serviceSupabase || supabase;

    const { data, error } = await client
      .from("itineraries")
      .insert(itineraryData)
      .select()
      .single();

    if (error) {
      // If table doesn't exist, return success but warn
      if (error.message?.includes("does not exist") || error.code === "42P01") {
        return NextResponse.json({
          ok: true,
          warning: "Itineraries table not found. Please run the database migration.",
          itinerary: { id: booking.id, ...itineraryData, created_at: new Date().toISOString() },
        });
      }
      return dbError(error.message);
    }

    // Log itinerary creation (don't fail if audit_log table doesn't exist)
    if (serviceSupabase) {
      try {
        await serviceSupabase.from("audit_log").insert({
          user_id: userId,
          action: "create_itinerary",
          details: {
            itinerary_id: data.id,
            tour_title: tour?.title || booking.customTourTitle,
            client_name: booking.clientName,
            total_price: booking.totalPrice,
            currency: booking.currency,
          },
        });
      } catch {
        // audit logging is best-effort
      }
    }

    return NextResponse.json({ ok: true, itinerary: data });
  } catch (e) {
    return serverError(e, "POST /api/itineraries failed");
  }
}

export async function DELETE(request: Request) {
  try {
    const auth = await requireAuthWithRole();
    if (!auth.ok) return auth.response;
    const { userId, role } = auth.ctx;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json(
        { ok: false, error: "Itinerary ID is required" },
        { status: 400 }
      );
    }

    // Admins/operators can delete any itinerary; regular users only their own.
    const canDeleteAny =
      role === "super_admin" || role === "admin" || role === "operator";

    const serviceSupabase = getServiceSupabase();
    const client = serviceSupabase || supabase;

    // Use serviceSupabase (bypasses RLS) so admins can delete any itinerary,
    // but scope the delete to the owner for regular users.
    let query = client.from("itineraries").delete().eq("id", id);
    if (!canDeleteAny) {
      query = query.eq("user_id", userId);
    }

    const { error } = await query.select();

    if (error) {
      return dbError(error.message);
    }

    return NextResponse.json({ ok: true, deleted: { id } });
  } catch (e) {
    return serverError(e, "DELETE /api/itineraries failed");
  }
}