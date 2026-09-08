import { NextResponse } from "next/server";
import { scrapeAllTours } from "@/lib/kemerya-scraper";
import { writeCache } from "@/lib/tour-cache";
import { MAIN_CATEGORIES, SUB_CATEGORIES } from "@/data/tours";
import type { MainCategory, SubCategory } from "@/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function POST(req: Request) {
  try {
    let body: any = {};
    try {
      body = await req.json();
    } catch {}
    const maxToursPerSub = body?.maxToursPerSub
      ? Number(body.maxToursPerSub)
      : 100;
    const skipDetails = Boolean(body?.skipDetails);
    const result = await scrapeAllTours({ maxToursPerSub, skipDetails });

    // Merge hardcoded baseline categories with the ones discovered live from
    // the website, so any new category/sub-category added on kemeryatours.com
    // automatically appears in the app (100% dynamic catalog).
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

    const mergedMainCategories = Array.from(mainCatMap.values());
    const mergedSubCategories = Array.from(subCatMap.values());

    await writeCache({
      tours: result.tours,
      scrapedAt: result.scrapedAt,
      source: result.source,
      stats: result.stats,
      mainCategories: mergedMainCategories,
      subCategories: mergedSubCategories,
    });

    return NextResponse.json({
      ok: true,
      stats: result.stats,
      scrapedAt: result.scrapedAt,
      discovered: {
        mainCategories: result.discoveredMainCategories?.length || 0,
        subCategories: result.discoveredSubCategories?.length || 0,
      },
      sampleTitles: result.tours.slice(0, 10).map((t) => t.title),
    });
  } catch (e: any) {
    console.error("Scrape API error:", e);
    return NextResponse.json(
      {
        ok: false,
        error: String(e?.message || e || "Unknown error"),
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    {
      ok: false,
      error: "Use POST to trigger a refresh",
      docs: "POST { maxToursPerSub?: number, skipDetails?: boolean }",
    },
    { status: 405 }
  );
}