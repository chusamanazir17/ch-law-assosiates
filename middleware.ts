import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { shouldVerifyCsrf, verifyCsrfRequest } from "@/lib/auth/csrf";

export async function middleware(request: NextRequest) {
  // Double-submit-cookie CSRF check (SEC-02) for state-changing cookie-session
  // API calls. Safe methods and the login/logout endpoints are exempt —
  // see lib/auth/csrf.ts.
  if (shouldVerifyCsrf(request) && !verifyCsrfRequest(request)) {
    return NextResponse.json(
      {
        success: false,
        error: "CSRF token missing or invalid. Refresh the page and try again.",
      },
      { status: 403 }
    );
  }

  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, icons, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
