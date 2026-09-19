import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/types/database.types";
import { getSupabasePublicConfig } from "@/config/env";
import { ADMIN_COOKIE_NAME, verifyAdminToken } from "@/lib/auth/adminAuth";

function loginRedirect(request: NextRequest, reason?: string) {
  const url = request.nextUrl.clone();
  url.pathname = "/admin/login";
  if (reason) url.searchParams.set("error", reason);
  return NextResponse.redirect(url);
}

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  const pathname = request.nextUrl.pathname;

  // 1. Check verified local admin cookie session
  const adminCookie = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const isLocalAdmin = await verifyAdminToken(adminCookie);

  if (isLocalAdmin) {
    // If authenticated admin visits login page, redirect to dashboard
    if (pathname === "/admin/login") {
      const url = request.nextUrl.clone();
      url.pathname = "/admin";
      url.search = "";
      return NextResponse.redirect(url);
    }

    // Authenticated admin accessing /admin or /api/admin routes
    if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
      return response;
    }
  }

  // 2. Check Supabase credentials if configured
  const config = getSupabasePublicConfig();

  if (!config) {
    // If Supabase is not configured and not logged in as admin:
    if (pathname.startsWith("/api/admin") && pathname !== "/api/admin/login") {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Admin authentication required." },
        { status: 401 }
      );
    }
    if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
      return loginRedirect(request);
    }
    return response;
  }

  // Supabase session handling
  const supabase = createServerClient<Database>(config.url, config.anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));

        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isSupabaseAdmin = false;
  if (user) {
    const { data: isAdmin } = await supabase.rpc("is_admin", {
      p_user_id: user.id,
    });
    isSupabaseAdmin = !!isAdmin;
  }

  const isAuthenticatedAdmin = isLocalAdmin || isSupabaseAdmin;

  // Guard /api/admin/* endpoints
  if (pathname.startsWith("/api/admin") && pathname !== "/api/admin/login") {
    if (!isAuthenticatedAdmin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Admin authentication required." },
        { status: 401 }
      );
    }
    return response;
  }

  // Guard /admin UI routes
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    if (!isAuthenticatedAdmin) {
      return loginRedirect(request);
    }
  }

  if (pathname === "/admin/login" && isAuthenticatedAdmin) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin";
    url.search = "";
    const redirectResponse = NextResponse.redirect(url);
    response.cookies.getAll().forEach((cookie) => redirectResponse.cookies.set(cookie));
    return redirectResponse;
  }

  return response;
}
