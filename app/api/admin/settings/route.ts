import { revalidatePath } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import { getAdminSession } from "@/lib/auth/admin";
import { getSiteSettings, updateSiteSettings } from "@/lib/db/siteSettingsStore";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const settings = await getSiteSettings();
    return NextResponse.json({ success: true, settings });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to load settings" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const updated = await updateSiteSettings(body);

    revalidatePath("/");
    revalidatePath("/updates");
    revalidatePath("/services");

    return NextResponse.json({
      success: true,
      message: "Site settings updated successfully.",
      settings: updated,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to update settings" },
      { status: 500 }
    );
  }
}

export const PUT = POST;
