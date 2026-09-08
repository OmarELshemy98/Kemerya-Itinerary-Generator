import { NextResponse } from "next/server";
import { readCache, writeCache } from "@/lib/tour-cache";
import { scrapeAllTours } from "@/lib/kemerya-scraper";
import { MAIN_CATEGORIES, SUB_CATEGORIES } from "@/data/tours";
import type { MainCategory, SubCategory } from "@/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

// Scheduled catalog refresh (called by Vercel Cron / external scheduler).
// Secured with CRON_SECRET (via Authorization: Bearer <secret>) when set.
// Keeps tours, prices, categories 100% in sync with kemeryatours.com.

let lastRun: number | null = null;
const MIN_INTERVAL_MS = 30 * 60 * 1000; // avoid duplicate runs within 30 min

async function runRefresh() {
  const result = await scrapeAllTours({ maxToursPerSub: 100 });

  const mainCatMap = new Map<string, MainCategory>();
  for (const m of MAIN_CATEGORIES) mainCatMap.set(m.id, m);
  for (const m of result.discoveredMainCategories || []) {
    mainCatMap.set(m.id, { ...mainCatMap.get(m.id), ...m });
  }
  const subCatMap = new Map<string, SubCategory>();
  for (const s of SUB_CATEGORIES) subCatMap.set(s.id, s);
  for (const s of result.discoveredSubCategories || []) {
    subCatMap.set(s.id, { ...subCatMap.get(s.id), ...s });
  }

  await writeCache({
    tours: result.tours,
    scrapedAt: result.scrapedAt,
    source: result.source,
    stats: result.stats,
    mainCategories: Array.from(mainCatMap.values()),
    subCategories: Array.from(subCatMap.values()),
  });

  return result;
}

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.get("authorization") || "";
    const url = new URL(req.url);
    if (auth !== `Bearer ${secret}` && url.searchParams.get("secret") !== secret) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }
  }

  if (lastRun && Date.now() - lastRun < MIN_INTERVAL_MS) {
    return NextResponse.json({
      ok: true,
      skipped: true,
      reason: "Refreshed recently",
      lastRun: new Date(lastRun).toISOString(),
    });
  }

  lastRun = Date.now();
  try {
    const cache = await readCache();
    const startedAt = Date.now();
    const result = await runRefresh();
    const durationSec = ((Date.now() - startedAt) / 1000).toFixed(1);
    return NextResponse.json({
      ok: true,
      previousScrapedAt: cache?.scrapedAt ?? null,
      stats: result.stats,
      durationSec,
      scrapedAt: result.scrapedAt,
    });
  } catch (e: any) {
    console.error("Cron refresh error:", e);
    return NextResponse.json(
      { ok: false, error: String(e?.message || e) },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  return GET(req);
}