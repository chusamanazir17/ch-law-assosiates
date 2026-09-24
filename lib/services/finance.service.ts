import { getAdminDatabaseClient } from "@/lib/supabase/service";
import type { FinancialLedgerEntry, PaymentAccount, Expense, DailyClosing } from "@/types/office";

const isUuid = (val?: string | null): val is string =>
  typeof val === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);

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
  const txNo = `TXN-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

  const targetAccount = await resolvePaymentAccount(supabase, dto.accountId);
  const accountId = targetAccount.id;

  const newBalance = dto.entryType === "credit"
    ? targetAccount.current_balance + dto.amount
    : targetAccount.current_balance - dto.amount;

  // Sanitize client_id: must be valid UUID and exist in database
  let validClientId: string | null = null;
  if (isUuid(dto.clientId)) {
    const { data: clientExists } = await supabase
      .from("clients")
      .select("id")
      .eq("id", dto.clientId)
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

  const { data: entry, error: ledErr } = await supabase
    .from("financial_ledger")
    .insert({
      transaction_number: txNo,
      account_id: accountId,
      entry_type: dto.entryType,
      amount: dto.amount,
      balance_after: newBalance,
      category: dto.category.trim(),
      description: dto.description.trim(),
      reference_type: dto.referenceType || null,
      reference_id: validRefId,
      client_id: validClientId,
      created_by: validCreatedBy,
    })
    .select(`
      *,
      account:payment_accounts(name),
      client:clients(full_name)
    `)
    .single();

  if (ledErr) {
    console.error("[FinanceService] recordLedgerTransaction error:", ledErr);
    throw new Error(`Failed to record transaction: ${ledErr.message}`);
  }

  await supabase
    .from("payment_accounts")
    .update({
      current_balance: newBalance,
      updated_at: new Date().toISOString(),
    })
    .eq("id", accountId);

  return {
    ...entry,
    account_name: (entry as any).account?.name,
    client_name: (entry as any).client?.full_name,
  } as FinancialLedgerEntry;
}

export async function recordTransfer(dto: RecordTransferDTO): Promise<{ debit: FinancialLedgerEntry; credit: FinancialLedgerEntry }> {
  const debit = await recordLedgerTransaction({
    accountId: dto.fromAccountId,
    entryType: "debit",
    amount: dto.amount,
    category: "Transfer",
    description: dto.description || `Transfer to account`,
    createdBy: dto.createdBy,
  });

  const credit = await recordLedgerTransaction({
    accountId: dto.toAccountId,
    entryType: "credit",
    amount: dto.amount,
    category: "Transfer",
    description: dto.description || `Transfer from account`,
    createdBy: dto.createdBy,
  });

  return { debit, credit };
}

export async function listExpenses(filter?: { accountId?: string; category?: string }): Promise<Expense[]> {
  const supabase = await getAdminDatabaseClient();
  let query = supabase
    .from("expenses")
    .select(`
      *,
      account:payment_accounts(name)
    `)
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
  const targetAccount = await resolvePaymentAccount(supabase, data.account_id);
  const accountId = targetAccount.id;

  const { data: exp, error } = await supabase
    .from("expenses")
    .insert({
      account_id: accountId,
      category: data.category.trim(),
      payee: data.payee.trim(),
      amount: data.amount,
      expense_date: data.expense_date || new Date().toISOString().split("T")[0],
      description: data.description || null,
      receipt_url: data.receipt_url || null,
    })
    .select(`
      *,
      account:payment_accounts(name)
    `)
    .single();

  if (error) {
    console.error("[FinanceService] recordExpense error:", error);
    throw new Error(`Failed to record expense: ${error.message}`);
  }

  // Deduct from account balance and record ledger entry
  const newBalance = targetAccount.current_balance - data.amount;
  const txNo = `TXN-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

  await Promise.all([
    supabase
      .from("payment_accounts")
      .update({
        current_balance: newBalance,
        updated_at: new Date().toISOString(),
      })
      .eq("id", accountId),
    supabase
      .from("financial_ledger")
      .insert({
        transaction_number: txNo,
        account_id: accountId,
        entry_type: "debit",
        amount: data.amount,
        balance_after: newBalance,
        category: data.category.trim(),
        description: data.description?.trim() || `Expense paid to ${data.payee.trim()}`,
        reference_type: "expense",
        reference_id: exp.id,
      })
  ]);

  return {
    ...exp,
    account_name: (exp as any).account?.name,
  } as Expense;
}

export async function getDailyClosingRecord(date?: string): Promise<DailyClosing | null> {
  const supabase = await getAdminDatabaseClient();
  const targetDate = date || new Date().toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("daily_closings")
    .select("*")
    .eq("closing_date", targetDate)
    .maybeSingle();

  if (error) return null;
  return data as DailyClosing | null;
}

export async function saveDailyClosingRecord(data: Partial<DailyClosing>): Promise<DailyClosing> {
  const supabase = await getAdminDatabaseClient();
  const today = new Date().toISOString().split("T")[0];

  const { data: closing, error } = await supabase
    .from("daily_closings")
    .upsert({
      closing_date: data.closing_date || today,
      opening_cash: data.opening_cash || 0,
      cash_in: data.cash_in || 0,
      cash_out: data.cash_out || 0,
      system_cash: data.system_cash || 0,
      actual_cash: data.actual_cash || 0,
      difference: data.difference || 0,
      bank_wallets_balance: data.bank_wallets_balance || 0,
      stamps_sold_count: data.stamps_sold_count || 0,
      stamps_sold_value: data.stamps_sold_value || 0,
      status: (data.status as any) || "closed",
      notes: data.notes || null,
      closed_at: new Date().toISOString(),
    }, { onConflict: "closing_date" })
    .select()
    .single();

  if (error) {
    console.error("[FinanceService] saveDailyClosingRecord error:", error);
    throw new Error(`Failed to save daily closing: ${error.message}`);
  }

  return closing as DailyClosing;
}

