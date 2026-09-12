/**
 * Shared API helpers — single source of truth for auth + JSON responses.
 * Every route handler should use these so behavior (and status codes) is
 * consistent across the whole app.
 */
import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import type { UserRole } from "@/types";

export interface AuthContext {
  userId: string;
  role: UserRole | null;
  isAdmin: boolean;
}

export async function requireUser(): Promise<
  { ok: true; userId: string } | { ok: false; response: NextResponse }
> {
  const serverSupabase = createServerClient();
  const {
    data: { user },
  } = await serverSupabase.auth.getUser();
  if (!user) {
    return {
      ok: false,
      response: NextResponse.json(
        { ok: false, error: "Authentication required" },
        { status: 401 }
      ),
    };
  }
  return { ok: true, userId: user.id };
}

export async function requireAuthWithRole(): Promise<
  | { ok: true; ctx: AuthContext }
  | { ok: false; response: NextResponse }
> {
  const auth = await requireUser();
  if (!auth.ok) return auth;
  const serverSupabase = createServerClient();
  const { data: profile } = await serverSupabase
    .from("profiles")
    .select("role")
    .eq("id", auth.userId)
    .maybeSingle();
  const role = (profile?.role as UserRole | undefined) ?? null;
  const isAdmin = role === "super_admin" || role === "admin";
  return { ok: true, ctx: { userId: auth.userId, role, isAdmin } };
}

/** Database failure → 500 with a safe, non-leaking message. */
export function dbError(message: string): NextResponse {
  return NextResponse.json(
    { ok: false, error: `Database error: ${message}` },
    { status: 500 }
  );
}

/** Unexpected failure → 500 with a safe message (details stay server-side). */
export function serverError(error: unknown, context: string): NextResponse {
  console.error(`${context}:`, error);
  const detail = error instanceof Error ? error.message : String(error);
  return NextResponse.json(
    { ok: false, error: `${context}: ${detail}` },
    { status: 500 }
  );
}
