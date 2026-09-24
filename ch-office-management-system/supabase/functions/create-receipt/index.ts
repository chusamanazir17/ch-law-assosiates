// ==============================================================================
// Edge Function: create-receipt
// Project: CH Office Management System
// Generates official chamber receipts linked to clients and financial ledger
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
      client_id,
      service_order_id,
      transaction_id,
      remarks,
      items, // array of { description, quantity, unit_price }
    } = body;

    if (!transaction_id || !Array.isArray(items) || items.length === 0) {
      return new Response(
        JSON.stringify({ error: "Transaction ID and receipt items are required." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 1. Generate receipt number from database function
    const { data: receiptNumber, error: numError } = await supabase.rpc(
      "generate_receipt_number"
    );
    if (numError) throw numError;

    // 2. Insert into receipts
    const { data: receipt, error: receiptError } = await supabase
      .from("receipts")
      .insert({
        receipt_number: receiptNumber,
        client_id: client_id || null,
        service_order_id: service_order_id || null,
        transaction_id: transaction_id,
        status: "paid",
        remarks: remarks || "Official payment receipt",
        issued_by: user.id,
      })
      .select()
      .single();

    if (receiptError) throw receiptError;

    // 3. Insert receipt line items
    const lineItems = items.map((item: any) => ({
      receipt_id: receipt.id,
      description: item.description,
      quantity: Number(item.quantity) || 1,
      unit_price: Number(item.unit_price) || 0,
    }));

    const { error: itemsError } = await supabase
      .from("receipt_items")
      .insert(lineItems);

    if (itemsError) throw itemsError;

    return new Response(
      JSON.stringify({
        success: true,
        receipt,
        message: "Receipt generated successfully.",
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
