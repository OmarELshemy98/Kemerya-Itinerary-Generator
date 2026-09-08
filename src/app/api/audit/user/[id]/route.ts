import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase";
import { createClient as createServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const serverSupabase = createServerClient();
    const { data: { user: currentUser } } = await serverSupabase.auth.getUser();

    if (!currentUser) {
      return NextResponse.json({ ok: false, error: "Not authenticated" }, { status: 401 });
    }

    // Check if current user is super admin
    const { data: profile } = await serverSupabase
      .from("profiles")
      .select("role")
      .eq("id", currentUser.id)
      .maybeSingle();

    const isSuperAdmin = profile?.role === "super_admin" || currentUser.user_metadata?.role === "super_admin";

    if (!isSuperAdmin) {
      return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
    }

    const { id } = params;
    if (!id) {
      return NextResponse.json({ ok: false, error: "User ID is required" }, { status: 400 });
    }

    const serviceSupabase = getServiceSupabase();
    const client = serviceSupabase || serverSupabase;

    const { data, error } = await client
      .from("audit_log")
      .select("*")
      .eq("user_id", id)
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) {
      console.error("Failed to fetch audit log:", error);
      return NextResponse.json({ ok: false, error: "Database error" }, { status: 500 });
    }

    return NextResponse.json({ ok: true, activities: data || [] });
  } catch (e: any) {
    console.error("Audit fetch error:", e);
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 });
  }
}