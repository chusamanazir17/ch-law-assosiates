// ==============================================================================
// src/services/tax.service.ts
// Project: CH Office Management System
// FBR Income Tax, Sales Tax, IRIS Filings, CPRs and Deadlines
// ==============================================================================

import { supabase } from "../lib/supabase/client";
import type { TaxCaseStatus } from "../lib/supabase/database.types";

export const taxService = {
  // 1. Fetch tax cases with client details
  async getCases(options?: { status?: TaxCaseStatus; taxYear?: string }) {
    let query = supabase
      .from("tax_cases")
      .select(`
        *,
        client:clients(id, full_name, mobile, cnic, ntn),
        returns:tax_returns(*),
        assigned_user:profiles!tax_cases_assigned_to_fkey(full_name)
      `)
      .order("created_at", { ascending: false });

    if (options?.status) query = query.eq("status", options.status);
    if (options?.taxYear) query = query.eq("tax_year", options.taxYear);

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  // 2. Fetch statutory deadlines with countdown
  async getDeadlines() {
    const { data, error } = await supabase
      .from("v_tax_deadlines")
      .select("*")
      .order("deadline_date");
    if (error) throw error;
    return data;
  },

  // 3. Create new tax case
  async createCase(payload: {
    clientId: string;
    taxYear: string;
    caseType: string;
    fee: number;
    assignedTo?: string;
    dueDate?: string;
    notes?: string;
  }) {
    const caseNumber = `TAX-${payload.taxYear}-${Date.now().toString().slice(-5)}`;
    const { data, error } = await supabase
      .from("tax_cases")
      .insert({
        case_number: caseNumber,
        client_id: payload.clientId,
        tax_year: payload.taxYear,
        case_type: payload.caseType,
        fee: payload.fee,
        assigned_to: payload.assignedTo || null,
        due_date: payload.dueDate || null,
        notes: payload.notes || null,
        status: "documents_required",
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // 4. Update status and IRIS filing details
  async updateCaseStatus(caseId: string, status: TaxCaseStatus, submissionRef?: string) {
    const updates: any = { status };
    if (submissionRef) {
      updates.submission_reference = submissionRef;
      updates.submission_date = new Date().toISOString().split("T")[0];
    }

    const { data, error } = await supabase
      .from("tax_cases")
      .update(updates)
      .eq("id", caseId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};
