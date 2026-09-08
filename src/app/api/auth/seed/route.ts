import { NextResponse } from "next/server";
import { supabase, getServiceSupabase } from "@/lib/supabase";
import type { UserRole } from "@/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SUPER_ADMIN_EMAIL = "omarelshemy010@gmail.com";
const SUPER_ADMIN_FULL_NAME = "Omar Elshemy";
const SUPER_ADMIN_ROLE: UserRole = "super_admin";

export async function POST(request: Request) {
  try {
    const serviceSupabase = getServiceSupabase();
    if (!serviceSupabase) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "SUPABASE_SERVICE_ROLE_KEY is not configured. This endpoint requires a service role key to create super admin users via the Admin API. " +
            "Alternatively, run the SQL seed manually via Supabase dashboard SQL editor using the instructions in supabase/migrations/00000000000001_seed_super_admin.sql",
        },
        { status: 503 }
      );
    }

    const expectedPassword = process.env.SUPER_ADMIN_SEED_PASSWORD;
    if (expectedPassword) {
      try {
        const body = await request.json().catch(() => ({}));
        const providedPassword = body?.password;
        if (!providedPassword || providedPassword !== expectedPassword) {
          return NextResponse.json(
            { ok: false, error: "Unauthorized seed attempt. Invalid password." },
            { status: 401 }
          );
        }
      } catch {
        return NextResponse.json(
          { ok: false, error: "Unauthorized seed attempt. SUPER_ADMIN_SEED_PASSWORD env is set but request body is invalid." },
          { status: 401 }
        );
      }
    }

    const { data: existingProfiles, error: listError } = await supabase
      .from("profiles")
      .select("id, role")
      .eq("role", "super_admin")
      .limit(1);

    if (listError) {
      return NextResponse.json(
        { ok: false, error: `Failed to check existing super admins: ${listError.message}` },
        { status: 500 }
      );
    }

    if (existingProfiles && existingProfiles.length > 0) {
      return NextResponse.json({
        ok: true,
        skipped: true,
        message: "Super admin already exists. No action taken.",
      });
    }

    const { data: existingByEmail, error: emailCheckError } = await supabase
      .from("profiles")
      .select("id, email")
      .eq("email", SUPER_ADMIN_EMAIL)
      .limit(1);

    if (emailCheckError) {
      return NextResponse.json(
        { ok: false, error: `Failed to check existing email: ${emailCheckError.message}` },
        { status: 500 }
      );
    }

    if (existingByEmail && existingByEmail.length > 0) {
      const existingId = existingByEmail[0].id;
      const { error: promoteError } = await supabase
        .from("profiles")
        .update({ role: SUPER_ADMIN_ROLE, is_active: true })
        .eq("id", existingId);

      if (promoteError) {
        return NextResponse.json(
          { ok: false, error: `Failed to promote existing user: ${promoteError.message}` },
          { status: 500 }
        );
      }

      return NextResponse.json({
        ok: true,
        promoted: true,
        message: `Existing user ${SUPER_ADMIN_EMAIL} promoted to super_admin.`,
      });
    }

    // Password must come strictly from the environment — never hardcode a
    // default. If DEFAULT_ADMIN_PASSWORD (or the legacy SUPER_ADMIN_SEED_PASSWORD)
    // is not configured, seeding a new user is refused.
    const adminPassword =
      process.env.DEFAULT_ADMIN_PASSWORD || process.env.SUPER_ADMIN_SEED_PASSWORD;

    if (!adminPassword) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "DEFAULT_ADMIN_PASSWORD is not configured. Set this environment variable (a strong password for the seeded admin account) and try again. Hardcoded fallback passwords are not allowed.",
        },
        { status: 503 }
      );
    }

    if (adminPassword.length < 6) {
      return NextResponse.json(
        { ok: false, error: "DEFAULT_ADMIN_PASSWORD must be at least 6 characters." },
        { status: 503 }
      );
    }

    const { data: authData, error: authError } = await serviceSupabase.auth.admin.createUser({
      email: SUPER_ADMIN_EMAIL,
      password: adminPassword,
      email_confirm: true,
    });

    if (authError) {
      return NextResponse.json(
        { ok: false, error: `Auth create user failed: ${authError.message}` },
        { status: 500 }
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        { ok: false, error: "Failed to create auth user (no user returned)" },
        { status: 500 }
      );
    }

    const userId = authData.user.id;
    const userEmail = authData.user.email || SUPER_ADMIN_EMAIL;

    const { error: profileError } = await supabase.from("profiles").insert({
      id: userId,
      full_name: SUPER_ADMIN_FULL_NAME,
      email: userEmail,
      role: SUPER_ADMIN_ROLE,
      is_active: true,
    });

    if (profileError) {
      try {
        await serviceSupabase.auth.admin.deleteUser(userId);
      } catch {}
      return NextResponse.json(
        { ok: false, error: `Profile insert failed: ${profileError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      created: true,
      user: {
        id: userId,
        email: userEmail,
        full_name: SUPER_ADMIN_FULL_NAME,
        role: SUPER_ADMIN_ROLE,
        created_at: authData.user.created_at || new Date().toISOString(),
      },
      note: `Password used for the seeded admin account: ${
        process.env.DEFAULT_ADMIN_PASSWORD
          ? "(from DEFAULT_ADMIN_PASSWORD env)"
          : "(from legacy SUPER_ADMIN_SEED_PASSWORD env) — migrate to DEFAULT_ADMIN_PASSWORD"
      }. Change this password via the users page immediately.`,
    });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: String(e?.message || e) },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, email, role, is_active, created_at")
      .eq("role", "super_admin")
      .limit(5);

    if (error) {
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      superAdmins: data || [],
      hasServiceRole: Boolean(getServiceSupabase()),
      seedPasswordConfigured: Boolean(
        process.env.DEFAULT_ADMIN_PASSWORD || process.env.SUPER_ADMIN_SEED_PASSWORD
      ),
      toSeed: !(data && data.length > 0),
    });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: String(e?.message || e) },
      { status: 500 }
    );
  }
}
