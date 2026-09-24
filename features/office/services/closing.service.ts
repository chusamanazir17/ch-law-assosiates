// ==============================================================================
// src/services/closing.service.ts
// Project: CH Office Management System
// Daily Register Closing, Physical Cash Reconciliation, and Shift Balancing
// ==============================================================================

import { supabase } from "../lib/supabase/client";

export const closingService = {
  // 1. Fetch closing history
  async getClosings(limit = 30) {
    const { data, error } = await supabase
      .from("daily_closings")
      .select(`
        *,
        account:payment_accounts(id, name, account_type),
        closer:profiles!daily_closings_closed_by_fkey(full_name)
      `)
      .order("business_date", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  },

  // 2. Perform daily register closing
  async closeBusinessDay(payload: {
    accountId: string;
    businessDate: string;
    actualBalance: number;
    differenceReason?: string;
  }) {
    const { data: { user } } = await supabase.auth.getUser();

    const { data, error } = await supabase.rpc("close_business_day", {
      p_account_id: payload.accountId,
      p_business_date: payload.businessDate,
      p_actual_balance: payload.actualBalance,
      p_difference_reason: payload.differenceReason || "Daily cash register count",
      p_closed_by: user?.id || null,
    });

    if (error) throw error;
    return data;
  },

  // 3. Admin reopen business day
  async reopenBusinessDay(closingId: string, reason: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Authentication required.");

    const { data, error } = await supabase.rpc("reopen_business_day", {
      p_closing_id: closingId,
      p_reason: reason,
      p_reopened_by: user.id,
    });

    if (error) throw error;
    return data;
  },
};
