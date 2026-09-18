import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_COOKIE_NAME } from "@/lib/auth/adminAuth";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const response = NextResponse.json({
    success: true,
    message: "Logged out successfully.",
  });

  response.cookies.delete(ADMIN_COOKIE_NAME);
  return response;
}

export async function GET(request: NextRequest) {
  const url = request.nextUrl.clone();
  url.pathname = "/admin/login";
  const response = NextResponse.redirect(url);
  response.cookies.delete(ADMIN_COOKIE_NAME);
  return response;
}
