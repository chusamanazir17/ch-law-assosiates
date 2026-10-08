import { NextResponse, type NextRequest } from "next/server";
import {
  requireOfficeAccess,
  officeErrorResponse,
  isOfficeAdminRole,
} from "@/lib/auth/officePermissions";
import { listAttendance, recordAttendance } from "@/lib/services/employees.service";
import { validateBody, attendanceSchema } from "@/lib/validation/office";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const auth = await requireOfficeAccess("attendance", "GET", request);
    if (!auth.ok) return auth.response;

    const date = request.nextUrl.searchParams.get("date") || undefined;
    const records = await listAttendance(date);
    return NextResponse.json({ success: true, attendance: records });
  } catch (error: any) {
    console.error("[API Office Attendance GET]", error);
    return officeErrorResponse(error, "Failed to load attendance", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireOfficeAccess("attendance", "POST", request);
    if (!auth.ok) return auth.response;

    const body = await request.json();

    // RBAC-3: non-admin roles may only record their own attendance. Admins
    // may record for any employee id.
    const employeeId = isOfficeAdminRole(auth.session.role)
      ? body.employee_id || body.employeeId
      : auth.session.user.id;

    const validated = validateBody(attendanceSchema, {
      employee_id: employeeId,
      date: body.date,
      status: body.status,
      check_in_time: body.check_in_time || body.checkInTime,
      check_out_time: body.check_out_time || body.checkOutTime,
      notes: body.notes,
    });
    if (!validated.success) {
      return NextResponse.json({ success: false, error: validated.error }, { status: 400 });
    }

    const record = await recordAttendance(validated.data as any);
    return NextResponse.json({ success: true, record }, { status: 201 });
  } catch (error: any) {
    console.error("[API Office Attendance POST]", error);
    return officeErrorResponse(error, "Failed to record attendance");
  }
}
