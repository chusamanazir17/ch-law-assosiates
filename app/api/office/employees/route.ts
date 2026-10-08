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

    // Only super_admin may change `role` or `status`. Strip them from the
    // update for every other office role so a non-admin can never escalate
    // their own (or anyone else's) privileges. The service layer strips them
    // again unless explicitly allowed.
    const { role: _role, status: _status, ...safeUpdates } = body;
    const updates = session.role === "super_admin" ? body : safeUpdates;

    const updated = await updateEmployee(body.id, updates, {
      allowPrivilegedFields: session.role === "super_admin",
    });
    return NextResponse.json({ success: true, employee: updated });
  } catch (error: any) {
    console.error("[API Office Employees PATCH]", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to update employee" }, { status: 400 });
  }
}
