import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const supabase = createClient();

    await supabase.auth.signOut();

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
