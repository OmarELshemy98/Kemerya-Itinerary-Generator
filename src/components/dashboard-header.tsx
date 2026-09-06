"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Compass,
  Sparkles,
  FileText,
  Users,
  Phone,
  RefreshCw,
  Globe2,
  Shield,
  LogOut,
  UserCircle2,
  ChevronDown,
  Loader2,
} from "lucide-react";
import { KEMERYA_COMPANY_INFO } from "@/data/company";
import { useToursData } from "@/components/tours-data-provider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import type { UserRole } from "@/lib/auth/rbac";

export function DashboardHeader() {
  const router = useRouter();
  const supabase = createClient();

  const [time, setTime] = React.useState(new Date());
  const [scrapeConfirm, setScrapeConfirm] = React.useState(false);
  const [userMenuOpen, setUserMenuOpen] = React.useState(false);
  const [userEmail, setUserEmail] = React.useState<string | null>(null);
  const [userRole, setUserRole] = React.useState<UserRole>("viewer");
  const [userLoading, setUserLoading] = React.useState(true);
  const [loggingOut, setLoggingOut] = React.useState(false);

  const {
    tours,
    mainCategories,
    subCategories,
    source,
    scrapedAt,
    loading,
    error,
    refresh,
    triggerFullScrape,
    stats,
  } = useToursData();

  React.useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 60_000);
    return () => clearInterval(interval);
  }, []);

  React.useEffect(() => {
    async function fetchUser() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          setUserEmail(user.email ?? null);

          const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .maybeSingle();

          if (profile?.role) {
            setUserRole(profile.role as UserRole);
          }
        }
      } finally {
        setUserLoading(false);
      }
    }
    fetchUser();
  }, [supabase]);

  React.useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as HTMLElement;
      if (!target.closest("[data-user-menu]")) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const dateText = time.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const handleFullScrape = async (opts?: {
    maxToursPerSub?: number;
    skipDetails?: boolean;
  }) => {
    setScrapeConfirm(false);
    await triggerFullScrape(opts);
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } finally {
      setLoggingOut(false);
    }
  };

  const roleLabel: Record<UserRole, string> = {
    super_admin: "Super Admin",
    admin: "Admin",
    operator: "Operator",
    viewer: "Viewer",
  };

  const roleVariant: Record<UserRole, "gold" | "emerald" | "secondary" | "outline"> = {
    super_admin: "gold",
    admin: "emerald",
    operator: "secondary",
    viewer: "outline",
  };

  const isSuperAdmin = userRole === "super_admin";

  return (
    <header className="kemerya-gradient text-white shadow-2xl">
      <div className="border-b border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="relative h-14 w-44 rounded-xl bg-white/95 p-2 shadow-lg flex items-center justify-center">
              <Image
                src={KEMERYA_COMPANY_INFO.logo}
                alt={KEMERYA_COMPANY_INFO.name}
                fill
                className="object-contain"
                sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 176px"
              />
            </div>
          </div>
          <div className="flex flex-col items-start gap-2 text-sm sm:flex-row sm:items-center sm:gap-4 flex-grow justify-end">
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                className={cn(
                  "rounded-md px-2.5 py-1 text-[10px] uppercase",
                  source === "website" || source === "cache"
                    ? "bg-emerald-500/20 text-emerald-200 hover:bg-emerald-500/20"
                    : "bg-amber-500/20 text-amber-200 hover:bg-amber-500/20"
                )}
                variant="outline"
              >
                <Globe2 className="mr-1 inline h-3 w-3" />
                {source === "website"
                  ? "Live Website"
                  : source === "cache"
                  ? "Cached Website"
                  : "Sample Data"}
                {scrapedAt && source !== "fallback" && (
                  <span className="ml-1 opacity-70">
                    · {new Date(scrapedAt).toLocaleDateString()}
                  </span>
                )}
              </Badge>
              {error && (
                <Badge
                  variant="outline"
                  className="rounded-md bg-red-500/20 px-2.5 py-1 text-[10px] text-red-200 hover:bg-red-500/20"
                >
                  {error.slice(0, 40)}
                </Badge>
              )}
            </div>
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

            <div className="relative" data-user-menu>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setUserMenuOpen((o) => !o)}
                className="h-9 rounded-lg border border-white/10 bg-white/5 px-2.5 text-white hover:bg-white/10 gap-2"
              >
                {userLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin text-[#C9A962]" />
                ) : (
                  <>
                    <div className="flex h-7 w-7 items-center justify-center rounded-full kemerya-gold-gradient">
                      <UserCircle2 className="h-4 w-4 text-[#0F172A]" />
                    </div>
                    <div className="hidden text-left sm:block">
                      <div className="text-xs font-medium leading-tight">
                        {userEmail ?? "Guest"}
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Badge
                          variant={roleVariant[userRole]}
                          className="h-4 px-1.5 text-[9px] rounded-sm py-0"
                        >
                          {roleLabel[userRole]}
                        </Badge>
                      </div>
                    </div>
                    <ChevronDown
                      className={cn(
                        "h-3.5 w-3.5 text-slate-400 transition-transform",
                        userMenuOpen && "rotate-180"
                      )}
                    />
                  </>
                )}
              </Button>

              {userMenuOpen && !userLoading && (
                <div className="absolute right-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-xl border border-white/10 bg-[#0F172A]/95 shadow-2xl backdrop-blur-xl">
                  <div className="border-b border-white/5 px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full kemerya-gold-gradient">
                        <UserCircle2 className="h-5 w-5 text-[#0F172A]" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium text-white">
                          {userEmail ?? "Guest"}
                        </div>
                        <Badge
                          variant={roleVariant[userRole]}
                          className="mt-1 h-4 px-1.5 text-[9px] rounded-sm py-0"
                        >
                          {roleLabel[userRole]}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="py-1.5">
                    {isSuperAdmin && (
                      <button
                        type="button"
                        onClick={() => {
                          setUserMenuOpen(false);
                          router.push("/admin/users");
                        }}
                        className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-slate-200 transition-colors hover:bg-white/5 hover:text-white"
                      >
                        <Shield className="h-4 w-4 text-[#C9A962]" />
                        User Management
                      </button>
                    )}
                    <div className="my-1 h-px bg-white/5" />
                    <button
                      type="button"
                      onClick={handleLogout}
                      disabled={loggingOut}
                      className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-red-300 transition-colors hover:bg-red-500/10 hover:text-red-200 disabled:opacity-50"
                    >
                      {loggingOut ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <LogOut className="h-4 w-4" />
                      )}
                      {loggingOut ? "Signing out…" : "Sign Out"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="border-t border-white/5 bg-white/5 backdrop-blur">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-2 px-4 py-3 sm:px-6 lg:px-8">
            <div className="mr-auto flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => refresh()}
                disabled={loading}
                className="h-8 rounded-md border-white/20 bg-white/5 px-3 text-xs text-white hover:bg-white/10 hover:text-white"
              >
                <RefreshCw
                  className={cn("mr-1.5 h-3.5 w-3.5", loading && "animate-spin")}
                />
                Reload Catalog
              </Button>
              {!scrapeConfirm ? (
                <Button
                  variant="gold"
                  size="sm"
                  onClick={() => setScrapeConfirm(true)}
                  disabled={loading}
                  className="h-8 rounded-md px-3 text-xs"
                >
                  <Globe2 className="mr-1.5 h-3.5 w-3.5" />
                  Sync from kemeryatours.com
                </Button>
              ) : (
                <>
                  <Button
                    variant="gold"
                    size="sm"
                    onClick={() => handleFullScrape({ skipDetails: false, maxToursPerSub: 20 })}
                    disabled={loading}
                    className="h-8 rounded-md px-3 text-xs"
                  >
                    <RefreshCw
                      className={cn("mr-1.5 h-3.5 w-3.5", loading && "animate-spin")}
                    />
                    {loading ? "Scraping…" : "Full Scrape (All Details)"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleFullScrape({ skipDetails: true, maxToursPerSub: 30 })}
                    disabled={loading}
                    className="h-8 rounded-md border-white/20 bg-white/5 px-3 text-xs text-white hover:bg-white/10 hover:text-white"
                  >
                    Quick Scrape (Titles + Prices only)
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setScrapeConfirm(false)}
                    disabled={loading}
                    className="h-8 rounded-md px-2.5 text-xs text-slate-300 hover:text-white"
                  >
                    Cancel
                  </Button>
                </>
              )}
              {isSuperAdmin && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push("/admin/users")}
                  className="h-8 rounded-md border-[#C9A962]/40 bg-[#C9A962]/10 px-3 text-xs text-[#C9A962] hover:bg-[#C9A962]/15"
                >
                  <Shield className="mr-1.5 h-3.5 w-3.5" />
                  User Management
                </Button>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-slate-300">
              {stats?.toursTotal !== undefined && (
                <span className="rounded-md bg-white/5 px-2 py-1">
                  Scraped: {stats.withDetails}/{stats.toursTotal} detailed
                </span>
              )}
              <span className="rounded-md bg-white/5 px-2 py-1">
                Subs: {stats?.subCategories ?? subCategories.length}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard
            icon={<FileText className="h-4 w-4" />}
            label="Tours in Catalog"
            value={String(tours.length)}
            sublabel={source === "fallback" ? "sample" : "live"}
          />
          <StatCard
            icon={<Compass className="h-4 w-4" />}
            label="Main Categories"
            value={String(mainCategories.length)}
          />
          <StatCard
            icon={<Sparkles className="h-4 w-4" />}
            label="Sub Categories"
            value={String(subCategories.length)}
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
