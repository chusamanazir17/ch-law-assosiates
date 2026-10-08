import { NextResponse, type NextRequest } from "next/server";
import {
  requireOfficeAccess,
  officeErrorResponse,
} from "@/lib/auth/officePermissions";
import { listEmployees, updateEmployee } from "@/lib/services/employees.service";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    // FIN-07: staff directory with full PII is admin-only.
    const auth = await requireOfficeAccess("employees", "GET", request);
    if (!auth.ok) return auth.response;

    const employees = await listEmployees({ fullPII: true });
    return NextResponse.json({ success: true, employees });
  } catch (error: any) {
    console.error("[API Office Employees GET]", error);
    return officeErrorResponse(error, "Failed to load employees", 500);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const auth = await requireOfficeAccess("employees", "PATCH", request);
    if (!auth.ok) return auth.response;

    const body = await request.json();
    if (!body.id) {
      return NextResponse.json({ success: false, error: "Employee ID is required" }, { status: 400 });
    }

    // Only super_admin may change `role` or `status`. Strip them from the
    // update for every other office role so a non-admin can never escalate
    // their own (or anyone else's) privileges. The service layer strips them
    // again unless explicitly allowed.
    const { role: _role, status: _status, ...safeUpdates } = body;
    const updates = auth.session.role === "super_admin" ? body : safeUpdates;

    const updated = await updateEmployee(body.id, updates, {
      allowPrivilegedFields: auth.session.role === "super_admin",
    });
    return NextResponse.json({ success: true, employee: updated });
  } catch (error: any) {
    console.error("[API Office Employees PATCH]", error);
    return officeErrorResponse(error, "Failed to update employee");
  }
}
