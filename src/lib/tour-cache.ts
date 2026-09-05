import fs from "node:fs/promises";
import path from "node:path";
import type { Tour, MainCategory, SubCategory } from "@/types";
import { MAIN_CATEGORIES, SUB_CATEGORIES } from "@/data/tours";

export interface CachedData {
  tours: Tour[];
  scrapedAt: string;
  source: string;
  stats?: {
    mainCategories: number;
    subCategories: number;
    toursTotal: number;
    withDetails: number;
  };
  subCategories?: SubCategory[];
  mainCategories?: MainCategory[];
}

const CACHE_DIR = path.join(process.cwd(), "src", "data", "cache");
const CACHE_FILE = path.join(CACHE_DIR, "tours-cache.json");

export function getCachePaths() {
  return { CACHE_DIR, CACHE_FILE };
}

export async function ensureCacheDir(): Promise<void> {
  try {
    await fs.mkdir(CACHE_DIR, { recursive: true });
  } catch (e: any) {
    if (e?.code !== "EEXIST") throw e;
  }
}

export async function readCache(): Promise<CachedData | null> {
  try {
    const raw = await fs.readFile(CACHE_FILE, "utf-8");
    return JSON.parse(raw) as CachedData;
  } catch (e: any) {
    if (e?.code === "ENOENT") return null;
    return null;
  }
}

export async function writeCache(data: CachedData): Promise<void> {
  await ensureCacheDir();
  await fs.writeFile(CACHE_FILE, JSON.stringify(data, null, 2), "utf-8");
}

export async function clearCache(): Promise<void> {
  try {
    await fs.unlink(CACHE_FILE);
  } catch (e: any) {
    if (e?.code !== "ENOENT") throw e;
  }
}

export function mergeWithBaseData(cached: CachedData): {
  tours: Tour[];
  mainCategories: MainCategory[];
  subCategories: SubCategory[];
} {
  const mainCats: MainCategory[] = Array.from(new Set([...MAIN_CATEGORIES.map(m => m.id), ...(cached.mainCategories || []).map(m => m.id)])).map(id => {
    const fromBase = MAIN_CATEGORIES.find(x => x.id === id);
    const fromCache = (cached.mainCategories || []).find(x => x.id === id);
    return fromBase || fromCache!;
  }).filter(Boolean) as any;

  const subCats: SubCategory[] = Array.from(new Set([...SUB_CATEGORIES.map(s => s.id), ...(cached.subCategories || []).map(s => s.id)])).map(id => {
    const fromBase = SUB_CATEGORIES.find(x => x.id === id);
    const fromCache = (cached.subCategories || []).find(x => x.id === id);
    return fromBase || fromCache!;
  }).filter(Boolean) as any;

  return {
    tours: cached.tours || [],
    mainCategories: mainCats,
    subCategories: subCats,
  };
}
