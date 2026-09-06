import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { createClient as createServerClient } from "@/lib/supabase/server";
import type { SubCategory } from "@/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function requireAdminApi() {
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

  if (profile.role !== "super_admin" && profile.role !== "admin") {
    return { allowed: false, status: 403, message: "Admin access required" };
  }

  return { allowed: true, user };
}

function rowToSubCat(row: any): SubCategory {
  return {
    id: row.id,
    mainCategoryId: row.main_category_id,
    name: row.name,
    slug: row.slug,
    description: row.description ?? undefined,
  };
}

function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { data, error } = await supabase
      .from("cached_sub_categories")
      .select("*")
      .eq("id", id)
      .limit(1);

    if (error) {
      return NextResponse.json(
        { ok: false, error: `Database error: ${error.message}` },
        { status: 500 }
      );
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { ok: false, error: "Sub-category not found" },
        { status: 404 }
      );
    }

    const subCategory = rowToSubCat(data[0]);
    return NextResponse.json({ ok: true, subCategory });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: String(e?.message || e) },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await requireAdminApi();
    if (!auth.allowed) {
      return NextResponse.json(
        { ok: false, error: auth.message },
        { status: auth.status }
      );
    }

    const { id } = params;
    const body = await request.json();
    const { name, slug, description, mainCategoryId } = body;

    if (name !== undefined && !name.trim()) {
      return NextResponse.json(
        { ok: false, error: "Sub-category name cannot be empty" },
        { status: 400 }
      );
    }

    const updates: Record<string, any> = {};
    if (name !== undefined) updates.name = name.trim();
    if (slug !== undefined) updates.slug = slug.trim() || slugify(name || "");
    if (description !== undefined) updates.description = description?.trim() || null;
    if (mainCategoryId !== undefined) {
      updates.main_category_id = mainCategoryId.trim();
    }
    updates.updated_at = new Date().toISOString();

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { ok: false, error: "No fields to update" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("cached_sub_categories")
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
      return NextResponse.json(
        { ok: false, error: "Sub-category not found" },
        { status: 404 }
      );
    }

    const subCategory = rowToSubCat(data[0]);
    return NextResponse.json({ ok: true, subCategory });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: String(e?.message || e) },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await requireAdminApi();
    if (!auth.allowed) {
      return NextResponse.json(
        { ok: false, error: auth.message },
        { status: auth.status }
      );
    }

    const { id } = params;

    const { error } = await supabase
      .from("cached_sub_categories")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json(
        { ok: false, error: `Failed to delete sub-category: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, deleted: { id } });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: String(e?.message || e) },
      { status: 500 }
    );
  }
}
