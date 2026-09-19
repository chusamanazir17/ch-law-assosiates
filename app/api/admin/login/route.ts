import { NextResponse, type NextRequest } from "next/server";
import {
  validateAdminCredentials,
  createAdminToken,
  ADMIN_COOKIE_NAME,
} from "@/lib/auth/adminAuth";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";

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
    };

    const usernameInput = (body.username || body.email || "").trim();
    const passwordInput = (body.password || "").trim();

    if (!usernameInput || !passwordInput) {
      return NextResponse.json(
        { success: false, error: "Username and password are required." },
        { status: 400 }
      );
    }

    const isValid = validateAdminCredentials(usernameInput, passwordInput);

    if (!isValid) {
      return NextResponse.json(
        { success: false, error: "Invalid username or password." },
        { status: 401 }
      );
    }

    const token = await createAdminToken();

    const response = NextResponse.json({
      success: true,
      message: "Authentication successful.",
      redirect: "/admin",
    });

    response.cookies.set(ADMIN_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });

    return response;
  } catch (error) {
    console.error("[Admin Login] Error:", error);
    return NextResponse.json(
      { success: false, error: "An internal server error occurred." },
      { status: 500 }
    );
  }
}
