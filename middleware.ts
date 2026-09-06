import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/middleware";

const PUBLIC_FILE_EXT = [
  ".png", ".jpg", ".jpeg", ".svg", ".ico", ".webp", ".gif",
  ".css", ".js", ".mjs", ".woff", ".woff2", ".ttf", ".otf",
  ".map", ".txt", ".xml", ".json"
];

function isStaticFile(pathname: string) {
  if (pathname.startsWith("/_next/") || pathname.startsWith("/__next/")) return true;
  const lower = pathname.toLowerCase();
  for (const ext of PUBLIC_FILE_EXT) {
    if (lower.endsWith(ext)) return true;
  }
  if (pathname.startsWith("/logo-") || pathname.startsWith("/favicon.")) return true;
  return false;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // تجاهل الملفات الثابتة والصور
  if (isStaticFile(pathname)) {
    return NextResponse.next();
  }

  const { supabase, response } = createClient(request);
  const { data: { session } } = await supabase.auth.getSession();

  const isAuthRoute = pathname === "/login";
  const isPublicApi = pathname.startsWith("/api/auth/") || pathname.startsWith("/api/tours");

  // الحالة الأولى: لو المستخدم مش مسجل دخول
  if (!session?.user) {
    // مسموح له فقط بصفحة تسجيل الدخول أو الـ APIs العامة
    if (isAuthRoute || isPublicApi) {
      return response;
    }
    // طرده لصفحة تسجيل الدخول لو حاول يفتح أي مسار تاني (بما في ذلك الصفحة الرئيسية)
    if (pathname === "/" || !isStaticFile(pathname)) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // الحالة الثانية: لو المستخدم مسجل دخول
  if (session?.user) {
    // لو حاول يفتح الصفحة الرئيسية أو صفحة الدخول، وجهه فوراً للوحة التحكم
    if (pathname === "/" || isAuthRoute) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // حماية مسارات السوبر أدمن
    const isAdminRoute = pathname.startsWith("/admin") || pathname.startsWith("/api/admin");
    if (isAdminRoute) {
      try {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role, is_active")
          .eq("id", session.user.id)
          .maybeSingle();

        if (!profile || !profile.is_active || profile.role !== "super_admin") {
          if (pathname.startsWith("/api/admin")) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
          }
          return NextResponse.redirect(new URL("/dashboard", request.url));
        }
      } catch {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};