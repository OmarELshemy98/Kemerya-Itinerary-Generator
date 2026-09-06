import { NextResponse } from "next/server";
import { readCache, writeCache } from "@/lib/tour-cache";
import { scrapeAllTours } from "@/lib/kemerya-scraper";
import { MAIN_CATEGORIES, SUB_CATEGORIES } from "@/data/tours";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

async function triggerBackgroundScrape() {
  try {
    const result = await scrapeAllTours({ maxToursPerSub: 20 });
    await writeCache({
      tours: result.tours,
      scrapedAt: result.scrapedAt,
      source: result.source,
      stats: result.stats,
      mainCategories: MAIN_CATEGORIES,
      subCategories: SUB_CATEGORIES,
    });
  } catch (e) {
    console.error("Background scrape failed:", e);
  }
}

export async function GET() {
  try {
    const cache = await readCache();
    const now = Date.now();
    const scrapedAtTime = cache?.scrapedAt ? new Date(cache.scrapedAt).getTime() : 0;
    const isStale = !scrapedAtTime || now - scrapedAtTime > TWENTY_FOUR_HOURS_MS;
    const isEmpty = !cache || !cache.tours || cache.tours.length === 0;

    if (isEmpty || isStale) {
      setTimeout(() => {
        triggerBackgroundScrape();
      }, 0);
    }

    if (cache && cache.tours && cache.tours.length > 0) {
      return NextResponse.json({
        ok: true,
        source: cache.source || "cache",
        scrapedAt: cache.scrapedAt || null,
        stats: cache.stats || null,
        tours: cache.tours,
        mainCategories: cache.mainCategories,
        subCategories: cache.subCategories,
      });
    }

    return NextResponse.json({
      ok: true,
      source: "fallback",
      scrapedAt: null,
      stats: null,
      tours: [],
      mainCategories: [],
      subCategories: [],
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
