import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getServiceSupabase } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const supabase = createClient();

    // Get current user before signing out
    const { data: { user } } = await supabase.auth.getUser();

    await supabase.auth.signOut();

    // Log logout activity
    if (user) {
      const serviceSupabase = getServiceSupabase();
      if (serviceSupabase) {
        const ipAddress = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || null;
        const userAgent = request.headers.get("user-agent") || null;

        await serviceSupabase.from("audit_log").insert({
          user_id: user.id,
          action: "logout",
          details: { email: user.email },
          ip_address: ipAddress,
          user_agent: userAgent,
        });
      }
    }

    const response = NextResponse.json(
      { success: true, redirect: "/login" },
      { status: 200 }
    );

    response.cookies.delete("sb-access-token");
    response.cookies.delete("sb-refresh-token");

    return response;
  } catch (err) {
    return NextResponse.json(
      { error: "Logout failed", redirect: "/login" },
      { status: 500 }
    );
  }
}
