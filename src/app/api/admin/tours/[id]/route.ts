import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { upsertTourInFileCache, removeTourFromFileCache } from "@/lib/tour-cache";
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

  if (
    profile.role !== "super_admin" &&
    profile.role !== "admin" &&
    profile.role !== "operator"
  ) {
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

function safeJsonArray(val: any, fallback: any[] = []): any[] | undefined {
  if (val === undefined) return undefined;
  if (val === null) return fallback;
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

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { data, error } = await supabase
      .from("cached_tours")
      .select("*")
      .eq("id", id)
      .limit(1);

    if (error) {
      return NextResponse.json(
        { ok: false, error: `Database error: ${error.message}` },
        { status: 500 }
      );
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { ok: false, error: "Tour not found" },
        { status: 404 }
      );
    }

    const tour = rowToTour(data[0]);
    return NextResponse.json({ ok: true, tour });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: String(e?.message || e) },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await requireAdminApi();
    if (!auth.allowed) {
      return NextResponse.json(
        { ok: false, error: auth.message },
        { status: auth.status }
      );
    }

    const { id } = params;
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

    if (title !== undefined && !title.trim()) {
      return NextResponse.json(
        { ok: false, error: "Tour title cannot be empty" },
        { status: 400 }
      );
    }

    const updates: Record<string, any> = {};
    if (title !== undefined) updates.title = title.trim();
    if (slug !== undefined) updates.slug = slug.trim() || slugify(title || "");
    if (mainCategoryId !== undefined) updates.main_category_id = mainCategoryId.trim();
    if (subCategoryId !== undefined) updates.sub_category_id = subCategoryId.trim();
    if (durationDays !== undefined) updates.duration_days = Number(durationDays);
    if (durationNights !== undefined) {
      updates.duration_nights = durationNights != null ? Number(durationNights) : null;
    }
    if (shortDescription !== undefined) {
      updates.short_description = shortDescription?.trim() || null;
    }
    if (longDescription !== undefined) {
      updates.long_description = longDescription?.trim() || null;
    }
    if (image !== undefined) updates.image = image?.trim() || null;
    if (basePriceUSD !== undefined) {
      updates.base_price_usd = basePriceUSD != null ? Number(basePriceUSD) : null;
    }
    if (basePriceEUR !== undefined) {
      updates.base_price_eur = basePriceEUR != null ? Number(basePriceEUR) : null;
    }
    if (highlights !== undefined) updates.highlights = safeJsonArray(highlights, []);
    if (inclusions !== undefined) updates.inclusions = safeJsonArray(inclusions, []);
    if (exclusions !== undefined) updates.exclusions = safeJsonArray(exclusions, []);
    if (itinerary !== undefined) updates.itinerary = safeJsonArray(itinerary, []);
    if (tags !== undefined) updates.tags = safeJsonArray(tags, []);
    if (isPopular !== undefined) updates.is_popular = Boolean(isPopular);
    updates.updated_at = new Date().toISOString();

    if (
      (itinerary !== undefined &&
        Array.isArray(itinerary) &&
        itinerary.length > 0) ||
      (longDescription !== undefined && longDescription?.trim()) ||
      updates.itinerary ||
      updates.long_description
    ) {
      updates.has_details = true;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { ok: false, error: "No fields to update" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("cached_tours")
      .update(updates)
      .eq("id", id)
      .select("*")
      .limit(1);

    if (error) {
      return NextResponse.json(
        { ok: false, error: `Database error: ${error.message}` },
        { status: 500 }
      );
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { ok: false, error: "Tour not found" },
        { status: 404 }
      );
    }

    const tour = rowToTour(data[0]);
    // Mirror the edit into the local file cache immediately so the change is
    // visible on the very next /api/tours read (no waiting for a scrape).
    await upsertTourInFileCache(tour);
    return NextResponse.json({ ok: true, tour });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: String(e?.message || e) },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await requireAdminApi();
    if (!auth.allowed) {
      return NextResponse.json(
        { ok: false, error: auth.message },
        { status: auth.status }
      );
    }

    const { id } = params;

    const { error } = await supabase.from("cached_tours").delete().eq("id", id);

    if (error) {
      return NextResponse.json(
        { ok: false, error: `Failed to delete tour: ${error.message}` },
        { status: 500 }
      );
    }

    // Remove from the local file cache immediately so the deleted tour does
    // not re-appear via the file/DB merge on the next read.
    await removeTourFromFileCache(id);

    return NextResponse.json({ ok: true, deleted: { id } });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: String(e?.message || e) },
      { status: 500 }
    );
  }
}
