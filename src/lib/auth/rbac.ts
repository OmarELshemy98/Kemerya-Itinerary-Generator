import { createClient as createSupabaseServer } from "@/lib/supabase/server";

export type UserRole = "super_admin" | "admin" | "operator" | "viewer";

export interface AdminUser {
  id: string;
  email?: string;
  full_name?: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
}

export function isSuperAdmin(user: AdminUser | null | undefined): boolean {
  return user?.role === "super_admin";
}

export function isAdmin(user: AdminUser | null | undefined): boolean {
  return user?.role === "admin" || user?.role === "super_admin";
}

export function isOperator(user: AdminUser | null | undefined): boolean {
  return (
    user?.role === "operator" ||
    user?.role === "admin" ||
    user?.role === "super_admin"
  );
}

export function hasRole(
  user: AdminUser | null | undefined,
  roles: UserRole[]
): boolean {
  if (!user) return false;
  return roles.includes(user.role);
}

export async function getCurrentUserServer(): Promise<AdminUser | null> {
  const supabase = createSupabaseServer();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) return null;

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("full_name, role, is_active, created_at")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    return {
      id: user.id,
      email: user.email,
      full_name: undefined,
      role: "viewer",
      is_active: true,
      created_at: user.created_at ?? new Date().toISOString(),
    };
  }

  return {
    id: user.id,
    email: user.email,
    full_name: profile.full_name,
    role: (profile.role as UserRole) ?? "viewer",
    is_active: profile.is_active ?? true,
    created_at: profile.created_at ?? user.created_at ?? new Date().toISOString(),
  };
}

export async function requireRole(
  roles: UserRole[]
): Promise<{ user: AdminUser | null; allowed: boolean }> {
  const user = await getCurrentUserServer();
  if (!user || !user.is_active) return { user, allowed: false };
  return { user, allowed: hasRole(user, roles) };
}

export async function requireSuperAdmin(): Promise<{
  user: AdminUser | null;
  allowed: boolean;
}> {
  return requireRole(["super_admin"]);
}
