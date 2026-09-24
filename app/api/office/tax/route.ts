import { NextResponse, type NextRequest } from "next/server";
import { getUnifiedSession, canAccessOfficeSystem } from "@/lib/services/auth.service";
import {
  listTaxCases,
  createTaxCaseRecord,
  updateTaxCaseRecord,
  deleteTaxCaseRecord,
} from "@/lib/services/tax.service";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const session = await getUnifiedSession();
    if (!session || !canAccessOfficeSystem(session.role)) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const status = request.nextUrl.searchParams.get("status") || undefined;
    const taxYear = request.nextUrl.searchParams.get("tax_year") || undefined;
    const clientId = request.nextUrl.searchParams.get("client_id") || undefined;
    const search = request.nextUrl.searchParams.get("search") || undefined;

    const cases = await listTaxCases({ status, taxYear, clientId, search });
    return NextResponse.json({ success: true, cases });
  } catch (error: any) {
    console.error("[API Office Tax GET]", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to load tax cases" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getUnifiedSession();
    if (!session || !canAccessOfficeSystem(session.role)) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const newCase = await createTaxCaseRecord({
      client_id: body.client_id || body.clientId,
      tax_year: body.tax_year || body.taxYear || "2024",
      return_type: body.return_type || body.returnType,
      fee: body.fee !== undefined ? Number(body.fee) : Number(body.amountFee || 0),
      assigned_to: body.assigned_to || body.assignedTo || null,
      due_date: body.due_date || body.dueDate || null,
      filing_date: body.filing_date || body.filedDate || null,
      cpr_number: body.cpr_number || body.cprNumber || null,
      status: body.status || "In Progress",
      documents: body.documents || body.requiredDocuments,
      notes: body.notes || null,
    });

    return NextResponse.json({ success: true, case: newCase }, { status: 201 });
  } catch (error: any) {
    console.error("[API Office Tax POST]", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to create tax case" }, { status: 400 });
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

    const updated = await updateTaxCaseRecord(body.id, {
      status: body.status,
      cpr_number: body.cpr_number || body.cprNumber,
      filing_date: body.filing_date || body.filedDate,
      fee: body.fee !== undefined ? Number(body.fee) : undefined,
      notes: body.notes,
      documents: body.documents || body.requiredDocuments,
    });

    return NextResponse.json({ success: true, case: updated });
  } catch (error: any) {
    console.error("[API Office Tax PATCH]", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to update tax case" }, { status: 400 });
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
      return NextResponse.json({ success: false, error: "Case ID is required" }, { status: 400 });
    }

    await deleteTaxCaseRecord(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[API Office Tax DELETE]", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to delete tax case" }, { status: 400 });
  }
}
