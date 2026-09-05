"use client";

import * as React from "react";
import {
  Landmark,
  Ship,
  Package,
  Building2,
  Umbrella,
  Anchor,
  Mountain,
  Sparkles,
  ChevronRight,
  MapPin,
  Clock,
  Euro,
  Check,
} from "lucide-react";
import {
  MAIN_CATEGORIES,
  getSubCategoriesByMain,
  getToursBySubCategory,
  getMainCategoryById,
  getSubCategoryById,
} from "@/data/tours";
import type { Tour, MainCategory, SubCategory } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn, formatCurrency } from "@/lib/utils";

const ICON_MAP: Record<string, any> = {
  Landmark,
  Ship,
  Package,
  Building2,
  Umbrella,
  Anchor,
  Mountain,
  Sparkles,
};

interface HierarchicalCategorySelectorProps {
  onTourSelect: (tour: Tour) => void;
  selectedTourId?: string;
}

type Stage = "main" | "sub" | "tours";

export function HierarchicalCategorySelector({
  onTourSelect,
  selectedTourId,
}: HierarchicalCategorySelectorProps) {
  const [stage, setStage] = React.useState<Stage>("main");
  const [selectedMainId, setSelectedMainId] = React.useState<string | null>(null);
  const [selectedSubId, setSelectedSubId] = React.useState<string | null>(null);
  const [tours, setTours] = React.useState<Tour[]>([]);

  const mainCategories = MAIN_CATEGORIES;
  const subCategories = React.useMemo(
    () => (selectedMainId ? getSubCategoriesByMain(selectedMainId) : []),
    [selectedMainId]
  );

  React.useEffect(() => {
    if (selectedSubId) {
      setTours(getToursBySubCategory(selectedSubId));
    }
  }, [selectedSubId]);

  const handleMainSelect = (id: string) => {
    setSelectedMainId(id);
    setSelectedSubId(null);
    setTours([]);
    setStage("sub");
  };

  const handleSubSelect = (id: string) => {
    setSelectedSubId(id);
    setStage("tours");
  };

  const handleBack = (to: Stage) => {
    if (to === "main") {
      setSelectedMainId(null);
      setSelectedSubId(null);
      setTours([]);
      setStage("main");
    } else if (to === "sub") {
      setSelectedSubId(null);
      setTours([]);
      setStage("sub");
    }
  };

  const selectedMain = selectedMainId ? (getMainCategoryById(selectedMainId) ?? null) : null;
  const selectedSub = selectedSubId ? (getSubCategoryById(selectedSubId) ?? null) : null;

  return (
    <Card className="border-slate-200 bg-white/60 backdrop-blur">
      <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl text-slate-900">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#C9A962]/15 text-[#C9A962]">
                <Landmark className="h-4 w-4" />
              </span>
              Browse Tours Catalog
            </CardTitle>
            <CardDescription className="mt-1">
              Choose a category, then sub-category to view available tours
            </CardDescription>
          </div>
          <div className="hidden items-center gap-2 text-xs sm:flex">
            <Badge
              variant={stage === "main" ? "gold" : "outline"}
              className={cn(
                "rounded-md px-2.5 py-1",
                stage === "main" ? "" : "text-slate-400"
              )}
            >
              1. Categories
            </Badge>
            <ChevronRight className="h-3 w-3 text-slate-300" />
            <Badge
              variant={stage === "sub" ? "gold" : "outline"}
              className={cn(
                "rounded-md px-2.5 py-1",
                stage === "sub" ? "" : "text-slate-400"
              )}
            >
              2. Sub-Categories
            </Badge>
            <ChevronRight className="h-3 w-3 text-slate-300" />
            <Badge
              variant={stage === "tours" ? "gold" : "outline"}
              className={cn(
                "rounded-md px-2.5 py-1",
                stage === "tours" ? "" : "text-slate-400"
              )}
            >
              3. Tours
            </Badge>
          </div>
        </div>

        {(stage === "sub" || stage === "tours") && (
          <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-slate-500">
            {stage === "sub" && selectedMain && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleBack("main")}
                className="h-7 px-2 text-xs"
              >
                ← Back to all Categories
              </Button>
            )}
            {stage === "tours" && (
              <>
                {selectedMain && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleBack("sub")}
                    className="h-7 px-2 text-xs"
                  >
                    ← {selectedMain.name}
                  </Button>
                )}
                <ChevronRight className="h-3 w-3 text-slate-300" />
                {selectedSub && (
                  <span className="font-medium text-slate-700">
                    {selectedSub.name}
                  </span>
                )}
              </>
            )}
          </div>
        )}
      </CardHeader>

      <CardContent className="p-4 sm:p-6">
        {stage === "main" && (
          <MainCategoryGrid
            categories={mainCategories}
            onSelect={handleMainSelect}
          />
        )}
        {stage === "sub" && (
          <SubCategoryList
            main={selectedMain}
            subCategories={subCategories}
            onSelect={handleSubSelect}
          />
        )}
        {stage === "tours" && (
          <ToursList
            tours={tours}
            onSelect={onTourSelect}
            selectedTourId={selectedTourId}
          />
        )}
      </CardContent>
    </Card>
  );
}

function MainCategoryGrid({
  categories,
  onSelect,
}: {
  categories: MainCategory[];
  onSelect: (id: string) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {categories.map((cat) => {
        const Icon = ICON_MAP[cat.icon || "Sparkles"] || Sparkles;
        const subsCount = getSubCategoriesByMain(cat.id).length;
        return (
          <button
            key={cat.id}
            type="button"
            onClick={() => onSelect(cat.id)}
            className="group flex flex-col items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 text-left transition-all hover:-translate-y-0.5 hover:border-[#C9A962]/60 hover:shadow-lg"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#C9A962]/10 text-[#C9A962] transition-colors group-hover:bg-[#C9A962] group-hover:text-white">
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 group-hover:text-[#8b7435]">
                {cat.name}
              </h3>
              <p className="mt-0.5 line-clamp-2 text-xs text-slate-500">
                {cat.description}
              </p>
              <div className="mt-2 text-xs font-medium text-slate-400">
                {subsCount} subcategor
                {subsCount === 1 ? "y" : "ies"}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

function SubCategoryList({
  main,
  subCategories,
  onSelect,
}: {
  main: MainCategory | null;
  subCategories: SubCategory[];
  onSelect: (id: string) => void;
}) {
  return (
    <div>
      <div className="mb-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
          {main?.name}
        </h3>
        <p className="mt-1 text-sm text-slate-500">
          Select a sub-category to see available tours
        </p>
      </div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {subCategories.map((sub) => {
          const count = getToursBySubCategory(sub.id).length;
          return (
            <button
              key={sub.id}
              type="button"
              onClick={() => onSelect(sub.id)}
              className="group flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 text-left transition-all hover:border-[#C9A962]/60 hover:bg-[#C9A962]/5"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-500 transition-colors group-hover:bg-[#C9A962] group-hover:text-white">
                  <MapPin className="h-4 w-4" />
                </div>
                <div>
                  <div className="font-semibold text-slate-900">
                    {sub.name}
                  </div>
                  {sub.description && (
                    <div className="mt-0.5 text-xs text-slate-500">
                      {sub.description}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {count} tour{count !== 1 ? "s" : ""}
                </Badge>
                <ChevronRight className="h-4 w-4 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-[#C9A962]" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ToursList({
  tours,
  onSelect,
  selectedTourId,
}: {
  tours: Tour[];
  onSelect: (tour: Tour) => void;
  selectedTourId?: string;
}) {
  if (tours.length === 0) {
    return (
      <div className="py-12 text-center">
        <MapPin className="mx-auto mb-2 h-10 w-10 text-slate-300" />
        <h4 className="text-sm font-medium text-slate-700">No tours yet</h4>
        <p className="mt-1 text-xs text-slate-500">
          This sub-category will be populated soon.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
            Available Tours
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            {tours.length} tour{tours.length !== 1 ? "s" : ""} to choose from
          </p>
        </div>
      </div>
      <Separator className="mb-4" />
      <div className="space-y-3">
        {tours.map((tour) => {
          const isSelected = tour.id === selectedTourId;
          return (
            <div
              key={tour.id}
              className={cn(
                "group relative flex flex-col gap-3 rounded-xl border p-4 transition-all sm:flex-row sm:items-center sm:justify-between",
                isSelected
                  ? "border-[#C9A962] bg-[#C9A962]/5 shadow-sm"
                  : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
              )}
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="truncate font-semibold text-slate-900 sm:text-base">
                    {tour.title}
                  </h4>
                  {tour.tags?.slice(0, 2).map((t) => (
                    <Badge key={t} variant="gold" className="text-[10px]">
                      {t}
                    </Badge>
                  ))}
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {tour.durationDays} day{tour.durationDays !== 1 ? "s" : ""}
                    {tour.durationNights ? ` / ${tour.durationNights} nights` : ""}
                  </span>
                  <span className="flex items-center gap-1">
                    <Euro className="h-3.5 w-3.5" />
                    From {tour.basePriceEUR ? formatCurrency(tour.basePriceEUR, "EUR") : "—"}
                  </span>
                </div>
                {tour.shortDescription && (
                  <p className="mt-2 line-clamp-1 text-xs text-slate-500">
                    {tour.shortDescription}
                  </p>
                )}
              </div>
              <Button
                onClick={() => onSelect(tour)}
                size="sm"
                variant={isSelected ? "gold" : "outline-gold"}
                className="shrink-0"
              >
                {isSelected ? (
                  <>
                    <Check className="mr-1.5 h-4 w-4" />
                    Selected
                  </>
                ) : (
                  "Select Tour"
                )}
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
