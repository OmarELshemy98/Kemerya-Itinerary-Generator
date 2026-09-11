import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(request: Request) {
  try {
    const { id, is_approved } = await request.json();

    if (!id) {
      return NextResponse.json({ ok: false, error: "Itinerary ID is required" }, { status: 400 });
    }

    const serviceSupabase = getServiceSupabase();
    if (!serviceSupabase) {
      return NextResponse.json({ ok: false, error: "Service client not available" }, { status: 500 });
    }

    const { data, error } = await serviceSupabase
      .from("itineraries")
      .update({ is_approved: !!is_approved, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      if (error.message?.includes("does not exist") || error.code === "42P01") {
        return NextResponse.json({ ok: false, error: "Itineraries table not found. Please run the database migration." }, { status: 404 });
      }
      if (error.message?.includes("is_approved")) {
        return NextResponse.json({ ok: false, error: "is_approved column not found. Please run: ALTER TABLE itineraries ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT FALSE;" }, { status: 400 });
      }
      console.error("PATCH /api/itineraries/approve error:", error);
      return NextResponse.json({ ok: false, error: `Database error: ${error.message}` }, { status: 500 });
    }

    return NextResponse.json({ ok: true, itinerary: data });
  } catch (e) {
    console.error("PATCH /api/itineraries/approve error:", e);
    return NextResponse.json({ ok: false, error: "Internal server error" }, { status: 500 });
  }
}