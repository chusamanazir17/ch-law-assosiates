// ==============================================================================
// src/services/finance.service.ts
// Project: CH Office Management System
// Financial Management Service: Canonical Ledger, Transactions, and Balances
// ==============================================================================

import { supabase } from "../lib/supabase/client";
import type { Database, TransactionType } from "../lib/supabase/database.types";

export interface CreateTransactionParams {
  type: TransactionType;
  businessDate: string;
  description: string;
  amount: number;
  accountId: string;
  destAccountId?: string;
  clientId?: string;
  serviceOrderId?: string;
  referenceNumber?: string;
}

export const financeService = {
  // 1. Fetch current balances of all payment accounts (Cash, Meezan, JazzCash, EasyPaisa)
  async getAccountBalances() {
    const { data, error } = await supabase
      .from("v_account_balances")
      .select("*")
      .order("account_type");
    if (error) throw error;
    return data;
  },

  // 2. Fetch financial ledger transactions with pagination and filters
  async getTransactions(options?: {
    type?: TransactionType;
    startDate?: string;
    endDate?: string;
    clientId?: string;
    limit?: number;
  }) {
    let query = supabase
      .from("financial_transactions")
      .select(`
        *,
        client:clients(id, full_name, mobile),
        entries:transaction_entries(
          id,
          entry_type,
          amount,
          account:payment_accounts(id, name, account_type)
        )
      `)
      .order("business_date", { ascending: false })
      .order("created_at", { ascending: false });

    if (options?.type) query = query.eq("transaction_type", options.type);
    if (options?.startDate) query = query.gte("business_date", options.startDate);
    if (options?.endDate) query = query.lte("business_date", options.endDate);
    if (options?.clientId) query = query.eq("client_id", options.clientId);
    if (options?.limit) query = query.limit(options.limit);

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  // 3. Atomically record financial transaction via PostgreSQL function
  async createTransaction(params: CreateTransactionParams) {
    const { data: { user } } = await supabase.auth.getUser();

    const { data: transactionId, error } = await supabase.rpc(
      "create_financial_transaction",
      {
        p_type: params.type,
        p_business_date: params.businessDate,
        p_description: params.description,
        p_amount: params.amount,
        p_account_id: params.accountId,
        p_dest_account_id: params.destAccountId || null,
        p_client_id: params.clientId || null,
        p_service_order_id: params.serviceOrderId || null,
        p_reference_number: params.referenceNumber || null,
        p_created_by: user?.id || null,
      }
    );

    if (error) throw error;
    return transactionId;
  },

  // 4. Non-destructively reverse transaction
  async reverseTransaction(transactionId: string, reason: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Authentication required for reversal.");

    const { data: reversalId, error } = await supabase.rpc(
      "reverse_financial_transaction",
      {
        p_transaction_id: transactionId,
        p_reason: reason,
        p_reversed_by: user.id,
      }
    );

    if (error) throw error;
    return reversalId;
  },

  // 5. Daily cash flow summary
  async getDailyCashSummary(startDate?: string, endDate?: string) {
    let query = supabase
      .from("v_daily_cash_summary")
      .select("*")
      .order("business_date", { ascending: false });

    if (startDate) query = query.gte("business_date", startDate);
    if (endDate) query = query.lte("business_date", endDate);

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },
};
