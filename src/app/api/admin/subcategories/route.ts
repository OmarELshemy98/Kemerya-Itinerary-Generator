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

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("cached_sub_categories")
      .select("*")
      .order("name", { ascending: true });

    if (error) {
      return NextResponse.json(
        { ok: false, error: `Database error: ${error.message}` },
        { status: 500 }
      );
    }

    const subCategories = (data || []).map(rowToSubCat);
    return NextResponse.json({ ok: true, subCategories });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: String(e?.message || e) },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireAdminApi();
    if (!auth.allowed) {
      return NextResponse.json(
        { ok: false, error: auth.message },
        { status: auth.status }
      );
    }

    const body = await request.json();
    const { name, slug, description, mainCategoryId } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { ok: false, error: "Sub-category name is required" },
        { status: 400 }
      );
    }
    if (!mainCategoryId || !mainCategoryId.trim()) {
      return NextResponse.json(
        { ok: false, error: "Main category ID is required" },
        { status: 400 }
      );
    }

    const { count, error: existsErr } = await supabase
      .from("cached_main_categories")
      .select("*", { count: "exact", head: true })
      .eq("id", mainCategoryId);

    if (existsErr) {
      return NextResponse.json(
        { ok: false, error: `Failed to verify main category: ${existsErr.message}` },
        { status: 500 }
      );
    }
    if (!count || count === 0) {
      return NextResponse.json(
        { ok: false, error: "Main category not found" },
        { status: 400 }
      );
    }

    const finalSlug = (slug && slug.trim()) || slugify(name);
    const finalId = `sub_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const nowISO = new Date().toISOString();

    const { data, error } = await supabase
      .from("cached_sub_categories")
      .insert({
        id: finalId,
        main_category_id: mainCategoryId.trim(),
        name: name.trim(),
        slug: finalSlug,
        description: description?.trim() || null,
        scraped_at: nowISO,
        inserted_at: nowISO,
        updated_at: nowISO,
      })
      .select("*")
      .limit(1);

    if (error) {
      return NextResponse.json(
        { ok: false, error: `Database error: ${error.message}` },
        { status: 500 }
      );
    }

    const subCategory = data && data[0] ? rowToSubCat(data[0]) : null;
    return NextResponse.json({ ok: true, subCategory });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: String(e?.message || e) },
      { status: 500 }
    );
  }
}
