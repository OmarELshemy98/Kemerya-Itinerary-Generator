"use client";

import * as React from "react";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Loader2, AlertTriangle } from "lucide-react";

interface AuthGateProps {
  children: React.ReactNode;
  requireRole?: "super_admin" | "admin" | "operator" | "viewer";
}

export function AuthGate({ children, requireRole }: AuthGateProps) {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = React.useMemo(() => createClient(), []);

  const [status, setStatus] = React.useState<"checking" | "authed" | "denied">(
    "checking"
  );
  const [denyReason, setDenyReason] = React.useState<string>(
    "Verifying your access…"
  );

  const checkedRef = React.useRef(false);

  React.useEffect(() => {
    let cancelled = false;

    async function checkAuth() {
      if (checkedRef.current) return;
      checkedRef.current = true;

      try {
        const {
          data: { user },
          error: userErr,
        } = await supabase.auth.getUser();

        if (cancelled) return;
        if (userErr || !user) {
          setDenyReason("You must be signed in to access this page.");
          setStatus("denied");
          await new Promise((r) => setTimeout(r, 350));
          if (cancelled) return;
          const loginUrl = new URL("/login", window.location.origin);
          if (pathname && pathname !== "/" && pathname !== "/login") {
            loginUrl.searchParams.set("next", pathname);
          }
          window.location.replace(loginUrl.toString());
          return;
        }

        if (requireRole) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("role, is_active")
            .eq("id", user.id)
            .maybeSingle();

          if (cancelled) return;

          if (!profile || !profile.is_active) {
            setDenyReason("Your account is inactive or not found.");
            setStatus("denied");
            try {
              await supabase.auth.signOut();
            } catch {}
            await new Promise((r) => setTimeout(r, 500));
            if (cancelled) return;
            window.location.replace("/login?loggedOut=1");
            return;
          }

          const roleRank: Record<string, number> = {
            viewer: 1,
            operator: 2,
            admin: 3,
            super_admin: 4,
          };
          const need = roleRank[requireRole] ?? 1;
          const have = roleRank[profile.role] ?? 0;

          if (have < need) {
            setDenyReason(
              `This area requires "${requireRole}" access. Redirecting…`
            );
            setStatus("denied");
            await new Promise((r) => setTimeout(r, 500));
            if (cancelled) return;
            window.location.replace("/dashboard");
            return;
          }
        }

        if (!cancelled) setStatus("authed");
      } catch (err) {
        if (!cancelled) {
          setDenyReason(
            err instanceof Error ? err.message : "Authentication error."
          );
          setStatus("denied");
        }
      }
    }

    checkAuth();

    return () => {
      cancelled = true;
    };
  }, [supabase, requireRole, pathname]);

  React.useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        checkedRef.current = false;
        setStatus("checking");
        setDenyReason("Signed out. Redirecting…");
        window.location.replace("/login?loggedOut=1");
      }
    });
    return () => subscription.unsubscribe();
  }, [supabase, router]);

  if (status === "checking") {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0F172A]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(201,169,98,0.2),_transparent_55%)]" />
        <div className="relative flex flex-col items-center gap-4">
          <div className="relative">
            <div className="absolute -inset-6 rounded-full bg-[#C9A962]/15 blur-2xl" />
            <Loader2 className="relative h-11 w-11 animate-spin text-[#C9A962]" />
          </div>
          <p className="text-[11px] font-semibold tracking-[0.25em] uppercase text-slate-400">
            {denyReason}
          </p>
        </div>
      </div>
    );
  }

  if (status === "denied") {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0F172A]">
        <div className="flex max-w-md flex-col items-center gap-4 px-6 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-300 ring-1 ring-amber-500/30">
            <AlertTriangle className="h-7 w-7" />
          </div>
          <p className="text-[11px] font-semibold tracking-[0.25em] uppercase text-slate-400">
            Access Check
          </p>
          <p className="text-sm leading-relaxed text-slate-300">{denyReason}</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
