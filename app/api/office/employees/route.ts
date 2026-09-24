import { NextResponse, type NextRequest } from "next/server";
import { getUnifiedSession, canAccessOfficeSystem } from "@/lib/services/auth.service";
import { listEmployees, updateEmployee } from "@/lib/services/employees.service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getUnifiedSession();
    if (!session || !canAccessOfficeSystem(session.role)) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const employees = await listEmployees();
    return NextResponse.json({ success: true, employees });
  } catch (error: any) {
    console.error("[API Office Employees GET]", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to load employees" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getUnifiedSession();
    if (!session || !canAccessOfficeSystem(session.role)) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    if (!body.id) {
      return NextResponse.json({ success: false, error: "Employee ID is required" }, { status: 400 });
    }

    const updated = await updateEmployee(body.id, body);
    return NextResponse.json({ success: true, employee: updated });
  } catch (error: any) {
    console.error("[API Office Employees PATCH]", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to update employee" }, { status: 400 });
  }
}
