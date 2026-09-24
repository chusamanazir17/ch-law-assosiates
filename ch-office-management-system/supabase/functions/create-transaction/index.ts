// ==============================================================================
// Edge Function: create-transaction
// Project: CH Office Management System
// Atomic creation of financial transactions and double-entry ledger records
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
    const {
      type,
      business_date,
      description,
      amount,
      account_id,
      dest_account_id,
      client_id,
      service_order_id,
      reference_number,
    } = body;

    if (!type || !amount || !account_id || amount <= 0) {
      return new Response(
        JSON.stringify({ error: "Missing or invalid required fields (type, amount, account_id)" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Call atomic PostgreSQL function create_financial_transaction
    const { data: transactionId, error: rpcError } = await supabase.rpc(
      "create_financial_transaction",
      {
        p_type: type,
        p_business_date: business_date || new Date().toISOString().split("T")[0],
        p_description: description || `Transaction ${type.toUpperCase()}`,
        p_amount: Number(amount),
        p_account_id: account_id,
        p_dest_account_id: dest_account_id || null,
        p_client_id: client_id || null,
        p_service_order_id: service_order_id || null,
        p_reference_number: reference_number || null,
        p_created_by: user.id,
      }
    );

    if (rpcError) {
      return new Response(JSON.stringify({ error: rpcError.message }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        transaction_id: transactionId,
        message: "Financial transaction created successfully in central ledger.",
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
