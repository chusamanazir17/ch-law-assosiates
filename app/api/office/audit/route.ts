import { NextResponse, type NextRequest } from "next/server";
import { getUnifiedSession, canAccessOfficeSystem } from "@/lib/services/auth.service";
import { listAuditLogs, recordAuditLog } from "@/lib/services/audit.service";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const session = await getUnifiedSession();
    if (!session || !canAccessOfficeSystem(session.role)) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const entityType = request.nextUrl.searchParams.get("entity_type") || undefined;
    const limit = request.nextUrl.searchParams.get("limit")
      ? parseInt(request.nextUrl.searchParams.get("limit")!, 10)
      : 100;

    const logs = await listAuditLogs({ entityType, limit });
    return NextResponse.json({ success: true, logs });
  } catch (error: any) {
    console.error("[API Office Audit GET]", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to load audit logs" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getUnifiedSession();
    if (!session || !canAccessOfficeSystem(session.role)) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    await recordAuditLog({
      user_id: session.user.id,
      user_name: session.profile?.full_name || "Office Staff",
      user_role: session.role,
      action: body.action,
      entity_type: body.entity_type || body.module || "General",
      entity_id: body.entity_id || body.recordId || null,
      details: body.details || null,
      ip_address: request.headers.get("x-forwarded-for") || undefined,
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error: any) {
    console.error("[API Office Audit POST]", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to record audit log" }, { status: 400 });
  }
}
