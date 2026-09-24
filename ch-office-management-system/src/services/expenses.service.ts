// ==============================================================================
// src/services/expenses.service.ts
// Project: CH Office Management System
// Chamber Expenses, Vendor Payments, Utility Bills and Supplies
// ==============================================================================

import { supabase } from "../lib/supabase/client";

export const expensesService = {
  // 1. Fetch expenses
  async getExpenses(startDate?: string, endDate?: string) {
    let query = supabase
      .from("expenses")
      .select(`
        *,
        category:expense_categories(id, name),
        account:payment_accounts(id, name, account_type),
        vendor:vendors(id, name)
      `)
      .order("expense_date", { ascending: false });

    if (startDate) query = query.gte("expense_date", startDate);
    if (endDate) query = query.lte("expense_date", endDate);

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  // 2. Fetch expense categories
  async getCategories() {
    const { data, error } = await supabase
      .from("expense_categories")
      .select("*")
      .order("name");
    if (error) throw error;
    return data;
  },

  // 3. Record expense and simultaneously create financial transaction
  async recordExpense(payload: {
    categoryId: string;
    accountId: string;
    vendorId?: string;
    amount: number;
    expenseDate?: string;
    description: string;
    paidTo: string;
    receiptUrl?: string;
  }) {
    const { data: { user } } = await supabase.auth.getUser();
    const date = payload.expenseDate || new Date().toISOString().split("T")[0];

    // 1. Create financial transaction in ledger
    const { data: txId, error: txError } = await supabase.rpc(
      "create_financial_transaction",
      {
        p_type: "expense",
        p_business_date: date,
        p_description: `Expense: ${payload.description} (Paid to: ${payload.paidTo})`,
        p_amount: payload.amount,
        p_account_id: payload.accountId,
        p_dest_account_id: null,
        p_client_id: null,
        p_service_order_id: null,
        p_reference_number: `EXP-${Date.now().toString().slice(-6)}`,
        p_created_by: user?.id || null,
      }
    );
    if (txError) throw txError;

    // 2. Insert into expenses table
    const expenseNumber = `EXP-${Date.now().toString().slice(-6)}`;
    const { data: expense, error: expError } = await supabase
      .from("expenses")
      .insert({
        expense_number: expenseNumber,
        category_id: payload.categoryId,
        account_id: payload.accountId,
        vendor_id: payload.vendorId || null,
        amount: payload.amount,
        expense_date: date,
        description: payload.description,
        paid_to: payload.paidTo,
        receipt_url: payload.receiptUrl || null,
        transaction_id: txId,
        created_by: user?.id || null,
      })
      .select()
      .single();

    if (expError) throw expError;
    return expense;
  },
};
