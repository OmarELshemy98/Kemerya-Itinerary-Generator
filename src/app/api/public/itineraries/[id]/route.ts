import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Public single-itinerary endpoint used by the shareable /itinerary/<id> page
 * so clients can open a booking link without being logged in.
 * Access is "link-based": anyone who knows the (unguessable UUID) id can read it.
 */
export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    if (!id) {
      return NextResponse.json({ ok: false, error: "Itinerary ID is required" }, { status: 400 });
    }

    const serviceSupabase = getServiceSupabase();
    const client = serviceSupabase;
    if (!client) {
      return NextResponse.json({ ok: false, error: "Service client not available" }, { status: 500 });
    }

    const { data, error } = await client
      .from("itineraries")
      .select("*")
      .eq("id", id)
      .limit(1);

    if (error) {
      return NextResponse.json({ ok: false, error: `Database error: ${error.message}` }, { status: 500 });
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ ok: false, error: "Itinerary not found" }, { status: 404 });
    }

    const row = data[0];
    const itinerary = {
      id: row.id,
      user_id: row.user_id,
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
      is_approved: row.is_approved ?? false,
      offer_price: row.offer_price ?? null,
      booking_data: row.booking_data ?? {},
    };

    return NextResponse.json({ ok: true, itinerary });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 });
  }
}