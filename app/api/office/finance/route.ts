import { NextResponse, type NextRequest } from "next/server";
import { getUnifiedSession, canAccessOfficeSystem } from "@/lib/services/auth.service";
import {
  listPaymentAccounts,
  createPaymentAccount,
  listLedgerTransactions,
  recordLedgerTransaction,
  recordTransfer,
  listExpenses,
  recordExpense,
} from "@/lib/services/finance.service";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const session = await getUnifiedSession();
    if (!session || !canAccessOfficeSystem(session.role)) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const type = request.nextUrl.searchParams.get("type"); // 'accounts' | 'expenses' | 'transactions' | null
    const accountId = request.nextUrl.searchParams.get("account_id") || undefined;
    const entryType = request.nextUrl.searchParams.get("entry_type") || undefined;
    const category = request.nextUrl.searchParams.get("category") || undefined;
    const limit = request.nextUrl.searchParams.get("limit")
      ? parseInt(request.nextUrl.searchParams.get("limit")!, 10)
      : undefined;

    if (type === "accounts") {
      const accounts = await listPaymentAccounts();
      return NextResponse.json({ success: true, accounts });
    }

    if (type === "expenses") {
      const expenses = await listExpenses({ accountId, category });
      return NextResponse.json({ success: true, expenses });
    }

    // Default: fetch accounts, transactions, and expenses together for office cash management
    const [accounts, transactions, expenses] = await Promise.all([
      listPaymentAccounts(),
      listLedgerTransactions({ accountId, entryType, category, limit: limit || 100 }),
      listExpenses({ accountId, category }),
    ]);

    return NextResponse.json({
      success: true,
      accounts,
      transactions,
      expenses,
    });
  } catch (error: any) {
    console.error("[API Office Finance GET]", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to load finance data" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getUnifiedSession();
    if (!session || !canAccessOfficeSystem(session.role)) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const action = body.action;

    if (action === "create_account") {
      const account = await createPaymentAccount(body);
      return NextResponse.json({ success: true, account }, { status: 201 });
    }

    if (action === "record_transfer") {
      const result = await recordTransfer({
        fromAccountId: body.from_account_id || body.fromAccountId,
        toAccountId: body.to_account_id || body.toAccountId,
        amount: Number(body.amount),
        description: body.description,
        createdBy: session.user.id,
      });
      return NextResponse.json({ success: true, ...result }, { status: 201 });
    }

    if (action === "record_expense") {
      const expense = await recordExpense({
        account_id: body.account_id || body.accountId,
        category: body.category,
        payee: body.payee || body.vendorPayee,
        amount: Number(body.amount),
        expense_date: body.expense_date || body.date,
        description: body.description,
        receipt_url: body.receipt_url || body.receiptUrl,
      });
      return NextResponse.json({ success: true, expense }, { status: 201 });
    }

    // Default: record ledger transaction (cash in or cash out)
    const transaction = await recordLedgerTransaction({
      accountId: body.account_id || body.accountId,
      entryType: body.entry_type || (body.type === "IN" ? "credit" : "debit"),
      amount: Number(body.amount),
      category: body.category || body.serviceOrCategory || "General",
      description: body.description,
      referenceType: body.reference_type,
      referenceId: body.reference_id,
      clientId: body.client_id,
      createdBy: session.user.id,
    });

    return NextResponse.json({ success: true, transaction }, { status: 201 });
  } catch (error: any) {
    console.error("[API Office Finance POST]", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to process finance transaction" }, { status: 400 });
  }
}
