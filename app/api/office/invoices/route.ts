import { NextResponse, type NextRequest } from "next/server";
import { getAdminSession } from "@/lib/auth/admin";
import { listInvoices, createInvoiceRecord, recordInvoicePayment } from "@/lib/services/billing.service";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const clientId = request.nextUrl.searchParams.get("client_id") || undefined;
    const status = request.nextUrl.searchParams.get("status") || undefined;

    const invoices = await listInvoices({ clientId, status });
    return NextResponse.json({ success: true, invoices });
  } catch (error: any) {
    console.error("[API Office Invoices GET]", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to load invoices" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Check if this is a payment recording
    if (body.action === "record_payment") {
      const payment = await recordInvoicePayment({
        invoice_id: body.invoice_id,
        amount: body.amount,
        payment_method: body.payment_method,
        payment_account_id: body.payment_account_id,
        reference_number: body.reference_number,
        notes: body.notes,
      });
      return NextResponse.json({ success: true, payment });
    }

    const invoice = await createInvoiceRecord(body);
    return NextResponse.json({ success: true, invoice }, { status: 201 });
  } catch (error: any) {
    console.error("[API Office Invoices POST]", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to process invoice request" }, { status: 400 });
  }
}
