// ==============================================================================
// src/services/audit.service.ts
// Project: CH Office Management System
// Immutable Audit Trail Inspection Service
// ==============================================================================

import { supabase } from "../lib/supabase/client";

export const auditService = {
  // 1. Fetch audit logs with actor profile
  async getLogs(options?: {
    module?: string;
    action?: string;
    limit?: number;
  }) {
    let query = supabase
      .from("audit_logs")
      .select(`
        *,
        actor:profiles(id, full_name)
      `)
      .order("created_at", { ascending: false })
      .limit(options?.limit || 100);

    if (options?.module) query = query.eq("module", options.module);
    if (options?.action) query = query.eq("action", options.action);

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  // 2. Custom operational audit log entry
  async logEvent(payload: {
    action: string;
    module: string;
    tableName: string;
    recordId?: string;
    newValues?: any;
    reason?: string;
  }) {
    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase.from("audit_logs").insert({
      user_id: user?.id || null,
      action: payload.action,
      module: payload.module,
      table_name: payload.tableName,
      record_id: payload.recordId || null,
      new_values: payload.newValues || null,
      reason: payload.reason || null,
    });

    if (error) console.error("Audit log recording failed:", error);
  },
};
