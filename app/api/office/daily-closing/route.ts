import { NextResponse, type NextRequest } from "next/server";
import { getUnifiedSession, canAccessOfficeSystem } from "@/lib/services/auth.service";
import { getDailyClosingRecord, saveDailyClosingRecord } from "@/lib/services/finance.service";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const session = await getUnifiedSession();
    if (!session || !canAccessOfficeSystem(session.role)) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const date = request.nextUrl.searchParams.get("date") || undefined;
    const closing = await getDailyClosingRecord(date);
    return NextResponse.json({ success: true, closing });
  } catch (error: any) {
    console.error("[API Office Daily Closing GET]", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to load daily closing" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getUnifiedSession();
    if (!session || !canAccessOfficeSystem(session.role)) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const closing = await saveDailyClosingRecord({
      closing_date: body.closing_date || body.date,
      opening_cash: Number(body.opening_cash !== undefined ? body.opening_cash : body.openingBalance || 0),
      cash_in: Number(body.cash_in !== undefined ? body.cash_in : body.cashIn || 0),
      cash_out: Number(body.cash_out !== undefined ? body.cash_out : body.cashOut || 0),
      system_cash: Number(body.system_cash !== undefined ? body.system_cash : body.expectedCash || 0),
      actual_cash: Number(body.actual_cash !== undefined ? body.actual_cash : body.actualCash || 0),
      difference: Number(body.difference !== undefined ? body.difference : 0),
      bank_wallets_balance: Number(body.bank_wallets_balance || 0),
      stamps_sold_count: Number(body.stamps_sold_count || 0),
      stamps_sold_value: Number(body.stamps_sold_value || 0),
      status: body.status || "closed",
      notes: body.notes || body.discrepancyReason || null,
      closed_by: session.user.id,
    });

    return NextResponse.json({ success: true, closing }, { status: 201 });
  } catch (error: any) {
    console.error("[API Office Daily Closing POST]", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to save daily closing" }, { status: 400 });
  }
}
