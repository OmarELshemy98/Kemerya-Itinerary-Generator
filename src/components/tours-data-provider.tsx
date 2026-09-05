"use client";

import * as React from "react";
import type { Tour, MainCategory, SubCategory } from "@/types";
import {
  TOURS as FALLBACK_TOURS,
  MAIN_CATEGORIES as FALLBACK_MAIN,
  SUB_CATEGORIES as FALLBACK_SUB,
} from "@/data/tours";

export interface ToursDataState {
  tours: Tour[];
  mainCategories: MainCategory[];
  subCategories: SubCategory[];
  source: "fallback" | "cache" | "website";
  scrapedAt: string | null;
  stats: any | null;
  loading: boolean;
  lastRefreshed: Date | null;
  error: string | null;
}

export interface ToursDataContextValue extends ToursDataState {
  refresh: (options?: { forceScrape?: boolean }) => Promise<void>;
  triggerFullScrape: (options?: {
    maxToursPerSub?: number;
    skipDetails?: boolean;
  }) => Promise<{ ok: boolean; error?: string }>;
  getTourById: (id: string) => Tour | undefined;
  getToursBySubCategory: (subCategoryId: string) => Tour[];
  searchTours: (query: string) => Tour[];
  getSubCategoriesByMain: (mainCategoryId: string) => SubCategory[];
  getMainCategoryById: (id: string) => MainCategory | undefined;
  getSubCategoryById: (id: string) => SubCategory | undefined;
}

const initialState: ToursDataState = {
  tours: FALLBACK_TOURS,
  mainCategories: FALLBACK_MAIN,
  subCategories: FALLBACK_SUB,
  source: "fallback",
  scrapedAt: null,
  stats: null,
  loading: false,
  lastRefreshed: null,
  error: null,
};

const ToursDataContext =
  React.createContext<ToursDataContextValue | null>(null);

export function useToursData() {
  const ctx = React.useContext(ToursDataContext);
  if (!ctx) {
    throw new Error("useToursData must be used within ToursDataProvider");
  }
  return ctx;
}

export function ToursDataProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [state, setState] = React.useState<ToursDataState>(initialState);
  const initializedRef = React.useRef(false);

  const refresh = React.useCallback(async (opts?: { forceScrape?: boolean }) => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const res = await fetch("/api/tours", { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (json.ok) {
        setState({
          tours: json.tours || FALLBACK_TOURS,
          mainCategories: json.mainCategories || FALLBACK_MAIN,
          subCategories: json.subCategories || FALLBACK_SUB,
          source: json.source || "fallback",
          scrapedAt: json.scrapedAt || null,
          stats: json.stats || null,
          loading: false,
          lastRefreshed: new Date(),
          error: null,
        });
        return;
      }
      throw new Error(json.error || "Unknown error");
    } catch (e: any) {
      setState((s) => ({
        ...s,
        loading: false,
        error: String(e?.message || e),
      }));
    }
  }, []);

  const triggerFullScrape = React.useCallback(
    async (opts?: { maxToursPerSub?: number; skipDetails?: boolean }) => {
      setState((s) => ({ ...s, loading: true, error: null }));
      try {
        const res = await fetch("/api/scrape", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            maxToursPerSub: opts?.maxToursPerSub ?? 20,
            skipDetails: Boolean(opts?.skipDetails),
          }),
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok) {
          const err = json?.error || `HTTP ${res.status}`;
          setState((s) => ({ ...s, loading: false, error: err }));
          return { ok: false, error: err };
        }
        await refresh();
        return { ok: true };
      } catch (e: any) {
        const err = String(e?.message || e);
        setState((s) => ({ ...s, loading: false, error: err }));
        return { ok: false, error: err };
      }
    },
    [refresh]
  );

  React.useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value: ToursDataContextValue = React.useMemo(() => {
    const getTourById = (id: string) =>
      state.tours.find((t) => t.id === id);
    const getToursBySubCategory = (subCategoryId: string) =>
      state.tours.filter((t) => t.subCategoryId === subCategoryId);
    const searchTours = (query: string) => {
      const q = query.toLowerCase().trim();
      if (!q) return [];
      return state.tours
        .filter(
          (t) =>
            t.title.toLowerCase().includes(q) ||
            t.shortDescription?.toLowerCase().includes(q) ||
            t.tags?.some((tag) => tag.toLowerCase().includes(q))
        )
        .slice(0, 20);
    };
    const getSubCategoriesByMain = (mainCategoryId: string) =>
      state.subCategories.filter((s) => s.mainCategoryId === mainCategoryId);
    const getMainCategoryById = (id: string) =>
      state.mainCategories.find((m) => m.id === id);
    const getSubCategoryById = (id: string) =>
      state.subCategories.find((s) => s.id === id);

    return {
      ...state,
      refresh,
      triggerFullScrape,
      getTourById,
      getToursBySubCategory,
      searchTours,
      getSubCategoriesByMain,
      getMainCategoryById,
      getSubCategoryById,
    };
  }, [state, refresh, triggerFullScrape]);

  return (
    <ToursDataContext.Provider value={value}>
      {children}
    </ToursDataContext.Provider>
  );
}
