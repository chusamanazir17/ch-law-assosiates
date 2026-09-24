// ==============================================================================
// Edge Function: generate-report
// Project: CH Office Management System
// Generates official reports (P&L, Cash flow, Stamp stock audit, Tax compliance)
// ==============================================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: req.headers.get("Authorization")! } },
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { report_type, start_date, end_date } = body;

    let reportData: any = {};

    if (report_type === "pnl") {
      const { data, error } = await supabase.from("v_monthly_profit").select("*");
      if (error) throw error;
      reportData = { type: "Profit & Loss Statement", data };
    } else if (report_type === "cash_summary") {
      let query = supabase.from("v_daily_cash_summary").select("*");
      if (start_date) query = query.gte("business_date", start_date);
      if (end_date) query = query.lte("business_date", end_date);
      const { data, error } = await query;
      if (error) throw error;
      reportData = { type: "Daily Cash Flow Summary", data };
    } else if (report_type === "stamp_inventory") {
      const { data, error } = await supabase.from("v_stamp_current_stock").select("*");
      if (error) throw error;
      reportData = { type: "Stamp Paper Physical Inventory Audit", data };
    } else if (report_type === "outstanding_clients") {
      const { data, error } = await supabase.from("v_outstanding_clients").select("*");
      if (error) throw error;
      reportData = { type: "Client Receivables & Outstanding Aging", data };
    } else {
      // Default: Dashboard KPI summary
      const { data, error } = await supabase.from("v_dashboard_summary").select("*").single();
      if (error) throw error;
      reportData = { type: "Executive Dashboard KPI Summary", data };
    }

    return new Response(
      JSON.stringify({
        success: true,
        report: reportData,
        generated_at: new Date().toISOString(),
        office: "CH Composing E-Stamp & Tax Advisor, Chamber 121, Kachahri Sahiwal",
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
