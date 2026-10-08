import { NextResponse, type NextRequest } from "next/server";
import {
  requireOfficeAccess,
  officeErrorResponse,
} from "@/lib/auth/officePermissions";
import { listInvoices, createInvoiceRecord, recordInvoicePayment } from "@/lib/services/billing.service";
import {
  validateBody,
  invoiceCreateSchema,
  paymentCreateSchema,
} from "@/lib/validation/office";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const auth = await requireOfficeAccess("invoices", "GET", request);
    if (!auth.ok) return auth.response;

    const clientId = request.nextUrl.searchParams.get("client_id") || undefined;
    const status = request.nextUrl.searchParams.get("status") || undefined;

    const invoices = await listInvoices({ clientId, status });
    return NextResponse.json({ success: true, invoices });
  } catch (error: any) {
    console.error("[API Office Invoices GET]", error);
    return officeErrorResponse(error, "Failed to load invoices", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireOfficeAccess("invoices", "POST", request);
    if (!auth.ok) return auth.response;

    const body = await request.json();

    // Record a payment against an invoice (overpayment-capped server-side).
    if (body.action === "record_payment") {
      const validated = validateBody(paymentCreateSchema, {
        invoice_id: body.invoice_id || body.invoiceId,
        client_id: body.client_id || body.clientId,
        amount: body.amount,
        payment_method: body.payment_method || body.paymentMethod,
        payment_account_id: body.payment_account_id || body.paymentAccountId,
        reference_number: body.reference_number || body.referenceNumber,
        notes: body.notes,
      });
      if (!validated.success) {
        return NextResponse.json({ success: false, error: validated.error }, { status: 400 });
      }

      const payment = await recordInvoicePayment(validated.data as any);
      return NextResponse.json({ success: true, payment });
    }

    const validated = validateBody(invoiceCreateSchema, {
      client_id: body.client_id || body.clientId,
      case_id: body.case_id || body.caseId,
      due_date: body.due_date || body.dueDate,
      tax_amount: body.tax_amount ?? body.taxAmount,
      discount_amount: body.discount_amount ?? body.discountAmount,
      notes: body.notes,
      items: body.items,
    });
    if (!validated.success) {
      return NextResponse.json({ success: false, error: validated.error }, { status: 400 });
    }

    const invoice = await createInvoiceRecord(validated.data as any);
    return NextResponse.json({ success: true, invoice }, { status: 201 });
  } catch (error: any) {
    console.error("[API Office Invoices POST]", error);
    return officeErrorResponse(error, "Failed to process invoice request");
  }
}
