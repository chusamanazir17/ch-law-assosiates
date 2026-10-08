import { NextResponse, type NextRequest } from "next/server";
import {
  requireOfficeAccess,
  officeErrorResponse,
} from "@/lib/auth/officePermissions";
import { getSiteSetting, updateSiteSetting } from "@/lib/services/settings.service";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const auth = await requireOfficeAccess("settings", "GET", request);
    if (!auth.ok) return auth.response;

    const key = request.nextUrl.searchParams.get("key") || "office_business_profile";
    const value = await getSiteSetting(key);
    return NextResponse.json({ success: true, key, value });
  } catch (error: any) {
    console.error("[API Office Settings GET]", error);
    return officeErrorResponse(error, "Failed to load settings", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireOfficeAccess("settings", "POST", request);
    if (!auth.ok) return auth.response;

    const body = await request.json();
    const key = body.key || "office_business_profile";
    // SEC-07: updateSiteSetting enforces the office_* key allowlist and
    // throws on anything else.
    await updateSiteSetting(key, body.value);

    return NextResponse.json({ success: true, key, value: body.value });
  } catch (error: any) {
    console.error("[API Office Settings POST]", error);
    return officeErrorResponse(error, "Failed to save settings");
  }
}
