import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase";
import { createClient as createServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const serverSupabase = createServerClient();
    const { data: { user } } = await serverSupabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ ok: false, error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();
    const { action, details } = body;

    if (!action) {
      return NextResponse.json({ ok: false, error: "Action is required" }, { status: 400 });
    }

    const serviceSupabase = getServiceSupabase();
    if (!serviceSupabase) {
      return NextResponse.json({ ok: false, error: "Service role not configured" }, { status: 503 });
    }

    // Get client info
    const ipAddress = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || null;
    const userAgent = request.headers.get("user-agent") || null;

    const { error } = await serviceSupabase.from("audit_log").insert({
      user_id: user.id,
      action,
      details: details || {},
      ip_address: ipAddress,
      user_agent: userAgent,
    });

    if (error) {
      console.error("Failed to log audit:", error);
      return NextResponse.json({ ok: false, error: "Failed to log" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("Audit log error:", e);
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 });
  }
}