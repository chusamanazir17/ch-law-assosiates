import { NextResponse, type NextRequest } from "next/server";
import {
  requireOfficeAccess,
  officeErrorResponse,
} from "@/lib/auth/officePermissions";
import { getDailyClosingRecord, saveDailyClosingRecord } from "@/lib/services/finance.service";
import { validateBody, dailyClosingSchema } from "@/lib/validation/office";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const auth = await requireOfficeAccess("daily-closing", "GET", request);
    if (!auth.ok) return auth.response;

    const date = request.nextUrl.searchParams.get("date") || undefined;
    const closing = await getDailyClosingRecord(date);
    return NextResponse.json({ success: true, closing });
  } catch (error: any) {
    console.error("[API Office Daily Closing GET]", error);
    return officeErrorResponse(error, "Failed to load daily closing", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireOfficeAccess("daily-closing", "POST", request);
    if (!auth.ok) return auth.response;

    const body = await request.json();

    // API-3: the ONLY client-supplied figure is the physically counted cash.
    // opening_cash / cash_in / cash_out / system_cash / difference and the
    // stamp/bank aggregates are computed server-side from the books.
    const validated = validateBody(dailyClosingSchema, {
      closing_date: body.closing_date || body.date,
      actual_cash: body.actual_cash ?? body.actualCash,
      notes: body.notes || body.discrepancyReason,
    });
    if (!validated.success) {
      return NextResponse.json({ success: false, error: validated.error }, { status: 400 });
    }

    const closingData = validated.data as {
      closing_date?: string;
      actual_cash: number;
      notes: string | null;
    };
    const closing = await saveDailyClosingRecord({
      closing_date: closingData.closing_date,
      actual_cash: closingData.actual_cash,
      notes: closingData.notes,
      closed_by: auth.session.user.id,
      // FIN-04: only super_admin may amend an already-closed day.
      allowReopen: auth.session.role === "super_admin",
    });

    return NextResponse.json({ success: true, closing }, { status: 201 });
  } catch (error: any) {
    console.error("[API Office Daily Closing POST]", error);
    return officeErrorResponse(error, "Failed to save daily closing");
  }
}
