import { redirect } from "next/navigation";
import { requireSuperAdmin } from "@/lib/auth/rbac";
import type { ReactNode } from "react";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { allowed, user } = await requireSuperAdmin();

  if (!allowed || !user) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="kemerya-gradient border-b border-white/10">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl kemerya-gold-gradient shadow-lg">
              <span className="text-[#0F172A] text-lg font-bold">🛡️</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-wide">
                Admin Panel
              </h1>
              <p className="text-xs text-[#C9A962] tracking-[0.15em] uppercase">
                Super Admin Console
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {children}
      </div>
    </div>
  );
}
