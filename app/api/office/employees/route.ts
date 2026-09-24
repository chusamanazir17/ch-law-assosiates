import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth/admin";
import { listEmployees } from "@/lib/services/employees.service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const employees = await listEmployees();
    return NextResponse.json({ success: true, employees });
  } catch (error: any) {
    console.error("[API Office Employees GET]", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to load employees" }, { status: 500 });
  }
}
