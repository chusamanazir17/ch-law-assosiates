// ==============================================================================
// src/services/reports.service.ts
// Project: CH Office Management System
// Executive Financial Statements, P&L, Inventory Audits, and Receivables
// ==============================================================================

import { supabase } from "../lib/supabase/client";

export const reportsService = {
  // 1. Executive dashboard KPI summary
  async getDashboardSummary() {
    const { data, error } = await supabase
      .from("v_dashboard_summary")
      .select("*")
      .single();
    if (error) throw error;
    return data;
  },

  // 2. Monthly Profit & Loss
  async getProfitAndLoss() {
    const { data, error } = await supabase
      .from("v_monthly_profit")
      .select("*")
      .order("year", { ascending: false })
      .order("month", { ascending: false });
    if (error) throw error;
    return data;
  },

  // 3. Stamp Inventory Audit
  async getStampInventoryReport() {
    const { data, error } = await supabase
      .from("v_stamp_current_stock")
      .select("*")
      .order("denomination");
    if (error) throw error;
    return data;
  },

  // 4. Receivables / Client Aging
  async getReceivablesReport() {
    const { data, error } = await supabase
      .from("v_outstanding_clients")
      .select("*")
      .order("outstanding_balance", { ascending: false });
    if (error) throw error;
    return data;
  },
};
