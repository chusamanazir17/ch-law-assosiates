import { NextResponse, type NextRequest } from "next/server";
import { getAdminSession } from "@/lib/auth/admin";
import { listAttendance, recordAttendance } from "@/lib/services/employees.service";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const date = request.nextUrl.searchParams.get("date") || undefined;
    const records = await listAttendance(date);
    return NextResponse.json({ success: true, attendance: records });
  } catch (error: any) {
    console.error("[API Office Attendance GET]", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to load attendance" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const record = await recordAttendance(body);
    return NextResponse.json({ success: true, record }, { status: 201 });
  } catch (error: any) {
    console.error("[API Office Attendance POST]", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to record attendance" }, { status: 400 });
  }
}
