import { NextResponse } from "next/server";
import {
  requireOfficeAccess,
  officeErrorResponse,
} from "@/lib/auth/officePermissions";
import { getOfficeDashboardStats } from "@/lib/services/dashboard.service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // FIN-08: the dashboard aggregates cash/P&L/staff data — not served to
    // reception roles.
    const auth = await requireOfficeAccess("dashboard", "GET");
    if (!auth.ok) return auth.response;

    const stats = await getOfficeDashboardStats();
    return NextResponse.json({ success: true, stats });
  } catch (error: any) {
    console.error("[API Office Dashboard GET]", error);
    return officeErrorResponse(error, "Failed to load dashboard statistics", 500);
  }
}
