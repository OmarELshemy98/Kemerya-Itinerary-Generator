import { NextResponse } from "next/server";
import { supabase, getServiceSupabase } from "@/lib/supabase";
import { createClient as createServerClient } from "@/lib/supabase/server";
import type { BookingConfig, Tour } from "@/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function getCurrentUserId(): Promise<string | null> {
  const serverSupabase = createServerClient();
  const {
    data: { user },
  } = await serverSupabase.auth.getUser();
  return user?.id ?? null;
}

export async function GET(request: Request) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json(
        { ok: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    // Get filter type from query params
    const { searchParams } = new URL(request.url);
    const filterType = searchParams.get("type"); // "custom", "approved", "hold", or null for all
    const idParam = searchParams.get("id"); // fetch a single itinerary

    // Get user's role to determine if they can see all itineraries
    const serverSupabase = createServerClient();
    const { data: profile } = await serverSupabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .maybeSingle();

    const isAdmin = profile?.role === "super_admin" || profile?.role === "admin";

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
      console.error("GET /api/itineraries error:", error);
      return NextResponse.json(
        { ok: false, error: `Database error: ${error.message}` },
        { status: 500 }
      );
    }

    // Get user info for each itinerary
    const userIds = [...new Set((data || []).map((row: any) => row.user_id))];
    const { data: profiles } = await client
      .from("profiles")
      .select("id, full_name, email")
      .in("id", userIds);

    const profileMap = new Map((profiles || []).map((p: any) => [p.id, p]));

    // Transform data to include user info
    const itineraries = (data || []).map((row: any) => ({
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
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: String(e?.message || e) },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json(
        { ok: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { tour, booking } = body as { tour: Tour | null; booking: BookingConfig };

    if (!booking) {
      return NextResponse.json(
        { ok: false, error: "Booking data is required" },
        { status: 400 }
      );
    }

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
        tourId: (booking as any).tourId,
        customTourTitle: booking.customTourTitle,
        customTourDescription: booking.customTourDescription,
        customItinerary: booking.customItinerary,
        customInclusions: booking.customInclusions,
        customExclusions: booking.customExclusions,
        customRouteStops: booking.customRouteStops,
        dayRoutes: booking.dayRoutes,
        customTerms: booking.customTerms,
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
      console.error("POST /api/itineraries error:", error);
      return NextResponse.json(
        { ok: false, error: `Database error: ${error.message}` },
        { status: 500 }
      );
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
      } catch (auditError) {
        console.error("Failed to log audit:", auditError);
      }
    }

    return NextResponse.json({ ok: true, itinerary: data });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: String(e?.message || e) },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json(
        { ok: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json(
        { ok: false, error: "Itinerary ID is required" },
        { status: 400 }
      );
    }

    // Determine role to allow admins to delete any itinerary; regular users
    // can only delete their own.
    const serverSupabase = createServerClient();
    const { data: profile } = await serverSupabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .maybeSingle();
    const isAdmin =
      profile?.role === "super_admin" ||
      profile?.role === "admin" ||
      profile?.role === "operator";

    const serviceSupabase = getServiceSupabase();
    const client = serviceSupabase || supabase;

    // Use serviceSupabase (bypasses RLS) so admins can delete any itinerary,
    // but scope the delete to the owner for regular users.
    let query = client.from("itineraries").delete().eq("id", id);
    if (!isAdmin) {
      query = query.eq("user_id", userId);
    }

    const { data, error } = await query.select();

    if (error) {
      return NextResponse.json(
        { ok: false, error: `Database error: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, deleted: { id } });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: String(e?.message || e) },
      { status: 500 }
    );
  }
}