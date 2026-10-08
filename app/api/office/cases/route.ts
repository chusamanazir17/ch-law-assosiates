import { NextResponse, type NextRequest } from "next/server";
import {
  requireOfficeAccess,
  officeErrorResponse,
  isOfficeAdminRole,
} from "@/lib/auth/officePermissions";
import { listCases, createCaseRecord, updateCaseRecord } from "@/lib/services/cases.service";
import {
  validateBody,
  pickAllowed,
  caseCreateSchema,
  caseUpdateSchema,
  CASE_UPDATE_ALLOWLIST,
  CASE_REASSIGN_ALLOWLIST,
} from "@/lib/validation/office";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const auth = await requireOfficeAccess("cases", "GET", request);
    if (!auth.ok) return auth.response;

    const clientId = request.nextUrl.searchParams.get("client_id") || undefined;
    const status = request.nextUrl.searchParams.get("status") || undefined;
    const search = request.nextUrl.searchParams.get("search") || undefined;

    const cases = await listCases({ clientId, status, search });
    return NextResponse.json({ success: true, cases });
  } catch (error: any) {
    console.error("[API Office Cases GET]", error);
    return officeErrorResponse(error, "Failed to load cases", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireOfficeAccess("cases", "POST", request);
    if (!auth.ok) return auth.response;

    const body = await request.json();
    const validated = validateBody(caseCreateSchema, {
      case_number: body.case_number || body.caseNumber,
      title: body.title,
      court_name: body.court_name || body.courtName,
      judge_name: body.judge_name || body.judgeName,
      case_type: body.case_type || body.caseType,
      case_category: body.case_category || body.caseCategory,
      stage: body.stage,
      status: body.status,
      filing_date: body.filing_date || body.filingDate,
      decision_date: body.decision_date || body.decisionDate,
      description: body.description,
      next_hearing_date: body.next_hearing_date || body.nextHearingDate,
      client_id: body.client_id || body.clientId,
      client_role: body.client_role || body.clientRole,
      lawyer_id: body.lawyer_id || body.lawyerId,
    });
    if (!validated.success) {
      return NextResponse.json({ success: false, error: validated.error }, { status: 400 });
    }

    const newCase = await createCaseRecord(validated.data as any);
    return NextResponse.json({ success: true, case: newCase }, { status: 201 });
  } catch (error: any) {
    console.error("[API Office Cases POST]", error);
    return officeErrorResponse(error, "Failed to create case");
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const auth = await requireOfficeAccess("cases", "PATCH", request);
    if (!auth.ok) return auth.response;

    const body = await request.json();
    if (!body.id) {
      return NextResponse.json({ success: false, error: "Case ID is required" }, { status: 400 });
    }

    // API-1: mass-assignment guard. Field updates are allowlisted; lawyer /
    // client reassignment additionally requires an admin role.
    const fields = pickAllowed(body, CASE_UPDATE_ALLOWLIST);
    const validated = validateBody(caseUpdateSchema, fields);
    if (!validated.success) {
      return NextResponse.json({ success: false, error: validated.error }, { status: 400 });
    }

    const allowReassignment = isOfficeAdminRole(auth.session.role);
    const reassign = allowReassignment
      ? pickAllowed(body, CASE_REASSIGN_ALLOWLIST)
      : {};

    const updated = await updateCaseRecord(
      body.id,
      { ...(validated.data as object), ...reassign } as any,
      { allowReassignment, allowedFields: CASE_UPDATE_ALLOWLIST }
    );
    if (!updated) {
      return NextResponse.json({ success: false, error: "Case not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, case: updated });
  } catch (error: any) {
    console.error("[API Office Cases PATCH]", error);
    return officeErrorResponse(error, "Failed to update case");
  }
}
