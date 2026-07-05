import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

async function query(table: string, filters: Record<string, string>, select = "id") {
  if (!SUPABASE_URL || !ANON_KEY) return null;
  const params = new URLSearchParams({ select, ...filters });
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${params}`, {
    headers: {
      apikey: ANON_KEY,
      Authorization: `Bearer ${ANON_KEY}`,
    },
  });
  if (!res.ok) return null;
  return res.json();
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (request.method !== "GET") return NextResponse.next();
  if (pathname.startsWith("/_next") || pathname.startsWith("/api")) return NextResponse.next();

  if (pathname.startsWith("/admin")) {
    if (!SUPABASE_URL || !ANON_KEY) {
      if (pathname !== "/admin/login") {
        return NextResponse.redirect(new URL("/admin/login", request.url));
      }
      return NextResponse.next();
    }

    let supabaseResponse = NextResponse.next({ request });

    const supabase = createServerClient(SUPABASE_URL, ANON_KEY, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            supabaseResponse.cookies.set(name, value, options);
          });
        },
      },
    });

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (pathname === "/admin/login" && user) {
        return NextResponse.redirect(new URL("/admin/dashboard", request.url));
      }

      if (pathname !== "/admin/login" && !user) {
        return NextResponse.redirect(new URL("/admin/login", request.url));
      }

      return supabaseResponse;
    } catch {
      if (pathname !== "/admin/login") {
        return NextResponse.redirect(new URL("/admin/login", request.url));
      }
      return NextResponse.next();
    }
  }

  if (pathname === "/" || pathname === "") return NextResponse.next();

  const segments = pathname.split("/").filter(Boolean);
  if (segments.length !== 1) return NextResponse.next();

  const source = segments[0];

  try {
    // Check if this slug is a location SEO page
    const locData = await query("location_seo", {
      slug: `eq.${source}`,
      is_active: "eq.true",
    }, "id");

    if (Array.isArray(locData) && locData.length > 0) {
      return NextResponse.next();
    }

    // Check redirects
    const redirData = await query("redirects", {
      source: `eq.${source}`,
      is_active: "eq.true",
    }, "destination,status_code");

    if (Array.isArray(redirData) && redirData.length > 0) {
      const { destination, status_code } = redirData[0];
      const dest = destination.startsWith("http")
        ? destination
        : `/${destination.replace(/^\//, "")}`;
      return NextResponse.redirect(new URL(dest, request.url), status_code as 301 | 302);
    }
  } catch {
    // Fail silently
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|logo.svg|logo-icon.svg|logo-text.svg|logo-horizontal.svg|og-image.jpg|robots.txt|sitemap.xml).*)",
  ],
};
