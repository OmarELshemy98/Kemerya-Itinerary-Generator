import { NextResponse } from "next/server";
import { supabase, getServiceSupabase } from "@/lib/supabase";
import { createClient as createServerClient } from "@/lib/supabase/server";
import type { BookingConfig, Tour } from "@/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface ItineraryRow {
  id: string;
  user_id: string;
  tour_id: string | null;
  tour_title: string | null;
  is_custom_tour: boolean;
  custom_tour_title: string | null;
  custom_tour_description: string | null;
  client_name: string | null;
  client_email: string | null;
  client_phone: string | null;
  client_whatsapp: string | null;
  travelers_adults: number;
  travelers_children: number;
  travelers_infants: number;
  total_price: number;
  currency: string;
  price_per_person: number | null;
  start_date: string;
  end_date: string;
  notes: string | null;
  special_requests: string | null;
  created_at: string;
}

async function getCurrentUserId(): Promise<string | null> {
  const serverSupabase = createServerClient();
  const {
    data: { user },
  } = await serverSupabase.auth.getUser();
  return user?.id ?? null;
}

export async function GET() {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json(
        { ok: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    // Get user's role to determine if they can see all itineraries
    const serverSupabase = createServerClient();
    const { data: profile } = await serverSupabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .maybeSingle();

    const isAdmin = profile?.role === "super_admin" || profile?.role === "admin";

    // Build query - simple select without join
    let query = supabase
      .from("itineraries")
      .select("*")
      .order("created_at", { ascending: false });

    // Non-admin users can only see their own itineraries
    if (!isAdmin) {
      query = query.eq("user_id", userId);
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
    const { data: profiles } = await supabase
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
    }));

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
    };

    const { data, error } = await supabase
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
      return NextResponse.json(
        { ok: false, error: `Database error: ${error.message}` },
        { status: 500 }
      );
    }

    // Log itinerary creation (don't fail if audit_log table doesn't exist)
    const serviceSupabase = getServiceSupabase();
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
