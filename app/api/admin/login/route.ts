import { NextResponse, type NextRequest } from "next/server";
import {
  validateAdminCredentials,
  createAdminToken,
  registerAdminSession,
  getAdminSessionTtlHours,
  ADMIN_COOKIE_NAME,
} from "@/lib/auth/adminAuth";
import { CSRF_COOKIE_NAME, newCsrfToken } from "@/lib/auth/csrf";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/** Cookie flags shared by the session and CSRF cookies. */
function sessionCookieFlags(maxAgeSeconds: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: maxAgeSeconds,
  };
}

/** Issue the double-submit CSRF cookie (readable by browser JS). */
function setCsrfCookie(response: NextResponse) {
  response.cookies.set(CSRF_COOKIE_NAME, newCsrfToken(), {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
  });
}

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const rateLimitResult = checkRateLimit(`admin-login:${ip}`, 5, 15 * 60 * 1000); // 5 attempts per 15 min

    if (!rateLimitResult.success) {
      const retrySeconds = Math.ceil(rateLimitResult.resetMs / 1000);
      return NextResponse.json(
        {
          success: false,
          error: `Too many login attempts. Please try again in ${Math.ceil(retrySeconds / 60)} minute(s).`,
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(retrySeconds),
          },
        }
      );
    }

    const body = (await request.json()) as {
      username?: string;
      email?: string;
      password?: string;
      targetPortal?: "cms" | "office";
    };

    const usernameInput = (body.username || body.email || "").trim();
    const passwordInput = (body.password || "").trim();
    const targetPortal = body.targetPortal || "cms";

    if (!usernameInput || !passwordInput) {
      return NextResponse.json(
        { success: false, error: "Username/email and password are required." },
        { status: 400 }
      );
    }

    // 1. Check local admin credentials (Super Admin)
    const isValidLocal = validateAdminCredentials(usernameInput, passwordInput);

    if (isValidLocal) {
      const token = await createAdminToken();
      // Register the session server-side so logout (or an admin) can revoke
      // it. Fail closed: no registry row, no session cookie.
      try {
        await registerAdminSession(token, {
          ip,
          userAgent: request.headers.get("user-agent"),
        });
      } catch (regErr) {
        console.error("[Admin Login] session registration failed:", regErr);
        return NextResponse.json(
          { success: false, error: "Login failed. Please try again." },
          { status: 500 }
        );
      }
      const redirectUrl = targetPortal === "office" ? "/office/dashboard" : "/admin/dashboard";

      const response = NextResponse.json({
        success: true,
        role: "super_admin",
        message: "Authentication successful.",
        redirect: redirectUrl,
      });

      const ttlSeconds = Math.floor(getAdminSessionTtlHours() * 3600);
      response.cookies.set(ADMIN_COOKIE_NAME, token, sessionCookieFlags(ttlSeconds));
      setCsrfCookie(response);

      return response;
    }

    // 2. Fallback to Supabase Auth if username is an email
    if (usernameInput.includes("@")) {
      try {
        const supabase = await createClient();
        const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
          email: usernameInput,
          password: passwordInput,
        });

        if (!authErr && authData?.user) {
          // Fetch user role
          const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", authData.user.id)
            .maybeSingle();

          const role = profile?.role || "staff";

          // Verify permission for target portal
          if (targetPortal === "cms") {
            const canCms = role === "super_admin" || role === "website_admin" || role === "office_admin";
            if (!canCms) {
              return NextResponse.json(
                { success: false, error: `Access denied: Role "${role}" is not permitted to access Website CMS.` },
                { status: 403 }
              );
            }
          } else {
            const canOffice = ["super_admin", "office_admin", "lawyer", "accountant", "staff", "receptionist"].includes(role);
            if (!canOffice) {
              return NextResponse.json(
                { success: false, error: `Access denied: Role "${role}" is not permitted to access Office Management.` },
                { status: 403 }
              );
            }
          }

          const redirectUrl = targetPortal === "office" ? "/office/dashboard" : "/admin/dashboard";
          const okResponse = NextResponse.json({
            success: true,
            role,
            message: "Authentication successful.",
            redirect: redirectUrl,
          });
          setCsrfCookie(okResponse);
          return okResponse;
        }
      } catch (sbErr) {
        console.warn("[Admin Login] Supabase auth attempt failed:", sbErr);
      }
    }

    return NextResponse.json(
      { success: false, error: "Invalid credentials. Please verify username/email and password." },
      { status: 401 }
    );
  } catch (error) {
    console.error("[Admin Login] Error:", error);
    return NextResponse.json(
      { success: false, error: "An internal server error occurred." },
      { status: 500 }
    );
  }
}
