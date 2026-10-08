import { NextResponse, type NextRequest } from "next/server";
import {
  requireOfficeAccess,
  officeErrorResponse,
} from "@/lib/auth/officePermissions";
import { listHearings, createHearingRecord, updateHearingRecord, deleteHearingRecord } from "@/lib/services/hearings.service";
import {
  validateBody,
  pickAllowed,
  hearingCreateSchema,
  hearingUpdateSchema,
  HEARING_UPDATE_ALLOWLIST,
} from "@/lib/validation/office";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const auth = await requireOfficeAccess("hearings", "GET", request);
    if (!auth.ok) return auth.response;

    const caseId = request.nextUrl.searchParams.get("case_id") || undefined;
    const date = request.nextUrl.searchParams.get("date") || undefined;
    const upcomingOnly = request.nextUrl.searchParams.get("upcoming") === "true";

    const hearings = await listHearings({ caseId, date, upcomingOnly });
    return NextResponse.json({ success: true, hearings });
  } catch (error: any) {
    console.error("[API Office Hearings GET]", error);
    return officeErrorResponse(error, "Failed to load hearings", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireOfficeAccess("hearings", "POST", request);
    if (!auth.ok) return auth.response;

    const body = await request.json();
    const validated = validateBody(hearingCreateSchema, {
      case_id: body.case_id || body.caseId,
      hearing_date: body.hearing_date || body.hearingDate || body.date,
      court_room: body.court_room || body.courtRoom,
      judge_name: body.judge_name || body.judgeName,
      purpose: body.purpose,
      proceedings_summary: body.proceedings_summary || body.proceedingsSummary,
      next_hearing_date: body.next_hearing_date || body.nextHearingDate,
      next_purpose: body.next_purpose || body.nextPurpose,
      status: body.status,
    });
    if (!validated.success) {
      return NextResponse.json({ success: false, error: validated.error }, { status: 400 });
    }

    const hearing = await createHearingRecord(validated.data as any);
    return NextResponse.json({ success: true, hearing }, { status: 201 });
  } catch (error: any) {
    console.error("[API Office Hearings POST]", error);
    return officeErrorResponse(error, "Failed to create hearing");
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const auth = await requireOfficeAccess("hearings", "PATCH", request);
    if (!auth.ok) return auth.response;

    const body = await request.json();
    if (!body.id) {
      return NextResponse.json({ success: false, error: "Hearing ID is required" }, { status: 400 });
    }

    // API-1: mass-assignment guard — case_id moves are not allowed here.
    const fields = pickAllowed(body, HEARING_UPDATE_ALLOWLIST);
    const validated = validateBody(hearingUpdateSchema, fields);
    if (!validated.success) {
      return NextResponse.json({ success: false, error: validated.error }, { status: 400 });
    }

    const hearing = await updateHearingRecord(body.id, validated.data as any, {
      allowedFields: HEARING_UPDATE_ALLOWLIST,
    });
    if (!hearing) {
      return NextResponse.json({ success: false, error: "Hearing not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, hearing });
  } catch (error: any) {
    console.error("[API Office Hearings PATCH]", error);
    return officeErrorResponse(error, "Failed to update hearing");
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const auth = await requireOfficeAccess("hearings", "DELETE", request);
    if (!auth.ok) return auth.response;

    const id = request.nextUrl.searchParams.get("id");
    if (!id) {
      return NextResponse.json({ success: false, error: "Hearing ID is required" }, { status: 400 });
    }

    await deleteHearingRecord(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[API Office Hearings DELETE]", error);
    return officeErrorResponse(error, "Failed to delete hearing");
  }
}
