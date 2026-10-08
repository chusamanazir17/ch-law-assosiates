import { NextResponse, type NextRequest } from "next/server";
import {
  requireOfficeAccess,
  officeErrorResponse,
} from "@/lib/auth/officePermissions";
import { listAuditLogs } from "@/lib/services/audit.service";
import { clampLimitParam } from "@/lib/validation/office";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    // RBAC-2: audit logs are readable by super_admin / office_admin only,
    // matching the RLS intent (the old service-role read nullified it).
    const auth = await requireOfficeAccess("audit", "GET", request);
    if (!auth.ok) return auth.response;

    const entityType = request.nextUrl.searchParams.get("entity_type") || undefined;
    // API-5: clamp the attacker-controlled limit.
    const limit = clampLimitParam(request.nextUrl.searchParams.get("limit"), 100, 500);

    const logs = await listAuditLogs({ entityType, limit });
    return NextResponse.json({ success: true, logs });
  } catch (error: any) {
    console.error("[API Office Audit GET]", error);
    return officeErrorResponse(error, "Failed to load audit logs", 500);
  }
}

/**
 * API-4: the client-side audit write path is removed. Audit rows must only be
 * emitted server-side (lib/services/audit.service.ts recordAuditLog) with the
 * session identity — never from arbitrary client-supplied action/entity data.
 */
export async function POST() {
  return NextResponse.json(
    {
      success: false,
      error:
        "Direct audit-log writes are disabled. Audit entries are recorded server-side only.",
    },
    { status: 405 }
  );
}
