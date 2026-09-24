import { createClient } from "@/lib/supabase/server";
import type { Expense, PaymentAccount, FinancialLedgerEntry, StampProduct, DailyClosing } from "@/types/office";

export async function listAccounts(): Promise<PaymentAccount[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("payment_accounts")
    .select("*")
    .eq("active", true)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("[ExpensesService] listAccounts error:", error);
    throw new Error(`Failed to load payment accounts: ${error.message}`);
  }

  return (data || []) as PaymentAccount[];
}

export async function listExpenses(): Promise<Expense[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("expenses")
    .select(`
      *,
      account:payment_accounts(name)
    `)
    .order("expense_date", { ascending: false });

  if (error) throw new Error(`Failed to load expenses: ${error.message}`);

  return (data || []).map((row: any) => ({
    ...row,
    account_name: row.account?.name,
  })) as Expense[];
}

export async function recordExpenseRecord(data: {
  account_id?: string | null;
  category: string;
  payee: string;
  amount: number;
  expense_date?: string;
  description?: string | null;
  receipt_url?: string | null;
}): Promise<Expense> {
  const supabase = await createClient();
  const { data: exp, error } = await supabase
    .from("expenses")
    .insert({
      account_id: data.account_id || null,
      category: data.category.trim(),
      payee: data.payee.trim(),
      amount: data.amount,
      expense_date: data.expense_date || new Date().toISOString().split("T")[0],
      description: data.description || null,
      receipt_url: data.receipt_url || null,
    })
    .select()
    .single();

  if (error) {
    console.error("[ExpensesService] recordExpenseRecord error:", error);
    throw new Error(`Failed to record expense: ${error.message}`);
  }

  return exp as Expense;
}

export async function listStampProducts(): Promise<StampProduct[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("stamp_products")
    .select("*")
    .eq("active", true)
    .order("denomination", { ascending: true });

  if (error) throw new Error(`Failed to load stamp products: ${error.message}`);
  return (data || []) as StampProduct[];
}

export async function recordStampSaleRecord(data: {
  stamp_product_id: string;
  quantity: number;
  client_id?: string | null;
  client_name?: string | null;
  notes?: string | null;
}): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("stamp_stock_movements")
    .insert({
      stamp_product_id: data.stamp_product_id,
      movement_type: "sale",
      quantity: data.quantity,
      client_id: data.client_id || null,
      notes: data.notes || (data.client_name ? `Sale to ${data.client_name}` : "Counter Sale"),
    });

  if (error) throw new Error(`Failed to record stamp sale: ${error.message}`);
}

export async function getDailyClosingRecord(date?: string): Promise<DailyClosing | null> {
  const supabase = await createClient();
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
  const supabase = await createClient();
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
      status: "closed",
      notes: data.notes || null,
      closed_at: new Date().toISOString(),
    }, { onConflict: "closing_date" })
    .select()
    .single();

  if (error) throw new Error(`Failed to save daily closing: ${error.message}`);
  return closing as DailyClosing;
}
