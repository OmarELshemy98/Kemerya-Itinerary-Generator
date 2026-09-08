import { NextResponse } from "next/server";
import { supabase, getServiceSupabase } from "@/lib/supabase";
import { createClient as createServerClient } from "@/lib/supabase/server";
import type { AdminUser, UpdateUserRequest, UserRole } from "@/types";

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

  // أولاً: حاول جلب الـ profile من قاعدة البيانات
  const { data: profile, error: profileError } = await serverSupabase
    .from("profiles")
    .select("role, is_active")
    .eq("id", user.id)
    .maybeSingle();

  // لو الـ profile موجود، استخدمه
  if (profile && !profileError) {
    if (!profile.is_active) {
      return { allowed: false, status: 403, message: "Account is deactivated" };
    }

    if (profile.role === "super_admin") {
      return { allowed: true, user };
    }
  }

  // لو الـ profile مش موجود أو الـ role مش super_admin، جرب الـ metadata من الـ JWT
  const metadataRole = user.app_metadata?.role || user.user_metadata?.role;
  
  if (metadataRole === "super_admin") {
    return { allowed: true, user };
  }

  return { allowed: false, status: 403, message: "Super Admin access required" };
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const auth = await requireSuperAdminApi();
    if (!auth.allowed) {
      return NextResponse.json(
        { ok: false, error: auth.message },
        { status: auth.status }
      );
    }

    const { id } = params;
    if (!id) {
      return NextResponse.json({ ok: false, error: "User id is required" }, { status: 400 });
    }

    const body = (await request.json()) as UpdateUserRequest & { password?: string };
    const { full_name, role, is_active, password } = body;

    if (
      full_name === undefined &&
      role === undefined &&
      is_active === undefined &&
      password === undefined
    ) {
      return NextResponse.json(
        { ok: false, error: "No fields to update. Provide full_name, role, is_active, or password." },
        { status: 400 }
      );
    }

    if (role !== undefined && !VALID_ROLES.includes(role)) {
      return NextResponse.json(
        { ok: false, error: `Invalid role. Must be one of: ${VALID_ROLES.join(", ")}` },
        { status: 400 }
      );
    }

    if (password !== undefined) {
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
              "SUPABASE_SERVICE_ROLE_KEY is not configured. Password updates require the service role key.",
          },
          { status: 503 }
        );
      }
      const { error: pwError } = await serviceSupabase.auth.admin.updateUserById(id, {
        password,
      });
      if (pwError) {
        return NextResponse.json(
          { ok: false, error: `Password update failed: ${pwError.message}` },
          { status: 500 }
        );
      }
    }

    const updates: Record<string, any> = {};
    if (full_name !== undefined) updates.full_name = full_name;
    if (role !== undefined) updates.role = role;
    if (is_active !== undefined) updates.is_active = Boolean(is_active);

    let row: any = null;
    const serviceSupabase = getServiceSupabase();

    // استخدام serviceSupabase لتجاوز الـ RLS
    const client = serviceSupabase || supabase;

    // تحقق من وجود المستخدم أولاً
    const { data: existingUser } = await client
      .from("profiles")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (!existingUser) {
      // لو المستخدم مش موجود في profiles، أنشئه
      if (serviceSupabase) {
        // جلب بيانات المستخدم من auth
        const { data: authUser } = await serviceSupabase.auth.admin.getUserById(id);
        
        const { data: newProfile, error: createError } = await serviceSupabase
          .from("profiles")
          .insert({
            id: id,
            email: authUser?.user?.email || "",
            full_name: full_name || authUser?.user?.user_metadata?.full_name || "User",
            role: role || "viewer",
            is_active: is_active !== undefined ? Boolean(is_active) : true,
          })
          .select("*")
          .single();

        if (createError) {
          return NextResponse.json(
            { ok: false, error: `Failed to create profile: ${createError.message}` },
            { status: 500 }
          );
        }
        row = newProfile;
      } else {
        return NextResponse.json({ ok: false, error: "User not found" }, { status: 404 });
      }
    } else if (Object.keys(updates).length > 0) {
      // تحديث المستخدم الموجود
      const { data, error } = await client
        .from("profiles")
        .update(updates)
        .eq("id", id)
        .select("*")
        .limit(1);

      if (error) {
        return NextResponse.json(
          { ok: false, error: `Database error: ${error.message}` },
          { status: 500 }
        );
      }

      if (!data || data.length === 0) {
        return NextResponse.json({ ok: false, error: "User not found" }, { status: 404 });
      }
      row = data[0];
    } else {
      row = existingUser;
    }

    const user: AdminUser = {
      id: row.id,
      full_name: row.full_name || "",
      email: row.email || "",
      role: (VALID_ROLES.includes(row.role) ? row.role : "viewer") as UserRole,
      is_active: Boolean(row.is_active ?? true),
      created_at: row.created_at || new Date().toISOString(),
    };

    return NextResponse.json({ ok: true, user });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: String(e?.message || e) },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  try {
    const auth = await requireSuperAdminApi();
    if (!auth.allowed) {
      return NextResponse.json(
        { ok: false, error: auth.message },
        { status: auth.status }
      );
    }

    const { id } = params;
    if (!id) {
      return NextResponse.json({ ok: false, error: "User id is required" }, { status: 400 });
    }

    const serviceSupabase = getServiceSupabase();

    const { error: profileError } = await supabase.from("profiles").delete().eq("id", id);

    if (profileError) {
      return NextResponse.json(
        { ok: false, error: `Failed to delete profile: ${profileError.message}` },
        { status: 500 }
      );
    }

    if (serviceSupabase) {
      try {
        await serviceSupabase.auth.admin.deleteUser(id);
      } catch (authErr: any) {
        return NextResponse.json(
          {
            ok: true,
            warning: `Profile deleted but auth user removal failed: ${String(authErr?.message || authErr)}`,
            deleted: { profile: true, authUser: false },
          },
          { status: 200 }
        );
      }
    }

    return NextResponse.json({
      ok: true,
      deleted: { profile: true, authUser: Boolean(serviceSupabase) },
    });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: String(e?.message || e) },
      { status: 500 }
    );
  }
}
