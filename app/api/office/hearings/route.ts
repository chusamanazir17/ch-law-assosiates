import { NextResponse, type NextRequest } from "next/server";
import { getUnifiedSession, canAccessOfficeSystem } from "@/lib/services/auth.service";
import { listHearings, createHearingRecord, updateHearingRecord, deleteHearingRecord } from "@/lib/services/hearings.service";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const session = await getUnifiedSession();
    if (!session || !canAccessOfficeSystem(session.role)) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const caseId = request.nextUrl.searchParams.get("case_id") || undefined;
    const date = request.nextUrl.searchParams.get("date") || undefined;
    const upcomingOnly = request.nextUrl.searchParams.get("upcoming") === "true";

    const hearings = await listHearings({ caseId, date, upcomingOnly });
    return NextResponse.json({ success: true, hearings });
  } catch (error: any) {
    console.error("[API Office Hearings GET]", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to load hearings" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getUnifiedSession();
    if (!session || !canAccessOfficeSystem(session.role)) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const hearing = await createHearingRecord(body);
    return NextResponse.json({ success: true, hearing }, { status: 201 });
  } catch (error: any) {
    console.error("[API Office Hearings POST]", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to create hearing" }, { status: 400 });
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
      return NextResponse.json({ success: false, error: "Hearing ID is required" }, { status: 400 });
    }

    const hearing = await updateHearingRecord(body.id, body);
    return NextResponse.json({ success: true, hearing });
  } catch (error: any) {
    console.error("[API Office Hearings PATCH]", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to update hearing" }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getUnifiedSession();
    if (!session || !canAccessOfficeSystem(session.role)) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const id = request.nextUrl.searchParams.get("id");
    if (!id) {
      return NextResponse.json({ success: false, error: "Hearing ID is required" }, { status: 400 });
    }

    await deleteHearingRecord(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[API Office Hearings DELETE]", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to delete hearing" }, { status: 400 });
  }
}
