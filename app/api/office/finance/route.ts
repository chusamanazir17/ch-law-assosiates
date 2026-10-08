import { NextResponse, type NextRequest } from "next/server";
import {
  requireOfficeAccess,
  officeErrorResponse,
} from "@/lib/auth/officePermissions";
import {
  listPaymentAccounts,
  createPaymentAccount,
  listLedgerTransactions,
  recordLedgerTransaction,
  recordTransfer,
  listExpenses,
  recordExpense,
} from "@/lib/services/finance.service";
import {
  validateBody,
  clampLimitParam,
  paymentAccountCreateSchema,
  transferCreateSchema,
  expenseCreateSchema,
  ledgerEntrySchema,
} from "@/lib/validation/office";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const auth = await requireOfficeAccess("finance", "GET", request);
    if (!auth.ok) return auth.response;

    const type = request.nextUrl.searchParams.get("type"); // 'accounts' | 'expenses' | 'transactions' | null
    const accountId = request.nextUrl.searchParams.get("account_id") || undefined;
    const entryType = request.nextUrl.searchParams.get("entry_type") || undefined;
    const category = request.nextUrl.searchParams.get("category") || undefined;
    // API-5: clamp the attacker-controlled limit.
    const limit = clampLimitParam(request.nextUrl.searchParams.get("limit"), 100, 500);

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
      listLedgerTransactions({ accountId, entryType, category, limit }),
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
    return officeErrorResponse(error, "Failed to load finance data", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireOfficeAccess("finance", "POST", request);
    if (!auth.ok) return auth.response;

    const body = await request.json();
    const action = body.action;

    if (action === "create_account") {
      const validated = validateBody(paymentAccountCreateSchema, {
        name: body.name,
        account_type: body.account_type || body.accountType,
        account_number: body.account_number || body.accountNumber,
        bank_name: body.bank_name || body.bankName,
        opening_balance: body.opening_balance ?? body.openingBalance,
      });
      if (!validated.success) {
        return NextResponse.json({ success: false, error: validated.error }, { status: 400 });
      }
      const account = await createPaymentAccount(validated.data as any);
      return NextResponse.json({ success: true, account }, { status: 201 });
    }

    if (action === "record_transfer") {
      const validated = validateBody(transferCreateSchema, {
        from_account_id: body.from_account_id || body.fromAccountId,
        to_account_id: body.to_account_id || body.toAccountId,
        amount: body.amount,
        description: body.description,
      });
      if (!validated.success) {
        return NextResponse.json({ success: false, error: validated.error }, { status: 400 });
      }
      const transferData = validated.data as {
        from_account_id: string;
        to_account_id: string;
        amount: number;
        description: string | null;
      };
      const result = await recordTransfer({
        fromAccountId: transferData.from_account_id,
        toAccountId: transferData.to_account_id,
        amount: transferData.amount,
        description: transferData.description || undefined,
        createdBy: auth.session.user.id,
      });
      return NextResponse.json({ success: true, ...result }, { status: 201 });
    }

    if (action === "record_expense") {
      const validated = validateBody(expenseCreateSchema, {
        account_id: body.account_id || body.accountId,
        category: body.category,
        payee: body.payee || body.vendorPayee,
        amount: body.amount,
        expense_date: body.expense_date || body.date,
        description: body.description,
        receipt_url: body.receipt_url || body.receiptUrl,
      });
      if (!validated.success) {
        return NextResponse.json({ success: false, error: validated.error }, { status: 400 });
      }
      const expense = await recordExpense(validated.data as any);
      return NextResponse.json({ success: true, expense }, { status: 201 });
    }

    // Default: record ledger transaction (cash in or cash out)
    const validated = validateBody(ledgerEntrySchema, {
      account_id: body.account_id || body.accountId,
      entry_type: body.entry_type || (body.type === "IN" ? "credit" : "debit"),
      amount: body.amount,
      category: body.category || body.serviceOrCategory || "General",
      description: body.description,
      reference_type: body.reference_type,
      reference_id: body.reference_id,
      client_id: body.client_id,
    });
    if (!validated.success) {
      return NextResponse.json({ success: false, error: validated.error }, { status: 400 });
    }
    const transaction = await recordLedgerTransaction({
      ...(validated.data as any),
      accountId: (validated.data as any).account_id,
      entryType: (validated.data as any).entry_type,
      referenceType: (validated.data as any).reference_type,
      referenceId: (validated.data as any).reference_id,
      clientId: (validated.data as any).client_id,
      createdBy: auth.session.user.id,
    });
    return NextResponse.json({ success: true, transaction }, { status: 201 });
  } catch (error: any) {
    console.error("[API Office Finance POST]", error);
    return officeErrorResponse(error, "Failed to process finance transaction");
  }
}
