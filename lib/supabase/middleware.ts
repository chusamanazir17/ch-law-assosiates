import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/types/database.types";
import { getSupabasePublicConfig } from "@/config/env";

function loginRedirect(request: NextRequest, reason?: string) {
  const url = request.nextUrl.clone();
  url.pathname = "/admin/login";
  if (reason) url.searchParams.set("error", reason);
  return NextResponse.redirect(url);
}

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  const config = getSupabasePublicConfig();
  const pathname = request.nextUrl.pathname;

  // Public pages remain renderable before the CMS is configured. Admin pages fail closed.
  if (!config) {
    if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
      return loginRedirect(request, "configuration");
    }
    return response;
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

  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    if (!user) return loginRedirect(request);

    const { data: isAdmin, error: adminError } = await supabase.rpc("is_admin", {
      p_user_id: user.id,
    });

    if (adminError || !isAdmin) return loginRedirect(request, "unauthorized");
  }

  if (pathname === "/admin/login" && user) {
    const { data: isAdmin } = await supabase.rpc("is_admin", { p_user_id: user.id });
    if (isAdmin) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin";
      url.search = "";
      const redirectResponse = NextResponse.redirect(url);
      response.cookies.getAll().forEach((cookie) => redirectResponse.cookies.set(cookie));
      return redirectResponse;
    }
  }

  return response;
}
