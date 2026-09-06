import type { Tour, MainCategory, SubCategory } from "@/types";
import { createClient } from "@/lib/supabase/server";
import { promises as fs } from "fs";
import path from "path";

// Data is cached in Supabase (cached_main_categories / cached_sub_categories /
// cached_tours / cache_meta). If those tables don't exist (or RLS blocks them),
// we transparently fall back to a JSON file on disk so the app keeps working.

const CACHE_FILE = path.join(process.cwd(), ".tour-cache.json");

async function readFileCache(): Promise<CachedData | null> {
  try {
    const raw = await fs.readFile(CACHE_FILE, "utf8");
    const data = JSON.parse(raw) as CachedData;
    if (!data || !Array.isArray(data.tours)) return null;
    return data;
  } catch {
    return null;
  }
}

async function writeFileCacheFile(data: CachedData): Promise<void> {
  try {
    await fs.writeFile(CACHE_FILE, JSON.stringify(data), "utf8");
  } catch (e) {
    console.error("File cache write error:", e);
  }
}

// NOTE: Make sure to disable RLS on these tables or create policies in Supabase dashboard.
// Tables required: cached_main_categories, cached_sub_categories, cached_tours, cache_meta
//
// SQL schema reference (run in Supabase SQL editor):
// CREATE TABLE cached_main_categories (
//   id TEXT PRIMARY KEY,
//   name TEXT NOT NULL,
//   slug TEXT NOT NULL,
//   description TEXT,
//   image TEXT,
//   scraped_at TIMESTAMPTZ
// );
//
// CREATE TABLE cached_sub_categories (
//   id TEXT PRIMARY KEY,
//   main_cat_id TEXT NOT NULL,
//   name TEXT NOT NULL,
//   slug TEXT NOT NULL,
//   description TEXT,
//   image TEXT,
//   scraped_at TIMESTAMPTZ
// );
//
// CREATE TABLE cached_tours (
//   id TEXT PRIMARY KEY,
//   main_cat_id TEXT NOT NULL,
//   sub_cat_id TEXT NOT NULL,
//   title TEXT NOT NULL,
//   slug TEXT NOT NULL,
//   duration_days INT NOT NULL DEFAULT 1,
//   duration_nights INT,
//   short_desc TEXT,
//   long_desc TEXT,
//   image TEXT,
//   base_price_usd NUMERIC,
//   base_price_eur NUMERIC,
//   highlights JSONB DEFAULT '[]'::jsonb,
//   inclusions JSONB DEFAULT '[]'::jsonb,
//   exclusions JSONB DEFAULT '[]'::jsonb,
//   itinerary JSONB DEFAULT '[]'::jsonb,
//   tags JSONB DEFAULT '[]'::jsonb,
//   is_popular BOOLEAN DEFAULT false,
//   scraped_at TIMESTAMPTZ
// );
//
// CREATE TABLE cache_meta (
//   id TEXT PRIMARY KEY DEFAULT 'global',
//   last_full_scrape_at TIMESTAMPTZ,
//   source TEXT
// );

export interface CachedData {
  tours: Tour[];
  mainCategories: MainCategory[];
  subCategories: SubCategory[];
  scrapedAt: string | null;
  source: string;
  stats?: {
    mainCategories: number;
    subCategories: number;
    toursTotal: number;
    withDetails: number;
  };
}

function tourToRow(t: Tour, scrapedAt: string) {
  return {
    id: t.id,
    main_cat_id: t.mainCategoryId,
    sub_cat_id: t.subCategoryId,
    title: t.title,
    slug: t.slug,
    duration_days: t.durationDays,
    duration_nights: t.durationNights ?? null,
    short_desc: t.shortDescription ?? null,
    long_desc: t.longDescription ?? null,
    image: t.image ?? null,
    base_price_usd: t.basePriceUSD ?? null,
    base_price_eur: t.basePriceEUR ?? null,
    highlights: t.highlights ?? [],
    inclusions: t.inclusions ?? [],
    exclusions: t.exclusions ?? [],
    itinerary: t.itinerary ?? [],
    tags: t.tags ?? [],
    is_popular: Boolean(t.isPopular),
    scraped_at: scrapedAt,
  };
}

function rowToTour(row: any): Tour {
  return {
    id: row.id,
    mainCategoryId: row.main_cat_id,
    subCategoryId: row.sub_cat_id,
    title: row.title,
    slug: row.slug,
    durationDays: row.duration_days,
    durationNights: row.duration_nights ?? undefined,
    shortDescription: row.short_desc ?? undefined,
    longDescription: row.long_desc ?? undefined,
    image: row.image ?? undefined,
    basePriceUSD: row.base_price_usd != null ? Number(row.base_price_usd) : undefined,
    basePriceEUR: row.base_price_eur != null ? Number(row.base_price_eur) : undefined,
    highlights: Array.isArray(row.highlights) ? row.highlights : undefined,
    inclusions: Array.isArray(row.inclusions) ? row.inclusions : [],
    exclusions: Array.isArray(row.exclusions) ? row.exclusions : [],
    itinerary: Array.isArray(row.itinerary) ? (row.itinerary as any) : [],
    tags: Array.isArray(row.tags) ? row.tags : undefined,
    isPopular: Boolean(row.is_popular),
  };
}

function mainCatToRow(m: MainCategory, scrapedAt: string) {
  return {
    id: m.id,
    name: m.name,
    slug: m.slug,
    description: m.description ?? null,
    image: m.image ?? null,
    scraped_at: scrapedAt,
  };
}

function rowToMainCat(row: any): MainCategory {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description ?? undefined,
    icon: row.icon ?? undefined,
    image: row.image ?? undefined,
  };
}

function subCatToRow(s: SubCategory, scrapedAt: string) {
  return {
    id: s.id,
    main_cat_id: s.mainCategoryId,
    name: s.name,
    slug: s.slug,
    description: s.description ?? null,
    image: (s as any).image ?? null,
    scraped_at: scrapedAt,
  };
}

function rowToSubCat(row: any): SubCategory {
  return {
    id: row.id,
    mainCategoryId: row.main_cat_id,
    name: row.name,
    slug: row.slug,
    description: row.description ?? undefined,
  };
}

export async function readCache(): Promise<CachedData | null> {
  const supabase = createClient();

  try {
    const [mainRes, subRes, toursRes, metaRes] = await Promise.all([
      supabase.from("cached_main_categories").select("*"),
      supabase.from("cached_sub_categories").select("*"),
      supabase.from("cached_tours").select("*"),
      supabase.from("cache_meta").select("*").limit(1).maybeSingle(),
    ]);

    // Detect missing-table errors (PGRST205) and fall back to the file cache
    const tablesMissing =
      (mainRes.error && /PGRST205/i.test(mainRes.error.message || "")) ||
      (subRes.error && /PGRST205/i.test(subRes.error.message || "")) ||
      (toursRes.error && /PGRST205/i.test(toursRes.error.message || ""));

    if (tablesMissing) {
      return await readFileCache();
    }

    const mainCategories = (mainRes.data || []).map(rowToMainCat);
    const subCategories = (subRes.data || []).map(rowToSubCat);
    const tours = (toursRes.data || []).map(rowToTour);

    // Supabase reachable but empty — prefer file cache if it has data
    if (tours.length === 0) {
      const fileData = await readFileCache();
      if (fileData && fileData.tours.length > 0) return fileData;
    }

    const metaAny: any = metaRes.data;
    const scrapedAt = metaAny?.value?.last_full_scrape_at
      ? new Date(metaAny.value.last_full_scrape_at).toISOString()
      : metaAny?.last_full_scrape_at
      ? new Date(metaAny.last_full_scrape_at).toISOString()
      : null;
    const source = metaAny?.value?.source || metaAny?.source || "cache";

    const result: CachedData = {
      tours,
      mainCategories,
      subCategories,
      scrapedAt,
      source,
      stats: {
        mainCategories: mainCategories.length,
        subCategories: subCategories.length,
        toursTotal: tours.length,
        withDetails: tours.filter(
          (t) => t.longDescription && t.itinerary && t.itinerary.length > 0
        ).length,
      },
    };

    return result;
  } catch (e: any) {
    console.error("Supabase readCache error:", e?.message || e);
    return await readFileCache();
  }
}

export interface WriteCacheInput {
  tours: Tour[];
  scrapedAt?: string;
  source: string;
  stats?: CachedData["stats"];
  mainCategories?: MainCategory[];
  subCategories?: SubCategory[];
}

export async function writeCache(data: WriteCacheInput): Promise<void> {
  const supabase = createClient();
  const scrapedAt = data.scrapedAt || new Date().toISOString();
  const nowISO = scrapedAt;

  // Always mirror to the file cache first (guaranteed persistence locally)
  await writeFileCacheFile({
    tours: data.tours,
    mainCategories: data.mainCategories || [],
    subCategories: data.subCategories || [],
    scrapedAt,
    source: data.source,
    stats: data.stats,
  });

  const mainRows = (data.mainCategories || []).map((m) =>
    mainCatToRow(m, nowISO)
  );
  const subRows = (data.subCategories || []).map((s) =>
    subCatToRow(s, nowISO)
  );
  const tourRows = data.tours.map((t) => tourToRow(t, nowISO));

  const skipErr = (e: { message?: string } | null) =>
    !e || /PGRST205/i.test(e.message || "");

  const { error: delToursErr } = await supabase
    .from("cached_tours")
    .delete()
    .neq("id", "__none__");
  if (!skipErr(delToursErr)) console.error("delete cached_tours error:", delToursErr);

  const { error: delSubErr } = await supabase
    .from("cached_sub_categories")
    .delete()
    .neq("id", "__none__");
  if (!skipErr(delSubErr)) console.error("delete cached_sub_categories error:", delSubErr);

  const { error: delMainErr } = await supabase
    .from("cached_main_categories")
    .delete()
    .neq("id", "__none__");
  if (!skipErr(delMainErr)) console.error("delete cached_main_categories error:", delMainErr);

  if (mainRows.length > 0) {
    const { error: insMainErr } = await supabase
      .from("cached_main_categories")
      .insert(mainRows);
    if (!skipErr(insMainErr)) console.error("insert cached_main_categories error:", insMainErr);
  }

  if (subRows.length > 0) {
    const { error: insSubErr } = await supabase
      .from("cached_sub_categories")
      .insert(subRows);
    if (!skipErr(insSubErr)) console.error("insert cached_sub_categories error:", insSubErr);
  }

  if (tourRows.length > 0) {
    const batchSize = 500;
    for (let i = 0; i < tourRows.length; i += batchSize) {
      const batch = tourRows.slice(i, i + batchSize);
      const { error: insToursErr } = await supabase
        .from("cached_tours")
        .insert(batch);
      if (!skipErr(insToursErr)) console.error("insert cached_tours batch error:", insToursErr);
    }
  }

  const { error: upsertMetaErr } = await supabase.from("cache_meta").upsert(
    {
      key: "global",
      value: { last_full_scrape_at: nowISO, source: data.source },
      updated_at: nowISO,
    },
    { onConflict: "key" }
  );
  if (!skipErr(upsertMetaErr)) console.error("upsert cache_meta error:", upsertMetaErr);
}

export async function clearCache(): Promise<void> {
  const supabase = createClient();
  await supabase.from("cached_tours").delete().neq("id", "__none__");
  await supabase.from("cached_sub_categories").delete().neq("id", "__none__");
  await supabase.from("cached_main_categories").delete().neq("id", "__none__");
  await supabase.from("cache_meta").delete().neq("key", "__none__");
  try {
    await fs.unlink(CACHE_FILE);
  } catch {
    // file may not exist
  }
}
