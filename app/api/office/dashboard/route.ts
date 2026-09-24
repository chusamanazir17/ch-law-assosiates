import { NextResponse } from "next/server";
import { getUnifiedSession, canAccessOfficeSystem } from "@/lib/services/auth.service";
import { getOfficeDashboardStats } from "@/lib/services/dashboard.service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getUnifiedSession();
    if (!session || !canAccessOfficeSystem(session.role)) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const stats = await getOfficeDashboardStats();
    return NextResponse.json({ success: true, stats });
  } catch (error: any) {
    console.error("[API Office Dashboard GET]", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to load dashboard statistics" }, { status: 500 });
  }
}
