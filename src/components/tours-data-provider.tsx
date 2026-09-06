"use client";

import * as React from "react";
import type { Tour, MainCategory, SubCategory } from "@/types";

export interface ToursDataState {
  tours: Tour[];
  mainCategories: MainCategory[];
  subCategories: SubCategory[];
  source: "loading" | "fallback" | "cache" | "website";
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

  addCategory: (payload: Partial<MainCategory> & { name: string }) => Promise<{ ok: boolean; category?: MainCategory; error?: string }>;
  updateCategory: (id: string, payload: Partial<MainCategory>) => Promise<{ ok: boolean; category?: MainCategory; error?: string }>;
  deleteCategory: (id: string) => Promise<{ ok: boolean; error?: string }>;

  addSubCategory: (payload: Partial<SubCategory> & { name: string; mainCategoryId: string }) => Promise<{ ok: boolean; subCategory?: SubCategory; error?: string }>;
  updateSubCategory: (id: string, payload: Partial<SubCategory> & { mainCategoryId?: string }) => Promise<{ ok: boolean; subCategory?: SubCategory; error?: string }>;
  deleteSubCategory: (id: string) => Promise<{ ok: boolean; error?: string }>;

  addTour: (payload: Partial<Tour> & { title: string; mainCategoryId: string; subCategoryId: string; durationDays: number }) => Promise<{ ok: boolean; tour?: Tour; error?: string }>;
  updateTour: (id: string, payload: Partial<Tour>) => Promise<{ ok: boolean; tour?: Tour; error?: string }>;
  deleteTour: (id: string) => Promise<{ ok: boolean; error?: string }>;
}

const initialState: ToursDataState = {
  tours: [],
  mainCategories: [],
  subCategories: [],
  source: "loading",
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
        const isEmpty = !json.tours || json.tours.length === 0;
        const isFallbackEmpty = isEmpty && json.source === "fallback";

        if (isFallbackEmpty) {
          setState({
            tours: [],
            mainCategories: [],
            subCategories: [],
            source: json.source || "fallback",
            scrapedAt: json.scrapedAt || null,
            stats: json.stats || null,
            loading: false,
            lastRefreshed: new Date(),
            error: "No data synced. Please trigger a full scrape to load data.",
          });
        } else {
          setState({
            tours: json.tours || [],
            mainCategories: json.mainCategories || [],
            subCategories: json.subCategories || [],
            source: json.source || "cache",
            scrapedAt: json.scrapedAt || null,
            stats: json.stats || null,
            loading: false,
            lastRefreshed: new Date(),
            error: null,
          });
        }
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

  const addCategory = React.useCallback(
    async (payload: Partial<MainCategory> & { name: string }) => {
      try {
        const res = await fetch("/api/admin/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok || !json.ok) {
          return { ok: false, error: json.error || `HTTP ${res.status}` };
        }
        await refresh();
        return { ok: true, category: json.category };
      } catch (e: any) {
        return { ok: false, error: String(e?.message || e) };
      }
    },
    [refresh]
  );

  const updateCategory = React.useCallback(
    async (id: string, payload: Partial<MainCategory>) => {
      try {
        const res = await fetch(`/api/admin/categories/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok || !json.ok) {
          return { ok: false, error: json.error || `HTTP ${res.status}` };
        }
        await refresh();
        return { ok: true, category: json.category };
      } catch (e: any) {
        return { ok: false, error: String(e?.message || e) };
      }
    },
    [refresh]
  );

  const deleteCategory = React.useCallback(
    async (id: string) => {
      try {
        const res = await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
        const json = await res.json().catch(() => ({}));
        if (!res.ok || !json.ok) {
          return { ok: false, error: json.error || `HTTP ${res.status}` };
        }
        await refresh();
        return { ok: true };
      } catch (e: any) {
        return { ok: false, error: String(e?.message || e) };
      }
    },
    [refresh]
  );

  const addSubCategory = React.useCallback(
    async (
      payload: Partial<SubCategory> & { name: string; mainCategoryId: string }
    ) => {
      try {
        const res = await fetch("/api/admin/subcategories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok || !json.ok) {
          return { ok: false, error: json.error || `HTTP ${res.status}` };
        }
        await refresh();
        return { ok: true, subCategory: json.subCategory };
      } catch (e: any) {
        return { ok: false, error: String(e?.message || e) };
      }
    },
    [refresh]
  );

  const updateSubCategory = React.useCallback(
    async (id: string, payload: Partial<SubCategory> & { mainCategoryId?: string }) => {
      try {
        const res = await fetch(`/api/admin/subcategories/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok || !json.ok) {
          return { ok: false, error: json.error || `HTTP ${res.status}` };
        }
        await refresh();
        return { ok: true, subCategory: json.subCategory };
      } catch (e: any) {
        return { ok: false, error: String(e?.message || e) };
      }
    },
    [refresh]
  );

  const deleteSubCategory = React.useCallback(
    async (id: string) => {
      try {
        const res = await fetch(`/api/admin/subcategories/${id}`, { method: "DELETE" });
        const json = await res.json().catch(() => ({}));
        if (!res.ok || !json.ok) {
          return { ok: false, error: json.error || `HTTP ${res.status}` };
        }
        await refresh();
        return { ok: true };
      } catch (e: any) {
        return { ok: false, error: String(e?.message || e) };
      }
    },
    [refresh]
  );

  const addTour = React.useCallback(
    async (
      payload: Partial<Tour> & {
        title: string;
        mainCategoryId: string;
        subCategoryId: string;
        durationDays: number;
      }
    ) => {
      try {
        const res = await fetch("/api/admin/tours", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok || !json.ok) {
          return { ok: false, error: json.error || `HTTP ${res.status}` };
        }
        await refresh();
        return { ok: true, tour: json.tour };
      } catch (e: any) {
        return { ok: false, error: String(e?.message || e) };
      }
    },
    [refresh]
  );

  const updateTour = React.useCallback(
    async (id: string, payload: Partial<Tour>) => {
      try {
        const res = await fetch(`/api/admin/tours/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok || !json.ok) {
          return { ok: false, error: json.error || `HTTP ${res.status}` };
        }
        await refresh();
        return { ok: true, tour: json.tour };
      } catch (e: any) {
        return { ok: false, error: String(e?.message || e) };
      }
    },
    [refresh]
  );

  const deleteTour = React.useCallback(
    async (id: string) => {
      try {
        const res = await fetch(`/api/admin/tours/${id}`, { method: "DELETE" });
        const json = await res.json().catch(() => ({}));
        if (!res.ok || !json.ok) {
          return { ok: false, error: json.error || `HTTP ${res.status}` };
        }
        await refresh();
        return { ok: true };
      } catch (e: any) {
        return { ok: false, error: String(e?.message || e) };
      }
    },
    [refresh]
  );

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
      addCategory,
      updateCategory,
      deleteCategory,
      addSubCategory,
      updateSubCategory,
      deleteSubCategory,
      addTour,
      updateTour,
      deleteTour,
    };
  }, [
    state,
    refresh,
    triggerFullScrape,
    addCategory,
    updateCategory,
    deleteCategory,
    addSubCategory,
    updateSubCategory,
    deleteSubCategory,
    addTour,
    updateTour,
    deleteTour,
  ]);

  return (
    <ToursDataContext.Provider value={value}>
      {children}
    </ToursDataContext.Provider>
  );
}
