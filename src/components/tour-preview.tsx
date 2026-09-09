"use client";

import * as React from "react";
import type { Tour } from "@/types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type TabId = "overview" | "itinerary" | "meeting" | "included" | "prices" | "notes";

/** Website-faithful tour preview: same anchors/sections as kemeryatours.com */
export function TourPreview({ tour }: { tour: Tour }) {
  const [tab, setTab] = React.useState<TabId>("overview");
  React.useEffect(() => {
    setTab("overview");
  }, [tour.id]);

  const overviewParas: string[] =
    tour.overview && tour.overview.length > 0
      ? tour.overview
      : tour.longDescription
        ? [tour.longDescription]
        : [];

  const tabs: { id: TabId; label: string }[] = [
    { id: "overview", label: "Overview" },
    { id: "itinerary", label: `Itinerary${tour.itinerary?.length ? ` (${tour.itinerary.length})` : ""}` },
    { id: "meeting", label: "Meeting Point" },
    { id: "included", label: "Included / Excluded" },
    { id: "prices", label: "Prices" },
    { id: "notes", label: "Trip Notes" },
  ];

  return (
    <div className="overflow-hidden rounded-xl border border-[#C9A962]/40 bg-white shadow-sm">
      {tour.galleryImages && tour.galleryImages.length > 0 ? (
        <div className="grid grid-cols-2 gap-1 bg-slate-100 sm:grid-cols-4">
          {tour.galleryImages.slice(0, 4).map((src, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={i} src={src} alt={`${tour.title} photo ${i + 1}`}
              className="h-28 w-full object-cover sm:h-32" loading="lazy" />
          ))}
        </div>
      ) : tour.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={tour.image} alt={tour.title} className="h-44 w-full object-cover" loading="lazy" />
      ) : null}

      <div className="p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-lg font-bold leading-snug text-slate-900">{tour.title}</h3>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {(tour.durationLabel || tour.durationDays) && (
                <Badge variant="gold">
                  {tour.durationLabel || `${tour.durationDays} Day${tour.durationDays > 1 ? "s" : ""}`}
                </Badge>
              )}
              {tour.group && <Badge variant="secondary">{tour.group}</Badge>}
              {tour.location && <Badge variant="outline">📍 {tour.location}</Badge>}
              {tour.language && <Badge variant="outline">🗣 {tour.language}</Badge>}
              {tour.basePriceUSD !== undefined && (
                <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50">
                  From ${tour.basePriceUSD} / pax
                </Badge>
              )}
            </div>
          </div>
          {tour.sourceUrl && (
            <a href={tour.sourceUrl} target="_blank" rel="noopener noreferrer"
              className="shrink-0 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-[#8b7435] hover:border-[#C9A962] hover:bg-[#C9A962]/10">
              View on website ↗
            </a>
          )}
        </div>
        <div className="mt-4 flex gap-1 overflow-x-auto border-b border-slate-200">
          {tabs.map((t) => (
            <button key={t.id} type="button" onClick={() => setTab(t.id)}
              className={cn("whitespace-nowrap border-b-2 px-3 py-2 text-xs font-semibold",
                tab === t.id ? "border-[#C9A962] text-slate-900" : "border-transparent text-slate-500")}>
              {t.label}
            </button>
          ))}
        </div>
        <div className="max-h-80 overflow-y-auto pt-4 text-sm leading-relaxed text-slate-700">
          {tab === "overview" && (
            <div className="space-y-3">
              {overviewParas.length > 0
                ? overviewParas.map((p, i) => <p key={i}>{p}</p>)
                : <p className="text-slate-400">No overview available.</p>}
            </div>
          )}
          {tab === "itinerary" && (
            <div className="space-y-3">
              {tour.itinerary?.length ? tour.itinerary.map((d) => (
                <div key={d.day} className="rounded-lg border border-slate-200 bg-slate-50/60 p-3">
                  <p className="text-[13px] font-bold text-slate-900">
                    <span className="mr-2 rounded bg-[#C9A962] px-1.5 py-0.5 text-[10px] uppercase text-white">Day {d.day}</span>
                    {d.title}
                  </p>
                  <p className="mt-1.5 whitespace-pre-line text-[13px]">{d.description}</p>
                </div>
              )) : <p className="text-slate-400">No itinerary available.</p>}
            </div>
          )}
          {tab === "meeting" && (
            <div className="space-y-3">
              {tour.meetingPoint
                ? <p className="whitespace-pre-line">{tour.meetingPoint}</p>
                : <p className="text-slate-400">No meeting point info.</p>}
            </div>
          )}
          {tab === "included" && (
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-emerald-200 bg-emerald-50/50 p-3">
                <p className="mb-2 text-xs font-bold uppercase text-emerald-700">Included</p>
                <ul className="space-y-1.5">
                  {(tour.inclusions || []).map((inc, i) => (
                    <li key={i} className="flex gap-2 text-[13px]"><span className="text-emerald-600">✓</span><span>{inc}</span></li>
                  ))}
                </ul>
              </div>
              <div className="rounded-lg border border-red-200 bg-red-50/50 p-3">
                <p className="mb-2 text-xs font-bold uppercase text-red-700">Not Included</p>
                <ul className="space-y-1.5">
                  {(tour.exclusions || []).map((exc, i) => (
                    <li key={i} className="flex gap-2 text-[13px]"><span className="text-red-500">✕</span><span>{exc}</span></li>
                  ))}
                </ul>
              </div>
            </div>
          )}
          {tab === "prices" && (
            <div>
              {tour.pricesTable?.length ? (
                <table className="w-full rounded-lg border border-slate-200 text-[13px]">
                  <thead><tr className="bg-[#0F172A] text-white">
                    <th className="px-3 py-2 text-left">Number of Persons</th>
                    <th className="px-3 py-2 text-right">Price per person</th>
                  </tr></thead>
                  <tbody>
                    {tour.pricesTable.map((row, i) => (
                      <tr key={i} className={i % 2 ? "bg-slate-50" : "bg-white"}>
                        <td className="px-3 py-2">{row.personsLabel}</td>
                        <td className="px-3 py-2 text-right font-bold text-emerald-700">${row.priceUSD}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : <p className="text-slate-400">No pricing table for this tour.</p>}
            </div>
          )}
          {tab === "notes" && (
            <div className="space-y-3">
              {tour.overview && tour.overview.length ? tour.overview.map((n, i) => (
                <details key={i} className="rounded-lg border border-slate-200 bg-slate-50/60 p-3">
                  <summary className="cursor-pointer text-[13px] font-semibold text-slate-900">{n}</summary>
                  <p className="mt-1.5 text-[13px]">{n}</p>
                </details>
              )) : <p className="text-slate-400">No trip notes available.</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
