import { NextResponse } from "next/server";
import { readCache, mergeWithBaseData } from "@/lib/tour-cache";
import {
  TOURS as FALLBACK_TOURS,
  MAIN_CATEGORIES,
  SUB_CATEGORIES,
} from "@/data/tours";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const cache = await readCache();
    if (cache && cache.tours && cache.tours.length > 0) {
      const merged = mergeWithBaseData(cache);
      return NextResponse.json({
        ok: true,
        source: cache.source || "cache",
        scrapedAt: cache.scrapedAt || null,
        stats: cache.stats || null,
        tours: merged.tours,
        mainCategories: merged.mainCategories,
        subCategories: merged.subCategories,
      });
    }
    return NextResponse.json({
      ok: true,
      source: "fallback",
      scrapedAt: null,
      stats: null,
      tours: FALLBACK_TOURS,
      mainCategories: MAIN_CATEGORIES,
      subCategories: SUB_CATEGORIES,
    });
  } catch (e: any) {
    return NextResponse.json(
      {
        ok: false,
        error: String(e?.message || e),
      },
      { status: 500 }
    );
  }
}
