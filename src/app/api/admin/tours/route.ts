import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { createClient as createServerClient } from "@/lib/supabase/server";
import type { Tour, ItineraryDay } from "@/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function requireAdminApi() {
  const serverSupabase = createServerClient();
  const {
    data: { user },
    error: authError,
  } = await serverSupabase.auth.getUser();

  if (authError || !user) {
    return { allowed: false, status: 401, message: "Authentication required" };
  }

  const { data: profile, error: profileError } = await serverSupabase
    .from("profiles")
    .select("role, is_active")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError || !profile) {
    return { allowed: false, status: 403, message: "Profile not found" };
  }

  if (!profile.is_active) {
    return { allowed: false, status: 403, message: "Account is deactivated" };
  }

  if (profile.role !== "super_admin" && profile.role !== "admin" && profile.role !== "operator") {
    return { allowed: false, status: 403, message: "Operator access or higher required" };
  }

  return { allowed: true, user };
}

function rowToTour(row: any): Tour {
  return {
    id: row.id,
    mainCategoryId: row.main_category_id,
    subCategoryId: row.sub_category_id,
    title: row.title,
    slug: row.slug,
    durationDays: row.duration_days || 1,
    durationNights: row.duration_nights ?? undefined,
    shortDescription: row.short_description ?? undefined,
    longDescription: row.long_description ?? undefined,
    image: row.image ?? undefined,
    basePriceUSD: row.base_price_usd != null ? Number(row.base_price_usd) : undefined,
    basePriceEUR: row.base_price_eur != null ? Number(row.base_price_eur) : undefined,
    highlights: Array.isArray(row.highlights) ? row.highlights : undefined,
    inclusions: Array.isArray(row.inclusions) ? row.inclusions : [],
    exclusions: Array.isArray(row.exclusions) ? row.exclusions : [],
    itinerary: Array.isArray(row.itinerary) ? (row.itinerary as ItineraryDay[]) : [],
    tags: Array.isArray(row.tags) ? row.tags : undefined,
    isPopular: Boolean(row.is_popular),
  };
}

function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("cached_tours")
      .select("*")
      .order("title", { ascending: true });

    if (error) {
      return NextResponse.json(
        { ok: false, error: `Database error: ${error.message}` },
        { status: 500 }
      );
    }

    const tours = (data || []).map(rowToTour);
    return NextResponse.json({ ok: true, tours });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: String(e?.message || e) },
      { status: 500 }
    );
  }
}

function safeJsonArray(val: any, fallback: any[] = []): any[] {
  if (Array.isArray(val)) return val;
  if (typeof val === "string") {
    try {
      const parsed = JSON.parse(val);
      return Array.isArray(parsed) ? parsed : fallback;
    } catch {
      return fallback;
    }
  }
  return fallback;
}

export async function POST(request: Request) {
  try {
    const auth = await requireAdminApi();
    if (!auth.allowed) {
      return NextResponse.json(
        { ok: false, error: auth.message },
        { status: auth.status }
      );
    }

    const body = await request.json();
    const {
      title,
      slug,
      mainCategoryId,
      subCategoryId,
      durationDays,
      durationNights,
      shortDescription,
      longDescription,
      image,
      basePriceUSD,
      basePriceEUR,
      highlights,
      inclusions,
      exclusions,
      itinerary,
      tags,
      isPopular,
    } = body;

    if (!title || !title.trim()) {
      return NextResponse.json(
        { ok: false, error: "Tour title is required" },
        { status: 400 }
      );
    }
    if (!mainCategoryId || !mainCategoryId.trim()) {
      return NextResponse.json(
        { ok: false, error: "Main category ID is required" },
        { status: 400 }
      );
    }
    if (!subCategoryId || !subCategoryId.trim()) {
      return NextResponse.json(
        { ok: false, error: "Sub-category ID is required" },
        { status: 400 }
      );
    }
    if (!durationDays || Number(durationDays) < 1) {
      return NextResponse.json(
        { ok: false, error: "Valid duration days is required" },
        { status: 400 }
      );
    }

    const finalSlug = (slug && slug.trim()) || slugify(title);
    const finalId = `tour_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const nowISO = new Date().toISOString();

    const { data, error } = await supabase
      .from("cached_tours")
      .insert({
        id: finalId,
        main_category_id: mainCategoryId.trim(),
        sub_category_id: subCategoryId.trim(),
        title: title.trim(),
        slug: finalSlug,
        duration_days: Number(durationDays),
        duration_nights: durationNights != null ? Number(durationNights) : null,
        short_description: shortDescription?.trim() || null,
        long_description: longDescription?.trim() || null,
        image: image?.trim() || null,
        base_price_usd: basePriceUSD != null ? Number(basePriceUSD) : null,
        base_price_eur: basePriceEUR != null ? Number(basePriceEUR) : null,
        highlights: safeJsonArray(highlights, []),
        inclusions: safeJsonArray(inclusions, []),
        exclusions: safeJsonArray(exclusions, []),
        itinerary: safeJsonArray(itinerary, []),
        tags: safeJsonArray(tags, []),
        is_popular: Boolean(isPopular),
        is_manual: true,
        has_details: Boolean(
          (Array.isArray(itinerary) && itinerary.length > 0) ||
            (longDescription && longDescription.trim())
        ),
        scraped_at: nowISO,
        inserted_at: nowISO,
        updated_at: nowISO,
      })
      .select("*")
      .limit(1);

    if (error) {
      return NextResponse.json(
        { ok: false, error: `Database error: ${error.message}` },
        { status: 500 }
      );
    }

    const tour = data && data[0] ? rowToTour(data[0]) : null;
    return NextResponse.json({ ok: true, tour });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: String(e?.message || e) },
      { status: 500 }
    );
  }
}
