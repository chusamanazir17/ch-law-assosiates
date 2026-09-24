import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/types/database.types";
import { getSupabasePublicConfig } from "@/config/env";
import { ADMIN_COOKIE_NAME, verifyAdminToken } from "@/lib/auth/adminAuth";

function loginRedirect(request: NextRequest, reason?: string) {
  const url = request.nextUrl.clone();
  url.pathname = "/admin";
  if (reason) url.searchParams.set("error", reason);
  url.searchParams.set("redirectedFrom", request.nextUrl.pathname);
  return NextResponse.redirect(url);
}

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  const pathname = request.nextUrl.pathname;

  // Allow the /admin portal selection page, /admin/login, and /office routes direct access
  if (
    pathname === "/admin" ||
    pathname === "/admin/login" ||
    pathname === "/api/admin/login" ||
    pathname.startsWith("/office")
  ) {
    return response;
  }

  // Check if target is a protected CMS route
  const isCmsRoute = pathname.startsWith("/admin/") || pathname.startsWith("/api/admin/");

  if (!isCmsRoute) {
    return response;
  }

  // 1. Check verified local admin cookie session (grants super_admin privileges)
  const adminCookie = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const isLocalAdmin = await verifyAdminToken(adminCookie);

  if (isLocalAdmin) {
    // Local admin is super_admin and can access both portals
    return response;
  }

  // 2. Check Supabase credentials
  const config = getSupabasePublicConfig();
  if (!config) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Authentication required." },
        { status: 401 }
      );
    }
    return loginRedirect(request, "unauthorized");
  }

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

  if (!user) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Authentication required." },
        { status: 401 }
      );
    }
    return loginRedirect(request, "unauthorized");
  }

  // Fetch role for user
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, status")
    .eq("id", user.id)
    .maybeSingle();

  let userRole = (profile?.role as string) || "staff";

  // Fallback check on legacy is_admin RPC
  if (!profile?.role) {
    const { data: isAdmin } = await supabase.rpc("is_admin", { p_user_id: user.id });
    if (isAdmin) userRole = "super_admin";
  }

  // Super Admin can access everything
  if (userRole === "super_admin") {
    return response;
  }

  // Guard CMS routes
  if (isCmsRoute) {
    const canAccessCms = userRole === "website_admin" || userRole === "office_admin";
    if (!canAccessCms) {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json(
          { success: false, error: "Forbidden: Website Admin access required." },
          { status: 403 }
        );
      }
      return loginRedirect(request, "cms_forbidden");
    }
  }

  // Guard Office routes
  if (isOfficeRoute) {
    const canAccessOffice = [
      "office_admin",
      "lawyer",
      "staff",
      "accountant",
      "receptionist",
    ].includes(userRole);

    if (!canAccessOffice) {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json(
          { success: false, error: "Forbidden: Office Management access required." },
          { status: 403 }
        );
      }
      return loginRedirect(request, "office_forbidden");
    }
  }

  return response;
}
