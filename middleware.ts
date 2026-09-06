import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/middleware";

const PUBLIC_ROUTES = new Set(["/login", "/_not-found", "/_error"]);
const PUBLIC_API_PREFIXES = ["/api/auth/", "/api/tours"];
const PUBLIC_FILE_EXT = [
  ".png", ".jpg", ".jpeg", ".svg", ".ico", ".webp", ".gif",
  ".css", ".js", ".mjs", ".woff", ".woff2", ".ttf", ".otf",
  ".map", ".txt", ".xml", ".json"
];

function isPublicRequest(pathname: string): boolean {
  if (pathname.startsWith("/_next/") || pathname.startsWith("/__next/")) return true;
  if (PUBLIC_ROUTES.has(pathname)) return true;
  for (const prefix of PUBLIC_API_PREFIXES) {
    if (pathname.startsWith(prefix)) return true;
  }
  const lower = pathname.toLowerCase();
  for (const ext of PUBLIC_FILE_EXT) {
    if (lower.endsWith(ext)) return true;
  }
  if (pathname.startsWith("/logo-") || pathname.startsWith("/favicon.")) return true;
  if (pathname === "/robots.txt" || pathname === "/sitemap.xml") return true;
  return false;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isPublicRequest(pathname)) {
    const { response } = createClient(request);
    return response;
  }

  const { supabase, response } = createClient(request);

  try {
    const { data: { session }, error: sessErr } = await supabase.auth.getSession();
    if (sessErr || !session?.user) {
      const redirect = NextResponse.redirect(new URL("/login", request.url));
      redirect.headers.set("x-middleware-cache", "no-cache");
      return redirect;
    }

    if (pathname === "/login") {
      const redirect = NextResponse.redirect(new URL("/dashboard", request.url));
      redirect.headers.set("x-middleware-cache", "no-cache");
      return redirect;
    }

    if (pathname === "/") {
      const redirect = NextResponse.redirect(new URL("/dashboard", request.url));
      redirect.headers.set("x-middleware-cache", "no-cache");
      return redirect;
    }

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
          const redirect = NextResponse.redirect(new URL("/dashboard", request.url));
          redirect.headers.set("x-middleware-cache", "no-cache");
          return redirect;
        }
      } catch {
        if (pathname.startsWith("/api/admin")) {
          return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }
        const redirect = NextResponse.redirect(new URL("/dashboard", request.url));
        redirect.headers.set("x-middleware-cache", "no-cache");
        return redirect;
      }
    }

    response.headers.set("x-middleware-cache", "no-cache");
    return response;
  } catch {
    const redirect = NextResponse.redirect(new URL("/login", request.url));
    redirect.headers.set("x-middleware-cache", "no-cache");
    return redirect;
  }
}

export const config = {
  matcher: [
    "/",
    "/login",
    "/dashboard/:path*",
    "/admin/:path*",
    "/api/admin/:path*",
    "/api/scrape/:path*",
    "/((?!_next|__next|favicon|logo-.*\\.png$|.*\\.(png|jpg|jpeg|svg|ico|webp|gif|css|js|mjs|woff|woff2|ttf|otf|map|txt|xml|json)$).*)",
  ],
};
