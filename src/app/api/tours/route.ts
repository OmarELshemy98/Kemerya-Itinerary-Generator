import { NextResponse } from "next/server";
import { readCache, writeCache } from "@/lib/tour-cache";
import { scrapeAllTours } from "@/lib/kemerya-scraper";
import { MAIN_CATEGORIES, SUB_CATEGORIES } from "@/data/tours";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Scrape cache is valid for 6 hours (more frequent updates)
const SCRAPE_CACHE_TTL_MS = 6 * 60 * 60 * 1000;

// Track if a scrape is currently in progress to avoid duplicate scrapes
let scrapeInProgress = false;

async function triggerBackgroundScrape() {
  if (scrapeInProgress) {
    console.log("Scrape already in progress, skipping...");
    return;
  }

  scrapeInProgress = true;
  try {
    console.log("Starting background scrape of kemeryatours.com...");
    const startTime = Date.now();
    
    const result = await scrapeAllTours({ maxToursPerSub: 100 });
    
    await writeCache({
      tours: result.tours,
      scrapedAt: result.scrapedAt,
      source: result.source,
      stats: result.stats,
      mainCategories: MAIN_CATEGORIES,
      subCategories: SUB_CATEGORIES,
    });

    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`Scrape completed in ${duration}s: ${result.tours.length} tours from ${result.stats.subCategories} sub-categories`);
  } catch (e) {
    console.error("Background scrape failed:", e);
  } finally {
    scrapeInProgress = false;
  }
}

export async function GET() {
  try {
    const cache = await readCache();
    const now = Date.now();
    const scrapedAtTime = cache?.scrapedAt ? new Date(cache.scrapedAt).getTime() : 0;
    const isStale = !scrapedAtTime || now - scrapedAtTime > SCRAPE_CACHE_TTL_MS;
    const isEmpty = !cache || !cache.tours || cache.tours.length === 0;

    // Trigger background scrape if cache is stale or empty
    if ((isEmpty || isStale) && !scrapeInProgress) {
      // Use setImmediate to avoid blocking the response
      setImmediate(() => {
        triggerBackgroundScrape();
      });
    }

    if (cache && cache.tours && cache.tours.length > 0) {
      return NextResponse.json({
        ok: true,
        source: cache.source || "cache",
        scrapedAt: cache.scrapedAt || null,
        stats: cache.stats || null,
        tours: cache.tours,
        mainCategories: cache.mainCategories?.length ? cache.mainCategories : MAIN_CATEGORIES,
        subCategories: cache.subCategories?.length ? cache.subCategories : SUB_CATEGORIES,
        refreshing: (isEmpty || isStale) && scrapeInProgress,
      });
    }

    // No cache available - trigger scrape and return fallback
    return NextResponse.json({
      ok: true,
      source: "fallback",
      scrapedAt: null,
      stats: {
        mainCategories: MAIN_CATEGORIES.length,
        subCategories: SUB_CATEGORIES.length,
        toursTotal: 0,
        withDetails: 0,
      },
      tours: [],
      mainCategories: MAIN_CATEGORIES,
      subCategories: SUB_CATEGORIES,
      refreshing: true,
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
