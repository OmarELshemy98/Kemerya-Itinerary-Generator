"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  RefreshCw,
  Globe2,
  LogOut,
  UserCircle2,
  ChevronDown,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { KEMERYA_COMPANY_INFO } from "@/data/company";
import { useToursData } from "@/components/tours-data-provider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import type { UserRole } from "@/lib/auth/rbac";

export function DashboardHeader() {
  const router = useRouter();
  const supabase = createClient();

  const [scrapeConfirm, setScrapeConfirm] = React.useState(false);
  const [userMenuOpen, setUserMenuOpen] = React.useState(false);
  const [userEmail, setUserEmail] = React.useState<string | null>(null);
  const [userRole, setUserRole] = React.useState<UserRole>("viewer");
  const [userLoading, setUserLoading] = React.useState(true);
  const [loggingOut, setLoggingOut] = React.useState(false);

  const {
    tours,
    source,
    scrapedAt,
    loading,
    refresh,
    triggerFullScrape,
    stats,
  } = useToursData();

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

  const isSuperAdmin = userRole === "super_admin";

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
      {/* Main Header Bar */}
      <div className="flex items-center justify-between px-4 py-3 sm:px-6">
        {/* Left: Title & Status */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold text-slate-900">
              Itinerary Dashboard
            </h1>
            <Badge
              variant="outline"
              className={cn(
                "text-[10px] px-2 py-0.5",
                source === "website" || source === "cache"
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "bg-amber-50 text-amber-700 border-amber-200"
              )}
            >
              <CheckCircle2 className="mr-1 h-3 w-3" />
              {source === "website"
                ? "Live"
                : source === "cache"
                ? "Cached"
                : "Sample"}
              {scrapedAt && source !== "fallback" && (
                <span className="ml-1 opacity-70">
                  · {new Date(scrapedAt).toLocaleDateString()}
                </span>
              )}
            </Badge>
          </div>
        </div>

        {/* Right: Actions & User */}
        <div className="flex items-center gap-2">
          {/* Sync Buttons */}
          {!scrapeConfirm ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setScrapeConfirm(true)}
              disabled={loading}
              className="h-8 text-xs border-slate-200 text-slate-600 hover:bg-slate-50"
            >
              <Globe2 className="mr-1.5 h-3.5 w-3.5" />
              Sync Tours
            </Button>
          ) : (
            <div className="flex items-center gap-1">
              <Button
                size="sm"
                onClick={() => handleFullScrape({ skipDetails: false, maxToursPerSub: 20 })}
                disabled={loading}
                className="h-8 text-xs bg-[#C9A962] hover:bg-[#b8944d] text-white"
              >
                <RefreshCw className={cn("mr-1.5 h-3.5 w-3.5", loading && "animate-spin")} />
                {loading ? "Scraping…" : "Full Sync"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleFullScrape({ skipDetails: true, maxToursPerSub: 30 })}
                disabled={loading}
                className="h-8 text-xs border-slate-200 text-slate-600 hover:bg-slate-50"
              >
                Quick Sync
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setScrapeConfirm(false)}
                disabled={loading}
                className="h-8 px-2 text-xs text-slate-500"
              >
                Cancel
              </Button>
            </div>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => refresh()}
            disabled={loading}
            className="h-8 text-xs border-slate-200 text-slate-600 hover:bg-slate-50"
          >
            <RefreshCw className={cn("mr-1.5 h-3.5 w-3.5", loading && "animate-spin")} />
            Reload
          </Button>

          {/* Divider */}
          <div className="h-6 w-px bg-slate-200 mx-1" />

          {/* User Menu */}
          <div className="relative" data-user-menu>
            <button
              onClick={() => setUserMenuOpen((o) => !o)}
              className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm hover:bg-slate-50 transition-colors"
            >
              {userLoading ? (
                <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
              ) : (
                <>
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#C9A962]/10">
                    <UserCircle2 className="h-4 w-4 text-[#8b7435]" />
                  </div>
                  <div className="hidden text-left sm:block">
                    <div className="text-xs font-medium text-slate-900 leading-tight">
                      {userEmail ?? "Guest"}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {roleLabel[userRole]}
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
            </button>

            {userMenuOpen && !userLoading && (
              <div className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg">
                <div className="border-b border-slate-100 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#C9A962]/10">
                      <UserCircle2 className="h-5 w-5 text-[#8b7435]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium text-slate-900">
                        {userEmail ?? "Guest"}
                      </div>
                      <div className="text-xs text-slate-500">
                        {roleLabel[userRole]}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="py-1">
                  <button
                    type="button"
                    onClick={handleLogout}
                    disabled={loggingOut}
                    className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
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

      {/* Stats Bar */}
      <div className="border-t border-slate-100 bg-slate-50/50 px-4 py-2 sm:px-6">
        <div className="flex items-center gap-4 text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-700">{tours.length}</span>
            Tours
          </span>
          <span className="text-slate-300">|</span>
          <span className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-700">{stats?.subCategories ?? 0}</span>
            Categories
          </span>
          {stats?.toursTotal !== undefined && (
            <>
              <span className="text-slate-300">|</span>
              <span className="flex items-center gap-1.5">
                <span className="font-semibold text-slate-700">{stats.withDetails}/{stats.toursTotal}</span>
                Detailed
              </span>
            </>
          )}
        </div>
      </div>
    </header>
  );
}