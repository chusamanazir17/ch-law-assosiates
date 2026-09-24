import { NextResponse, type NextRequest } from "next/server";
import { getUnifiedSession, canAccessOfficeSystem } from "@/lib/services/auth.service";
import { listCases, createCaseRecord, updateCaseRecord } from "@/lib/services/cases.service";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const session = await getUnifiedSession();
    if (!session || !canAccessOfficeSystem(session.role)) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const clientId = request.nextUrl.searchParams.get("client_id") || undefined;
    const status = request.nextUrl.searchParams.get("status") || undefined;
    const search = request.nextUrl.searchParams.get("search") || undefined;

    const cases = await listCases({ clientId, status, search });
    return NextResponse.json({ success: true, cases });
  } catch (error: any) {
    console.error("[API Office Cases GET]", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to load cases" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getUnifiedSession();
    if (!session || !canAccessOfficeSystem(session.role)) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const newCase = await createCaseRecord(body);
    return NextResponse.json({ success: true, case: newCase }, { status: 201 });
  } catch (error: any) {
    console.error("[API Office Cases POST]", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to create case" }, { status: 400 });
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
      return NextResponse.json({ success: false, error: "Case ID is required" }, { status: 400 });
    }

    const updated = await updateCaseRecord(body.id, body);
    return NextResponse.json({ success: true, case: updated });
  } catch (error: any) {
    console.error("[API Office Cases PATCH]", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to update case" }, { status: 400 });
  }
}
