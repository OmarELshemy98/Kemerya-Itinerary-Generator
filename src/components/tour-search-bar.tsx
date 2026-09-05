"use client";

import * as React from "react";
import { Search, MapPin, X } from "lucide-react";
import { searchTours, getSubCategoryById, getMainCategoryById } from "@/data/tours";
import type { Tour } from "@/types";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface TourSearchBarProps {
  onTourSelect: (tour: Tour) => void;
  placeholder?: string;
  className?: string;
}

export function TourSearchBar({
  onTourSelect,
  placeholder = "Search tours by title... (e.g. Pyramids, Nile Cruise)",
  className,
}: TourSearchBarProps) {
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<Tour[]>([]);
  const [isOpen, setIsOpen] = React.useState(false);
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const wrapperRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  React.useEffect(() => {
    if (query.trim().length >= 2) {
      const data = searchTours(query);
      setResults(data);
      setSelectedIndex(0);
      setIsOpen(true);
    } else {
      setResults([]);
      setIsOpen(false);
    }
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && results[selectedIndex]) {
      e.preventDefault();
      handleSelect(results[selectedIndex]);
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  const handleSelect = (tour: Tour) => {
    setQuery("");
    setResults([]);
    setIsOpen(false);
    onTourSelect(tour);
  };

  const clearQuery = () => {
    setQuery("");
    setResults([]);
    setIsOpen(false);
  };

  return (
    <div
      ref={wrapperRef}
      className={cn("relative w-full", className)}
    >
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (results.length > 0) setIsOpen(true);
          }}
          placeholder={placeholder}
          className="h-12 w-full rounded-xl border-slate-200 bg-white pl-10 pr-10 text-base shadow-sm focus:border-[#C9A962] focus:ring-[#C9A962]"
        />
        {query && (
          <button
            type="button"
            onClick={clearQuery}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute z-50 mt-2 max-h-[480px] w-full overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-2xl">
          <div className="border-b border-slate-100 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
            {results.length} tour{results.length !== 1 ? "s" : ""} found
          </div>
          <ul className="p-2">
            {results.map((tour, idx) => {
              const subCat = getSubCategoryById(tour.subCategoryId);
              const mainCat = getMainCategoryById(tour.mainCategoryId);
              return (
                <li key={tour.id}>
                  <button
                    type="button"
                    onClick={() => handleSelect(tour)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={cn(
                      "flex w-full flex-col gap-1 rounded-lg px-3 py-3 text-left transition-colors",
                      idx === selectedIndex
                        ? "bg-[#C9A962]/10"
                        : "hover:bg-slate-50"
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-semibold text-slate-900">
                        {tour.title}
                      </span>
                      {tour.isPopular && (
                        <Badge variant="gold" className="shrink-0">
                          Popular
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <MapPin className="h-3 w-3" />
                      <span>{mainCat?.name}</span>
                      {subCat && (
                        <>
                          <span className="text-slate-300">/</span>
                          <span>{subCat.name}</span>
                        </>
                      )}
                      <span className="text-slate-300">•</span>
                      <span>
                        {tour.durationDays} day
                        {tour.durationDays !== 1 ? "s" : ""}
                      </span>
                    </div>
                    {tour.shortDescription && (
                      <p className="line-clamp-1 text-xs text-slate-500">
                        {tour.shortDescription}
                      </p>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {isOpen && query.trim().length >= 2 && results.length === 0 && (
        <div className="absolute z-50 mt-2 w-full rounded-xl border border-slate-200 bg-white p-6 text-center shadow-2xl">
          <Search className="mx-auto mb-2 h-8 w-8 text-slate-300" />
          <p className="text-sm font-medium text-slate-700">No tours found</p>
          <p className="mt-1 text-xs text-slate-500">
            Try using different keywords, or switch to Custom Tour mode.
          </p>
        </div>
      )}
    </div>
  );
}
