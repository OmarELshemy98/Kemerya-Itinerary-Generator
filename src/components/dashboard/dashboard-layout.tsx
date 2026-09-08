"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { SideMenu } from "@/components/dashboard/side-menu";
import { DashboardHeader } from "@/components/dashboard-header";
import { ToursDataProvider } from "@/components/tours-data-provider";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/lib/auth/rbac";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter();
  const supabase = createClient();
  const [collapsed, setCollapsed] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [userRole, setUserRole] = React.useState<UserRole>("viewer");
  const [userLoading, setUserLoading] = React.useState(true);
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);

  React.useEffect(() => {
    async function fetchUser() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        console.log("=== DEBUG: User ===", user);

        // لو المستخدم مش مسجل دخول، وجهه لصفحة تسجيل الدخول
        if (!user) {
          router.replace("/login");
          return;
        }

        setIsAuthenticated(true);

        // جلب الـ role من قاعدة البيانات مباشرة بدون أي caching
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .maybeSingle();

        console.log("=== DEBUG: Profile ===", profile);
        console.log("=== DEBUG: Profile Error ===", profileError);

        if (profile?.role) {
          console.log("=== DEBUG: Setting role to ===", profile.role);
          setUserRole(profile.role as UserRole);
        } else {
          console.log("=== DEBUG: No role found, checking user metadata ===");
          // لو مفيش profile، جرب من الـ user metadata
          const metadataRole = user.user_metadata?.role;
          if (metadataRole) {
            console.log("=== DEBUG: Role from metadata ===", metadataRole);
            setUserRole(metadataRole as UserRole);
          }
        }
      } catch (error) {
        console.error("=== DEBUG: Error fetching user ===", error);
        // في حالة أي خطأ، وجهه لصفحة تسجيل الدخول
        router.replace("/login");
      } finally {
        setUserLoading(false);
      }
    }
    fetchUser();
  }, [supabase, router]);

  // مراقبة حالة المصادقة في الوقت الفعلي
  React.useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      // لو المستخدم سجل خروج أو انتهت الجلسة، وجهه لصفحة تسجيل الدخول
      if (event === "SIGNED_OUT" || !session) {
        router.replace("/login");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, router]);

  const handleToggle = React.useCallback(() => {
    setCollapsed((c) => !c);
  }, []);

  const handleMobileClose = React.useCallback(() => {
    setMobileOpen((o) => !o);
  }, []);

  // عرض حالة التحميل أثناء التحقق من المصادقة
  if (userLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#C9A962] border-t-transparent" />
          <p className="text-sm text-slate-500">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  // لو المستخدم مش مسجل دخول، لا تعرض أي شيء (سيتم التحويل لصفحة تسجيل الدخول)
  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#C9A962] border-t-transparent" />
          <p className="text-sm text-slate-500">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <ToursDataProvider>
      <div className="min-h-screen bg-slate-50">
        {/* Debug Banner - احذفه بعد ما المشكلة تتحل */}
        <div className="fixed bottom-4 right-4 z-50 rounded-lg bg-black/80 px-4 py-2 text-sm text-white shadow-lg">
          <div>Role: <span className="font-bold text-yellow-400">{userRole}</span></div>
          <div>Is Super Admin: <span className={userRole === "super_admin" ? "text-green-400" : "text-red-400"}>{userRole === "super_admin" ? "YES" : "NO"}</span></div>
        </div>
        
        <SideMenu
          userRole={userRole}
          collapsed={collapsed}
          onToggle={handleToggle}
          mobileOpen={mobileOpen}
          onMobileClose={handleMobileClose}
        />
        <div
          className={cn(
            "transition-all duration-300 ease-in-out",
            collapsed ? "lg:ml-16" : "lg:ml-64"
          )}
        >
          <DashboardHeader />
          <main className="p-4 sm:p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </ToursDataProvider>
  );
}
