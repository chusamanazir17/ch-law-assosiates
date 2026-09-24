import { NextResponse, type NextRequest } from "next/server";
import { getUnifiedSession, canAccessOfficeSystem } from "@/lib/services/auth.service";
import { getSiteSetting, updateSiteSetting } from "@/lib/services/settings.service";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const session = await getUnifiedSession();
    if (!session || !canAccessOfficeSystem(session.role)) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const key = request.nextUrl.searchParams.get("key") || "office_business_profile";
    const value = await getSiteSetting(key);
    return NextResponse.json({ success: true, key, value });
  } catch (error: any) {
    console.error("[API Office Settings GET]", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to load settings" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getUnifiedSession();
    if (!session || !canAccessOfficeSystem(session.role)) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const key = body.key || "office_business_profile";
    await updateSiteSetting(key, body.value);

    return NextResponse.json({ success: true, key, value: body.value });
  } catch (error: any) {
    console.error("[API Office Settings POST]", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to save settings" }, { status: 400 });
  }
}
