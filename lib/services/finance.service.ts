import { getAdminDatabaseClient } from "@/lib/supabase/service";
import { callRpc } from "@/lib/services/rpc";
import { pkTodayIso, pkDayRangeUtc } from "@/lib/dates/pkDay";
import type { FinancialLedgerEntry, PaymentAccount, Expense, DailyClosing } from "@/types/office";

const isUuid = (val?: string | null): val is string =>
  typeof val === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);

/** Money guard shared by all financial writes (API-2). */
function assertPositiveAmount(amount: unknown, label = "Amount"): asserts amount is number {
  if (typeof amount !== "number" || !Number.isFinite(amount) || amount <= 0) {
    throw new Error(`${label} must be a finite number greater than 0.`);
  }
}

export interface RecordTransactionDTO {
  accountId: string;
  entryType: "debit" | "credit";
  amount: number;
  category: string;
  description: string;
  referenceType?: string | null;
  referenceId?: string | null;
  clientId?: string | null;
  createdBy?: string | null;
}

export interface RecordTransferDTO {
  fromAccountId: string;
  toAccountId: string;
  amount: number;
  description?: string;
  createdBy?: string | null;
}

export async function listPaymentAccounts(): Promise<PaymentAccount[]> {
  const supabase = await getAdminDatabaseClient();
  const { data, error } = await supabase
    .from("payment_accounts")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("[FinanceService] listPaymentAccounts error:", error);
    throw new Error(`Failed to load payment accounts: ${error.message}`);
  }

  return (data || []) as PaymentAccount[];
}


export async function createPaymentAccount(data: {
  name: string;
  account_type: "cash" | "bank" | "jazzcash" | "easypaisa" | "other";
  account_number?: string | null;
  bank_name?: string | null;
  opening_balance?: number;
}): Promise<PaymentAccount> {
  const supabase = await getAdminDatabaseClient();
  const { data: acc, error } = await supabase
    .from("payment_accounts")
    .insert({
      name: data.name.trim(),
      account_type: data.account_type,
      account_number: data.account_number || null,
      bank_name: data.bank_name || null,
      opening_balance: data.opening_balance || 0,
      current_balance: data.opening_balance || 0,
      active: true,
    })
    .select()
    .single();

  if (error) {
    console.error("[FinanceService] createPaymentAccount error:", error);
    throw new Error(`Failed to create account: ${error.message}`);
  }

  return acc as PaymentAccount;
}

export async function listLedgerTransactions(filter?: {
  accountId?: string;
  entryType?: string;
  category?: string;
  limit?: number;
}): Promise<FinancialLedgerEntry[]> {
  const supabase = await getAdminDatabaseClient();
  let query = supabase
    .from("financial_ledger")
    .select(`
      *,
      account:payment_accounts(name),
      client:clients(full_name)
    `)
    .order("created_at", { ascending: false });

  if (filter?.accountId && filter.accountId !== "ALL") {
    query = query.eq("account_id", filter.accountId);
  }

  if (filter?.entryType && filter.entryType !== "ALL") {
    query = query.eq("entry_type", filter.entryType as any);
  }

  if (filter?.category && filter.category !== "ALL") {
    query = query.eq("category", filter.category);
  }

  if (filter?.limit) {
    query = query.limit(filter.limit);
  }

  const { data, error } = await query;
  if (error) {
    console.error("[FinanceService] listLedgerTransactions error:", error);
    throw new Error(`Failed to load transactions: ${error.message}`);
  }

  return (data || []).map((row: any) => ({
    ...row,
    account_name: row.account?.name,
    client_name: row.client?.full_name,
  })) as FinancialLedgerEntry[];
}

export async function resolvePaymentAccount(
  supabase: any,
  accountIdentifier?: string | null
): Promise<{ id: string; current_balance: number; name: string }> {
  const isAccountUuid = isUuid(accountIdentifier);
  if (isAccountUuid) {
    const { data: byId } = await supabase
      .from("payment_accounts")
      .select("id, current_balance, name")
      .eq("id", accountIdentifier)
      .maybeSingle();
    if (byId) return byId;
  }

  const typeStr = (accountIdentifier || "cash").toLowerCase();
  let matchedType: "cash" | "bank" | "jazzcash" | "easypaisa" | "other" = "cash";
  if (typeStr.includes("bank") || typeStr.includes("hbl") || typeStr.includes("meezan")) matchedType = "bank";
  else if (typeStr.includes("jazz")) matchedType = "jazzcash";
  else if (typeStr.includes("easy") || typeStr.includes("paisa")) matchedType = "easypaisa";

  const { data: existing } = await supabase
    .from("payment_accounts")
    .select("id, current_balance, name")
    .eq("account_type", matchedType)
    .maybeSingle();

  if (existing) return existing;

  const { data: anyAcc } = await supabase
    .from("payment_accounts")
    .select("id, current_balance, name")
    .limit(1)
    .maybeSingle();

  if (anyAcc) return anyAcc;

  const defaultNames: Record<string, string> = {
    cash: "Office Cash Drawer",
    bank: "HBL Main Account",
    jazzcash: "JazzCash Merchant",
    easypaisa: "EasyPaisa Merchant",
    other: "General Office Account"
  };

  const { data: created, error } = await supabase
    .from("payment_accounts")
    .insert({
      name: defaultNames[matchedType] || "Office Cash Drawer",
      account_type: matchedType,
      current_balance: 0,
      opening_balance: 0,
      active: true,
    })
    .select("id, current_balance, name")
    .single();

  if (error || !created) {
    throw new Error(`Failed to resolve or initialize payment account: ${error?.message || "Unknown error"}`);
  }

  return created;
}

export async function recordLedgerTransaction(dto: RecordTransactionDTO): Promise<FinancialLedgerEntry> {
  const supabase = await getAdminDatabaseClient();

  assertPositiveAmount(dto.amount);
  if (dto.entryType !== "debit" && dto.entryType !== "credit") {
    throw new Error("Entry type must be 'debit' or 'credit'.");
  }
  if (!dto.category || !dto.category.trim()) throw new Error("Category is required.");
  if (!dto.description || !dto.description.trim()) throw new Error("Description is required.");

  const targetAccount = await resolvePaymentAccount(supabase, dto.accountId);
  const accountId = targetAccount.id;

  // Sanitize client_id: must be valid UUID and exist in database
  let validClientId: string | null = null;
  if (isUuid(dto.clientId)) {
    const { data: clientExists } = await supabase
      .from("clients")
      .select("id")
      .eq("id", dto.clientId)
      .is("deleted_at", null)
      .maybeSingle();
    if (clientExists) validClientId = clientExists.id;
  }

  // Sanitize created_by: must be valid UUID and exist in profiles
  let validCreatedBy: string | null = null;
  if (isUuid(dto.createdBy)) {
    const { data: profExists } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", dto.createdBy)
      .maybeSingle();
    if (profExists) validCreatedBy = profExists.id;
  }

  // Sanitize reference_id: must be valid UUID
  const validRefId = isUuid(dto.referenceId) ? dto.referenceId : null;

  // Atomic single entry: the RPC locks the account row (SELECT ... FOR UPDATE),
  // writes the ledger row with a sequence-backed transaction number, and bumps
  // the balance in one transaction (DB-16). Never compute the balance here.
  const entry = await callRpc<any>(supabase, "record_ledger_entry", {
    p_account_id: accountId,
    p_entry_type: dto.entryType,
    p_amount: dto.amount,
    p_category: dto.category.trim(),
    p_description: dto.description.trim(),
    p_reference_type: dto.referenceType || null,
    p_reference_id: validRefId,
    p_client_id: validClientId,
    p_created_by: validCreatedBy,
  });

  return {
    ...entry,
    account_name: targetAccount.name,
  } as FinancialLedgerEntry;
}

export async function recordTransfer(dto: RecordTransferDTO): Promise<{ debit: FinancialLedgerEntry; credit: FinancialLedgerEntry }> {
  const supabase = await getAdminDatabaseClient();

  assertPositiveAmount(dto.amount, "Transfer amount");
  if (!isUuid(dto.fromAccountId) || !isUuid(dto.toAccountId)) {
    throw new Error("Both source and destination accounts are required.");
  }

  // Atomic debit + credit via SECURITY DEFINER RPC (DB-03): a failure between
  // the two legs rolls back the whole transfer — no unbalanced journal.
  const result = await callRpc<{ debit: any; credit: any }>(supabase, "transfer_funds", {
    p_from_account: dto.fromAccountId,
    p_to_account: dto.toAccountId,
    p_amount: dto.amount,
    p_description: dto.description || null,
    p_created_by: isUuid(dto.createdBy) ? dto.createdBy : null,
  });

  return {
    debit: result.debit as FinancialLedgerEntry,
    credit: result.credit as FinancialLedgerEntry,
  };
}

export async function listExpenses(filter?: { accountId?: string; category?: string }): Promise<Expense[]> {
  const supabase = await getAdminDatabaseClient();
  let query = supabase
    .from("expenses")
    .select(`
      *,
      account:payment_accounts(name)
    `)
    .is("deleted_at", null)
    .order("expense_date", { ascending: false });

  if (filter?.accountId) {
    query = query.eq("account_id", filter.accountId);
  }

  if (filter?.category && filter.category !== "ALL") {
    query = query.eq("category", filter.category);
  }

  const { data, error } = await query;
  if (error) {
    console.error("[FinanceService] listExpenses error:", error);
    throw new Error(`Failed to load expenses: ${error.message}`);
  }

  return (data || []).map((row: any) => ({
    ...row,
    account_name: row.account?.name,
  })) as Expense[];
}

export async function recordExpense(data: {
  account_id?: string | null;
  category: string;
  payee: string;
  amount: number;
  expense_date?: string;
  description?: string | null;
  receipt_url?: string | null;
}): Promise<Expense> {
  const supabase = await getAdminDatabaseClient();

  assertPositiveAmount(data.amount, "Expense amount");
  if (!data.category || !data.category.trim()) throw new Error("Expense category is required.");
  if (!data.payee || !String(data.payee).trim()) throw new Error("Payee is required.");

  const targetAccount = await resolvePaymentAccount(supabase, data.account_id);
  const accountId = targetAccount.id;

  // Atomic expense + ledger row via SECURITY DEFINER RPC (DB-03). The account
  // balance is debited by the DB trigger `handle_expense_created` — the single
  // source of truth — and the RPC writes the companion ledger entry in the
  // same transaction instead of warn-and-continue.
  const exp = await callRpc<any>(supabase, "record_expense_atomic", {
    p_account_id: accountId,
    p_category: data.category.trim(),
    p_payee: String(data.payee).trim(),
    p_amount: data.amount,
    p_expense_date: data.expense_date || null,
    p_description: data.description || null,
    p_receipt_url: data.receipt_url || null,
  });

  return {
    ...exp,
    account_name: targetAccount.name,
  } as Expense;
}

export async function getDailyClosingRecord(date?: string): Promise<DailyClosing | null> {
  const supabase = await getAdminDatabaseClient();
  // closing_date is a PK-calendar date column: default to today in
  // Asia/Karachi, never the UTC date.
  const targetDate = date || pkTodayIso();

  const { data, error } = await supabase
    .from("daily_closings")
    .select("*")
    .eq("closing_date", targetDate)
    .maybeSingle();

  if (error) return null;
  return data as DailyClosing | null;
}

export interface DailyCashFigures {
  opening_cash: number;
  cash_in: number;
  cash_out: number;
  system_cash: number;
  bank_wallets_balance: number;
  stamps_sold_count: number;
  stamps_sold_value: number;
}

/**
 * Server-side cash reconciliation for a calendar date (API-3).
 * All control figures are derived from the ledger / stamp movements — the
 * client only supplies the physically counted cash (actual_cash).
 */
export async function computeDailyCashFigures(date: string): Promise<DailyCashFigures> {
  const supabase = await getAdminDatabaseClient();

  // created_at is timestamptz: filter the Asia/Karachi day as UTC instants.
  const { startUtcIso: dayStartUtc, endUtcIso: dayEndUtc } = pkDayRangeUtc(date);

  const { data: cashAccounts } = await supabase
    .from("payment_accounts")
    .select("id")
    .eq("account_type", "cash");
  const cashIds = (cashAccounts || []).map((a: any) => a.id);

  let cashIn = 0;
  let cashOut = 0;
  if (cashIds.length > 0) {
    const { data: credits } = await supabase
      .from("financial_ledger")
      .select("amount")
      .eq("entry_type", "credit")
      .in("account_id", cashIds)
      .gte("created_at", dayStartUtc)
      .lt("created_at", dayEndUtc);
    const { data: debits } = await supabase
      .from("financial_ledger")
      .select("amount")
      .eq("entry_type", "debit")
      .in("account_id", cashIds)
      .gte("created_at", dayStartUtc)
      .lt("created_at", dayEndUtc);
    cashIn = (credits || []).reduce((s: number, r: any) => s + Number(r.amount || 0), 0);
    cashOut = (debits || []).reduce((s: number, r: any) => s + Number(r.amount || 0), 0);
  }

  // Opening cash = yesterday's closed actual cash (the control chain).
  const prev = new Date(`${date}T00:00:00Z`);
  prev.setUTCDate(prev.getUTCDate() - 1);
  const prevDate = prev.toISOString().split("T")[0];
  const { data: prevClosing } = await supabase
    .from("daily_closings")
    .select("actual_cash")
    .eq("closing_date", prevDate)
    .eq("status", "closed")
    .maybeSingle();
  const openingCash = Number(prevClosing?.actual_cash || 0);

  const { data: bankAccounts } = await supabase
    .from("payment_accounts")
    .select("current_balance")
    .neq("account_type", "cash");
  const bankWallets = (bankAccounts || []).reduce(
    (s: number, r: any) => s + Number(r.current_balance || 0),
    0
  );

  const { data: stampSales } = await supabase
    .from("stamp_stock_movements")
    .select("quantity, unit_price")
    .eq("movement_type", "sale")
    .gte("created_at", dayStartUtc)
    .lt("created_at", dayEndUtc);
  const stampsSoldCount = (stampSales || []).reduce(
    (s: number, r: any) => s + Math.abs(Number(r.quantity || 0)),
    0
  );
  const stampsSoldValue = (stampSales || []).reduce(
    (s: number, r: any) => s + Math.abs(Number(r.quantity || 0)) * Number(r.unit_price || 0),
    0
  );

  const round2 = (n: number) => Math.round(n * 100) / 100;

  return {
    opening_cash: round2(openingCash),
    cash_in: round2(cashIn),
    cash_out: round2(cashOut),
    system_cash: round2(openingCash + cashIn - cashOut),
    bank_wallets_balance: round2(bankWallets),
    stamps_sold_count: stampsSoldCount,
    stamps_sold_value: round2(stampsSoldValue),
  };
}

export async function saveDailyClosingRecord(data: {
  closing_date?: string;
  /** Physically counted cash — the ONLY figure accepted from the client (API-3). */
  actual_cash: number;
  notes?: string | null;
  closed_by?: string | null;
  /** Only super_admin may amend an already-closed day (FIN-04). */
  allowReopen?: boolean;
}): Promise<DailyClosing> {
  const supabase = await getAdminDatabaseClient();
  const targetDate = data.closing_date || pkTodayIso();

  if (typeof data.actual_cash !== "number" || !Number.isFinite(data.actual_cash) || data.actual_cash < 0) {
    throw new Error("Actual cash must be a finite number >= 0.");
  }

  const existing = await getDailyClosingRecord(targetDate);
  if (existing && existing.status === "closed" && !data.allowReopen) {
    const err = new Error(
      `Daily closing for ${targetDate} is already closed and cannot be overwritten.`
    );
    (err as any).statusCode = 409;
    throw err;
  }

  // All control figures are computed server-side from the books; the client
  // cannot self-certify its own numbers (API-3).
  const figures = await computeDailyCashFigures(targetDate);
  const difference = Math.round((data.actual_cash - figures.system_cash) * 100) / 100;

  const payload: any = {
    closing_date: targetDate,
    opening_cash: figures.opening_cash,
    cash_in: figures.cash_in,
    cash_out: figures.cash_out,
    system_cash: figures.system_cash,
    actual_cash: data.actual_cash,
    difference,
    bank_wallets_balance: figures.bank_wallets_balance,
    stamps_sold_count: figures.stamps_sold_count,
    stamps_sold_value: figures.stamps_sold_value,
    status: "closed",
    notes: data.notes || null,
    closed_by: isUuid(data.closed_by) ? data.closed_by : null,
    closed_at: new Date().toISOString(),
  };

  const { data: closing, error } = await supabase
    .from("daily_closings")
    .upsert(payload, { onConflict: "closing_date" })
    .select()
    .single();

  if (error) {
    console.error("[FinanceService] saveDailyClosingRecord error:", error);
    throw new Error(`Failed to save daily closing: ${error.message}`);
  }

  return closing as DailyClosing;
}

