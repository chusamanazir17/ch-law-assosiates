import { NextResponse, type NextRequest } from "next/server";
import {
  requireOfficeAccess,
  officeErrorResponse,
} from "@/lib/auth/officePermissions";
import {
  listReceipts,
  createReceiptRecord,
  updateReceiptStatus,
} from "@/lib/services/receipts.service";
import {
  validateBody,
  receiptCreateSchema,
  receiptStatusSchema,
} from "@/lib/validation/office";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const auth = await requireOfficeAccess("receipts", "GET", request);
    if (!auth.ok) return auth.response;

    const status = request.nextUrl.searchParams.get("status") || undefined;
    const clientId = request.nextUrl.searchParams.get("client_id") || undefined;
    const search = request.nextUrl.searchParams.get("search") || undefined;

    const receipts = await listReceipts({ status, clientId, search });
    return NextResponse.json({ success: true, receipts });
  } catch (error: any) {
    console.error("[API Office Receipts GET]", error);
    return officeErrorResponse(error, "Failed to load receipts", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireOfficeAccess("receipts", "POST", request);
    if (!auth.ok) return auth.response;

    const body = await request.json();
    const validated = validateBody(receiptCreateSchema, {
      client_id: body.client_id || body.clientId,
      client_name: body.client_name || body.clientName || "Walk-in Client",
      service_type: body.service_type || body.service,
      amount_paid: body.amount_paid ?? body.paidAmount ?? body.amount,
      balance_due: body.balance_due ?? body.balance,
      payment_method: body.payment_method || body.paymentMethod,
      status: body.status?.toLowerCase?.() || body.status,
      notes: body.notes || body.remarks,
    });
    if (!validated.success) {
      return NextResponse.json({ success: false, error: validated.error }, { status: 400 });
    }

    const newReceipt = await createReceiptRecord({
      ...(validated.data as object),
      issued_by: auth.session.user.id,
    } as any);

    return NextResponse.json({ success: true, receipt: newReceipt }, { status: 201 });
  } catch (error: any) {
    console.error("[API Office Receipts POST]", error);
    return officeErrorResponse(error, "Failed to create receipt");
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const auth = await requireOfficeAccess("receipts", "PATCH", request);
    if (!auth.ok) return auth.response;

    const body = await request.json();
    if (!body.id) {
      return NextResponse.json({ success: false, error: "Receipt ID is required" }, { status: 400 });
    }

    const validated = validateBody(receiptStatusSchema, {
      status: body.status?.toLowerCase?.() || body.status || "cancelled",
      notes: body.notes || body.cancellationReason || body.remarks,
    });
    if (!validated.success) {
      return NextResponse.json({ success: false, error: validated.error }, { status: 400 });
    }

    const receiptData = validated.data as { status: "paid" | "partial" | "unpaid" | "cancelled"; notes: string | null };
    const receipt = await updateReceiptStatus(body.id, receiptData.status, receiptData.notes || undefined);
    if (!receipt) {
      return NextResponse.json({ success: false, error: "Receipt not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, receipt });
  } catch (error: any) {
    console.error("[API Office Receipts PATCH]", error);
    return officeErrorResponse(error, "Failed to update receipt");
  }
}
