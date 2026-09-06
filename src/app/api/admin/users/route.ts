import { NextResponse } from "next/server";
import { supabase, getServiceSupabase, hasServiceRoleKey } from "@/lib/supabase";
import { createClient as createServerClient } from "@/lib/supabase/server";
import type { AdminUser, CreateUserRequest, UserRole } from "@/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VALID_ROLES: UserRole[] = ["super_admin", "admin", "operator", "viewer"];

async function requireSuperAdminApi() {
  const serverSupabase = createServerClient();
  const {
    data: { user },
    error: authError,
  } = await serverSupabase.auth.getUser();

  if (authError || !user) {
    return { allowed: false, status: 401, message: "Authentication required" };
  }

  const { data: profile, error: profileError } = await serverSupabase
    .from("profiles")
    .select("role, is_active")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError || !profile) {
    return { allowed: false, status: 403, message: "Profile not found" };
  }

  if (!profile.is_active) {
    return { allowed: false, status: 403, message: "Account is deactivated" };
  }

  if (profile.role !== "super_admin") {
    return { allowed: false, status: 403, message: "Super Admin access required" };
  }

  return { allowed: true, user };
}

export async function GET() {
  try {
    const auth = await requireSuperAdminApi();
    if (!auth.allowed) {
      return NextResponse.json(
        { ok: false, error: auth.message },
        { status: auth.status }
      );
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json(
        { ok: false, error: `Database error: ${error.message}` },
        { status: 500 }
      );
    }

    const users: AdminUser[] = (data || []).map((row: any) => ({
      id: row.id,
      full_name: row.full_name || "",
      email: row.email || "",
      role: (VALID_ROLES.includes(row.role) ? row.role : "viewer") as UserRole,
      is_active: Boolean(row.is_active ?? true),
      created_at: row.created_at || new Date().toISOString(),
    }));

    return NextResponse.json({ ok: true, users });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: String(e?.message || e) },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireSuperAdminApi();
    if (!auth.allowed) {
      return NextResponse.json(
        { ok: false, error: auth.message },
        { status: auth.status }
      );
    }

    const body = (await request.json()) as Partial<CreateUserRequest>;
    const { email, password, full_name, role } = body;

    if (!email || !password || !full_name || !role) {
      return NextResponse.json(
        { ok: false, error: "Missing required fields: email, password, full_name, role" },
        { status: 400 }
      );
    }

    if (!VALID_ROLES.includes(role)) {
      return NextResponse.json(
        { ok: false, error: `Invalid role. Must be one of: ${VALID_ROLES.join(", ")}` },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { ok: false, error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    const serviceSupabase = getServiceSupabase();
    if (!serviceSupabase) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "SUPABASE_SERVICE_ROLE_KEY is not configured. Please set this environment variable to enable user creation via the Admin API. " +
            "As a temporary workaround, you may create the auth user manually via the Supabase dashboard SQL editor, then insert a matching row into the profiles table.",
        },
        { status: 503 }
      );
    }

    const { data: authData, error: authError } = await serviceSupabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (authError) {
      return NextResponse.json(
        { ok: false, error: `Auth error: ${authError.message}` },
        { status: 500 }
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        { ok: false, error: "Failed to create auth user" },
        { status: 500 }
      );
    }

    const userId = authData.user.id;
    const userEmail = authData.user.email || email;

    const { error: profileError } = await supabase.from("profiles").insert({
      id: userId,
      full_name,
      email: userEmail,
      role,
      is_active: true,
    });

    if (profileError) {
      try {
        await serviceSupabase.auth.admin.deleteUser(userId);
      } catch {}
      return NextResponse.json(
        { ok: false, error: `Profile error: ${profileError.message}` },
        { status: 500 }
      );
    }

    const user: AdminUser = {
      id: userId,
      full_name,
      email: userEmail,
      role,
      is_active: true,
      created_at: authData.user.created_at || new Date().toISOString(),
    };

    return NextResponse.json({ ok: true, user });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: String(e?.message || e) },
      { status: 500 }
    );
  }
}
