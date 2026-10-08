import { NextResponse, type NextRequest } from "next/server";
import {
  requireOfficeAccess,
  officeErrorResponse,
} from "@/lib/auth/officePermissions";
import {
  listTaxCases,
  createTaxCaseRecord,
  updateTaxCaseRecord,
  deleteTaxCaseRecord,
} from "@/lib/services/tax.service";
import {
  validateBody,
  pickAllowed,
  taxCaseCreateSchema,
  taxCaseUpdateSchema,
  TAX_CASE_UPDATE_ALLOWLIST,
} from "@/lib/validation/office";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const auth = await requireOfficeAccess("tax", "GET", request);
    if (!auth.ok) return auth.response;

    const status = request.nextUrl.searchParams.get("status") || undefined;
    const taxYear = request.nextUrl.searchParams.get("tax_year") || undefined;
    const clientId = request.nextUrl.searchParams.get("client_id") || undefined;
    const search = request.nextUrl.searchParams.get("search") || undefined;

    const cases = await listTaxCases({ status, taxYear, clientId, search });
    return NextResponse.json({ success: true, cases });
  } catch (error: any) {
    console.error("[API Office Tax GET]", error);
    return officeErrorResponse(error, "Failed to load tax cases", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireOfficeAccess("tax", "POST", request);
    if (!auth.ok) return auth.response;

    const body = await request.json();
    const validated = validateBody(taxCaseCreateSchema, {
      client_id: body.client_id || body.clientId,
      tax_year: body.tax_year || body.taxYear,
      return_type: body.return_type || body.returnType,
      fee: body.fee ?? body.amountFee,
      assigned_to: body.assigned_to || body.assignedTo,
      due_date: body.due_date || body.dueDate,
      filing_date: body.filing_date || body.filedDate,
      cpr_number: body.cpr_number || body.cprNumber,
      status: body.status,
      notes: body.notes,
    });
    if (!validated.success) {
      return NextResponse.json({ success: false, error: validated.error }, { status: 400 });
    }

    const newCase = await createTaxCaseRecord({
      ...(validated.data as object),
      documents: body.documents || body.requiredDocuments,
    } as any);
    return NextResponse.json({ success: true, case: newCase }, { status: 201 });
  } catch (error: any) {
    console.error("[API Office Tax POST]", error);
    return officeErrorResponse(error, "Failed to create tax case");
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const auth = await requireOfficeAccess("tax", "PATCH", request);
    if (!auth.ok) return auth.response;

    const body = await request.json();
    if (!body.id) {
      return NextResponse.json({ success: false, error: "Case ID is required" }, { status: 400 });
    }

    // Mass-assignment guard: only allowlisted fields; documents pass through
    // as an opaque JSONB payload.
    const fields = pickAllowed(body, TAX_CASE_UPDATE_ALLOWLIST);
    if (body.requiredDocuments !== undefined && fields.documents === undefined) {
      fields.documents = body.requiredDocuments;
    }
    const validated = validateBody(taxCaseUpdateSchema, fields);
    if (!validated.success) {
      return NextResponse.json({ success: false, error: validated.error }, { status: 400 });
    }

    const updated = await updateTaxCaseRecord(body.id, validated.data as any, {
      allowedFields: TAX_CASE_UPDATE_ALLOWLIST,
    });
    if (!updated) {
      return NextResponse.json({ success: false, error: "Tax case not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, case: updated });
  } catch (error: any) {
    console.error("[API Office Tax PATCH]", error);
    return officeErrorResponse(error, "Failed to update tax case");
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const auth = await requireOfficeAccess("tax", "DELETE", request);
    if (!auth.ok) return auth.response;

    const id = request.nextUrl.searchParams.get("id");
    if (!id) {
      return NextResponse.json({ success: false, error: "Case ID is required" }, { status: 400 });
    }

    await deleteTaxCaseRecord(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[API Office Tax DELETE]", error);
    return officeErrorResponse(error, "Failed to delete tax case");
  }
}
