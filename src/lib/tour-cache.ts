import type { Tour, MainCategory, SubCategory } from "@/types";
import { createClient } from "@/lib/supabase/server";
import { getServiceSupabase } from "@/lib/supabase";
import { promises as fs } from "fs";
import path from "path";

// Data is cached in Supabase (cached_main_categories / cached_sub_categories /
// cached_tours / cache_meta). If those tables don't exist (or RLS blocks them),
// we transparently fall back to a JSON file on disk so the app keeps working.
//
// IMPORTANT (dynamic sync strategy): instead of delete-all + reinsert, we MERGE:
//  - Tours coming from the website are upserted (prices/content always refreshed)
//  - Tours manually added by admins (ids starting with "tour_") are NEVER touched
//  - Website tours that disappeared from the site get archived (removed from cache)
//    only if they were not manually pinned/edited

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
    prices_table: t.pricesTable ?? null,
    highlights: t.highlights ?? [],
    inclusions: t.inclusions ?? [],
    exclusions: t.exclusions ?? [],
    itinerary: t.itinerary ?? [],
    tags: t.tags ?? [],
    is_popular: Boolean(t.isPopular),
    scraped_at: scrapedAt,
    updated_at: scrapedAt,
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
    pricesTable: Array.isArray(row.prices_table)
      ? row.prices_table.map((r: any) => ({
          personsLabel: r.personsLabel,
          priceUSD: Number(r.priceUSD),
        }))
      : undefined,
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
    icon: m.icon ?? null,
    image: m.image ?? null,
    scraped_at: scrapedAt,
    updated_at: scrapedAt,
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
    updated_at: scrapedAt,
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

/** Merge file-cache tours with Supabase rows so manual tours survive in file mode too */
function mergeTours(supabaseTours: Tour[], fileTours: Tour[] | null): Tour[] {
  if (!fileTours || fileTours.length === 0) return supabaseTours;
  const byId = new Map<string, Tour>();
  for (const t of supabaseTours) byId.set(t.id, t);
  for (const t of fileTours) {
    if (!byId.has(t.id)) byId.set(t.id, t);
  }
  return Array.from(byId.values());
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
    const supabaseTours = (toursRes.data || []).map(rowToTour);
    const fileData = await readFileCache();

    // Merge: Supabase rows + file cache (so tours only present in the file survive)
    const tours = mergeTours(supabaseTours, fileData?.tours ?? null);

    // Merge categories as well (manual categories live in DB, discovered in file)
    const mcById = new Map(mainCategories.map((m) => [m.id, m]));
    for (const m of fileData?.mainCategories || []) {
      if (!mcById.has(m.id)) mcById.set(m.id, m);
    }
    const scById = new Map(subCategories.map((s) => [s.id, s]));
    for (const s of fileData?.subCategories || []) {
      if (!scById.has(s.id)) scById.set(s.id, s);
    }

    if (tours.length === 0 && fileData && fileData.tours.length > 0) {
      return fileData;
    }

    const finalMainCats = Array.from(mcById.values());
    const finalSubCats = Array.from(scById.values());

    const metaAny: any = metaRes.data;
    const scrapedAt = metaAny?.value?.last_full_scrape_at
      ? new Date(metaAny.value.last_full_scrape_at).toISOString()
      : metaAny?.last_full_scrape_at
      ? new Date(metaAny.last_full_scrape_at).toISOString()
      : fileData?.scrapedAt ?? null;
    const source = metaAny?.value?.source || metaAny?.source || fileData?.source || "cache";

    const result: CachedData = {
      tours,
      mainCategories: finalMainCats.length ? finalMainCats : fileData?.mainCategories || [],
      subCategories: finalSubCats.length ? finalSubCats : fileData?.subCategories || [],
      scrapedAt,
      source,
      stats: {
        mainCategories: finalMainCats.length || fileData?.mainCategories.length || 0,
        subCategories: finalSubCats.length || fileData?.subCategories.length || 0,
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
  /** Set false to append-only (keep stale website tours). Default: full sync */
  replaceWebsiteTours?: boolean;
}

async function getToursClient() {
  // Prefer service role so RLS never blocks cache writes/reads of cached tables
  const { getServiceSupabase } = await import("@/lib/supabase");
  const service = getServiceSupabase();
  return service ?? supabaseFallback();
}

// helper to reuse the server cookie client if service key missing
function supabaseFallback() {
  return createClient();
}

export async function writeCache(data: WriteCacheInput): Promise<void> {
  const supabase = await getToursClient();
  const scrapedAt = data.scrapedAt || new Date().toISOString();
  const nowISO = scrapedAt;

  const existingToursRes = await supabase
    .from("cached_tours")
    .select("id, is_manual, base_price_usd, title");
  const existingRows: any[] = existingToursRes.data || [];

  // Manual tours (created by admins) must never be overwritten or deleted.
  // Anything not produced by the scraper (id not starting with "tour-web-")
  // or explicitly flagged is_manual is treated as manual.
  const manualIds = new Set<string>();
  for (const r of existingRows) {
    if (r.is_manual || !String(r.id).startsWith("tour-web-")) {
      manualIds.add(r.id);
    }
  }

  // Price-change tracking (audit)
  const priceAudit: { id: string; oldPrice: any; newPrice: any }[] = [];
  const oldPriceById = new Map(existingRows.map((r) => [r.id, r.base_price_usd]));

  const incoming = data.tours.filter((t) => !manualIds.has(t.id));
  for (const t of incoming) {
    const old = oldPriceById.get(t.id);
    if (old != null && t.basePriceUSD != null && Number(old) !== Number(t.basePriceUSD)) {
      priceAudit.push({ id: t.id, oldPrice: Number(old), newPrice: t.basePriceUSD });
    }
  }

  // Merge with manual tours for the file mirror
  const manualTours: Tour[] = [];
  const fileData = await readFileCache();
  for (const t of fileData?.tours || []) {
    if (manualIds.has(t.id)) manualTours.push(t);
  }
  for (const id of manualIds) {
    if (manualTours.some((t) => t.id === id)) continue;
    if (fileData?.tours.some((t) => t.id === id)) continue;
    // manual tour exists in DB but not file — fetch minimal row later (skip; DB is source of truth)
  }

  const mergedFileTours = [...incoming, ...manualTours];

  // Always mirror to the file cache first (guaranteed persistence locally)
  await writeFileCacheFile({
    tours: mergedFileTours,
    mainCategories: data.mainCategories || fileData?.mainCategories || [],
    subCategories: data.subCategories || fileData?.subCategories || [],
    scrapedAt,
    source: data.source,
    stats: data.stats,
  });

  const mainRows = (data.mainCategories || []).map((m) => mainCatToRow(m, nowISO));
  const subRows = (data.subCategories || []).map((s) => subCatToRow(s, nowISO));
  const tourRows = incoming.map((t) => tourToRow(t, nowISO));

  const skipErr = (e: { message?: string } | null) =>
    !e || /PGRST205/i.test(e.message || "");

  // ---- MERGE: upsert main categories (never delete manual ones) ----
  if (mainRows.length > 0) {
    const { error: upMainErr } = await supabase
      .from("cached_main_categories")
      .upsert(mainRows, { onConflict: "id" });
    if (!skipErr(upMainErr)) console.error("upsert cached_main_categories error:", upMainErr);
  }

  // ---- MERGE: upsert sub categories ----
  if (subRows.length > 0) {
    const { error: upSubErr } = await supabase
      .from("cached_sub_categories")
      .upsert(subRows, { onConflict: "id" });
    if (!skipErr(upSubErr)) console.error("upsert cached_sub_categories error:", upSubErr);
  }

  // ---- MERGE: upsert website tours (prices/content always refreshed) ----
  if (tourRows.length > 0) {
    const batchSize = 500;
    for (let i = 0; i < tourRows.length; i += batchSize) {
      const batch = tourRows.slice(i, i + batchSize);
      const { error: upToursErr } = await supabase
        .from("cached_tours")
        .upsert(batch, { onConflict: "id" });
      if (!skipErr(upToursErr)) console.error("upsert cached_tours batch error:", upToursErr);
    }
  }

  // ---- Archive website tours that disappeared from the site ----
  if (data.replaceWebsiteTours !== false && incoming.length > 0) {
    const incomingIds = new Set(incoming.map((t) => t.id));
    const staleWebsiteIds = existingRows
      .filter((r) => String(r.id).startsWith("tour-web-") && !incomingIds.has(r.id))
      .map((r) => r.id);
    for (let i = 0; i < staleWebsiteIds.length; i += 500) {
      const batch = staleWebsiteIds.slice(i, i + 500);
      const { error: delErr } = await supabase
        .from("cached_tours")
        .delete()
        .in("id", batch);
      if (!skipErr(delErr)) console.error("delete stale tours error:", delErr);
    }
  }

  // ---- Log price changes into audit_log (best-effort) ----
  if (priceAudit.length > 0) {
    try {
      await supabase.from("audit_log").insert(
        priceAudit.slice(0, 50).map((p) => ({
          action: "tour_price_changed",
          details: p,
        }))
      );
    } catch {
      // audit_log may not exist or RLS may block; ignore
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
  const supabase = await getToursClient();
  // Only clear website-scraped rows; manual entries (tour_*) are preserved
  await supabase.from("cached_tours").delete().like("id", "tour-web-%");
  await supabase.from("cached_sub_categories").delete().like("id", "scraped-%");
  await supabase.from("cache_meta").delete().neq("key", "__none__");
  try {
    await fs.unlink(CACHE_FILE);
  } catch {
    // file may not exist
  }
}