"use client";

import * as React from "react";
import { Compass, Sparkles, FileText, Users, Phone } from "lucide-react";
import { KEMERYA_COMPANY_INFO } from "@/data/company";
import { TOURS, MAIN_CATEGORIES, SUB_CATEGORIES } from "@/data/tours";
import { Button } from "@/components/ui/button";

export function DashboardHeader() {
  const [time, setTime] = React.useState(new Date());

  React.useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 60_000);
    return () => clearInterval(interval);
  }, []);

  const dateText = time.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <header className="kemerya-gradient text-white shadow-2xl">
      <div className="border-b border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl kemerya-gold-gradient shadow-lg">
              <Compass className="h-6 w-6 text-[#0F172A]" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-wider">
                {KEMERYA_COMPANY_INFO.name}
              </h1>
              <p className="text-xs text-[#C9A962] tracking-[0.2em] uppercase">
                {KEMERYA_COMPANY_INFO.tagline}
              </p>
            </div>
          </div>
          <div className="flex flex-col items-start gap-2 text-sm sm:flex-row sm:items-center sm:gap-4">
            <div className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2 backdrop-blur">
              <Sparkles className="h-4 w-4 text-[#C9A962]" />
              <span className="font-medium">Itinerary Dashboard</span>
            </div>
            <div className="flex items-center gap-2 text-slate-200">
              <Phone className="h-4 w-4 text-[#C9A962]" />
              <a
                href={`tel:${KEMERYA_COMPANY_INFO.operationsManager.phone}`}
                className="font-medium hover:text-[#C9A962]"
              >
                {KEMERYA_COMPANY_INFO.operationsManager.phone}
              </a>
            </div>
            <div className="hidden text-xs text-slate-300 md:block">
              {dateText}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard
            icon={<FileText className="h-4 w-4" />}
            label="Tours in Catalog"
            value={String(TOURS.length)}
            sublabel="expandable"
          />
          <StatCard
            icon={<Compass className="h-4 w-4" />}
            label="Main Categories"
            value={String(MAIN_CATEGORIES.length)}
          />
          <StatCard
            icon={<Sparkles className="h-4 w-4" />}
            label="Sub Categories"
            value={String(SUB_CATEGORIES.length)}
          />
          <StatCard
            icon={<Users className="h-4 w-4" />}
            label="Ops Manager"
            value={KEMERYA_COMPANY_INFO.operationsManager.name.split(" ")[0]}
            sublabel="On Duty"
          />
        </div>
      </div>
    </header>
  );
}

function StatCard({
  icon,
  label,
  value,
  sublabel,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sublabel?: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur transition-all hover:border-[#C9A962]/40 hover:bg-white/10">
      <div className="absolute -right-6 -top-6 h-16 w-16 rounded-full bg-[#C9A962]/5 transition-all group-hover:bg-[#C9A962]/10" />
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-wider text-slate-300">
            {label}
          </p>
          <p className="mt-1 text-2xl font-bold text-white">{value}</p>
          {sublabel && (
            <p className="mt-0.5 text-[10px] text-[#C9A962]">{sublabel}</p>
          )}
        </div>
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#C9A962]/15 text-[#C9A962]">
          {icon}
        </div>
      </div>
    </div>
  );
}
