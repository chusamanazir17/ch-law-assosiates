import { NextResponse, type NextRequest } from "next/server";
import { getUnifiedSession, canAccessOfficeSystem } from "@/lib/services/auth.service";
import {
  listReceipts,
  createReceiptRecord,
  updateReceiptStatus,
} from "@/lib/services/receipts.service";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const session = await getUnifiedSession();
    if (!session || !canAccessOfficeSystem(session.role)) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const status = request.nextUrl.searchParams.get("status") || undefined;
    const clientId = request.nextUrl.searchParams.get("client_id") || undefined;
    const search = request.nextUrl.searchParams.get("search") || undefined;

    const receipts = await listReceipts({ status, clientId, search });
    return NextResponse.json({ success: true, receipts });
  } catch (error: any) {
    console.error("[API Office Receipts GET]", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to load receipts" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getUnifiedSession();
    if (!session || !canAccessOfficeSystem(session.role)) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const newReceipt = await createReceiptRecord({
      receipt_number: body.receipt_number || body.receiptNo,
      client_id: body.client_id || body.clientId || null,
      client_name: body.client_name || body.clientName || "Walk-in Client",
      service_type: body.service_type || body.service || "Legal Documentation",
      amount_paid: Number(body.amount_paid !== undefined ? body.amount_paid : body.paidAmount || body.amount || 0),
      balance_due: Number(body.balance_due !== undefined ? body.balance_due : body.balance || 0),
      payment_method: body.payment_method || body.paymentMethod || "cash",
      status: (body.status?.toLowerCase() as any) || "paid",
      notes: body.notes || body.remarks || null,
      issued_by: session.user.id,
    });

    return NextResponse.json({ success: true, receipt: newReceipt }, { status: 201 });
  } catch (error: any) {
    console.error("[API Office Receipts POST]", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to create receipt" }, { status: 400 });
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
      return NextResponse.json({ success: false, error: "Receipt ID is required" }, { status: 400 });
    }

    const status = (body.status?.toLowerCase() as any) || "cancelled";
    const notes = body.notes || body.cancellationReason || body.remarks;

    const receipt = await updateReceiptStatus(body.id, status, notes);
    return NextResponse.json({ success: true, receipt });
  } catch (error: any) {
    console.error("[API Office Receipts PATCH]", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to update receipt" }, { status: 400 });
  }
}
