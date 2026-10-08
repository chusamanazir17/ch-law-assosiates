import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_COOKIE_NAME, revokeAdminSession } from "@/lib/auth/adminAuth";
import { CSRF_COOKIE_NAME } from "@/lib/auth/csrf";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/**
 * Logout is POST-only (SEC-02: the old state-changing GET was CSRF-able and
 * is now a 405). It terminates both sessions server-side:
 *  - Supabase Auth session via supabase.auth.signOut() (AUTH-1), and
 *  - the local admin token via the server-side revocation registry (AUTH-3).
 */
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const adminToken = cookieStore.get(ADMIN_COOKIE_NAME)?.value;

    // Revoke the admin session so the token cannot be reused (best effort;
    // logout still clears cookies even if the registry write fails).
    if (adminToken) {
      await revokeAdminSession(adminToken);
    }

    // Terminate the Supabase Auth session server-side as well.
    try {
      const supabase = await createClient();
      await supabase.auth.signOut();
    } catch (signOutErr) {
      console.error("[Admin Logout] supabase signOut failed:", signOutErr);
    }
  } catch (err) {
    console.error("[Admin Logout] error:", err);
  }

  const response = NextResponse.json({
    success: true,
    message: "Logged out successfully.",
  });

  response.cookies.delete(ADMIN_COOKIE_NAME);
  response.cookies.delete(CSRF_COOKIE_NAME);
  return response;
}

export async function GET() {
  return NextResponse.json(
    { success: false, error: "Method not allowed. Use POST /api/admin/logout." },
    { status: 405 }
  );
}
