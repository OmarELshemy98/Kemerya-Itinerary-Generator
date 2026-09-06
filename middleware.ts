import { type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/middleware";
import { NextResponse } from "next/server";

function isPublicAsset(pathname: string): boolean {
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/__next") ||
    pathname.startsWith("/favicon.") ||
    pathname.startsWith("/logo-") ||
    pathname.endsWith(".png") ||
    pathname.endsWith(".jpg") ||
    pathname.endsWith(".jpeg") ||
    pathname.endsWith(".svg") ||
    pathname.endsWith(".ico") ||
    pathname.endsWith(".css") ||
    pathname.endsWith(".js") ||
    pathname.endsWith(".woff") ||
    pathname.endsWith(".woff2") ||
    pathname.endsWith(".ttf") ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml"
  ) {
    return true;
  }
  return false;
}

export async function middleware(request: NextRequest) {
  const { supabase, response } = createClient(request);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  if (isPublicAsset(pathname)) {
    return response;
  }

  const isLoginPage = pathname === "/login";
  const isAuthApi = pathname.startsWith("/api/auth");
  const isToursPublicApi = pathname === "/api/tours";
  const isNotFoundPage = pathname === "/_not-found";

  if (isLoginPage || isAuthApi || isToursPublicApi || isNotFoundPage) {
    if (isLoginPage && user) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/dashboard";
      redirectUrl.searchParams.delete("next");
      return NextResponse.redirect(redirectUrl);
    }
    return response;
  }

  if (!user) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    if (pathname !== "/" && pathname !== "/login") {
      redirectUrl.searchParams.set("next", pathname);
    }
    return NextResponse.redirect(redirectUrl);
  }

  if (pathname === "/") {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/dashboard";
    return NextResponse.redirect(redirectUrl);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, is_active")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || !profile.is_active) {
    const logoutUrl = request.nextUrl.clone();
    logoutUrl.pathname = "/api/auth/logout";
    const redirect = NextResponse.redirect(new URL("/login", request.url));
    try {
      await supabase.auth.signOut();
    } catch {}
    redirect.cookies.delete("sb-access-token");
    redirect.cookies.delete("sb-refresh-token");
    return redirect;
  }

  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    if (profile.role !== "super_admin") {
      if (pathname.startsWith("/api/admin")) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/dashboard";
      return NextResponse.redirect(redirectUrl);
    }
  }

  return response;
}

export const config = {
  matcher: ["/((?!.*\\.).*)"],
};
