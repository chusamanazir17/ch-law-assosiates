import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { getUnifiedSession } from "@/lib/services/auth.service";
import { CSRF_COOKIE_NAME, newCsrfToken } from "@/lib/auth/csrf";

export const dynamic = "force-dynamic";

export async function GET(_request: NextRequest) {
  try {
    const session = await getUnifiedSession();
    if (!session) {
      return NextResponse.json({ authenticated: false, role: null });
    }

    const response = NextResponse.json({
      authenticated: true,
      role: session.role,
      user: {
        id: session.user.id,
        email: session.user.email,
        name: session.profile?.full_name || session.user.user_metadata?.name || "Admin",
      },
    });

    // Ensure an authenticated session always carries the double-submit CSRF
    // cookie, so SPAs that never hit /api/admin/login still get one.
    const store = await cookies();
    if (!store.get(CSRF_COOKIE_NAME)?.value) {
      response.cookies.set(CSRF_COOKIE_NAME, newCsrfToken(), {
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
      });
    }

    return response;
  } catch (err) {
    return NextResponse.json({ authenticated: false, role: null });
  }
}
