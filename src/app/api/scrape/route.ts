import { NextResponse } from "next/server";
import { scrapeAllTours } from "@/lib/kemerya-scraper";
import { writeCache } from "@/lib/tour-cache";
import { MAIN_CATEGORIES, SUB_CATEGORIES } from "@/data/tours";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    let body: any = {};
    try {
      body = await req.json();
    } catch {}
    const maxToursPerSub = body?.maxToursPerSub
      ? Number(body.maxToursPerSub)
      : 20;
    const skipDetails = Boolean(body?.skipDetails);
    const result = await scrapeAllTours({ maxToursPerSub, skipDetails });

    await writeCache({
      tours: result.tours,
      scrapedAt: result.scrapedAt,
      source: result.source,
      stats: result.stats,
      mainCategories: MAIN_CATEGORIES,
      subCategories: SUB_CATEGORIES,
    });

    return NextResponse.json({
      ok: true,
      stats: result.stats,
      scrapedAt: result.scrapedAt,
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
