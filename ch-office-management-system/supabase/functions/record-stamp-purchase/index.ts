// ==============================================================================
// Edge Function: record-stamp-purchase
// Project: CH Office Management System
// Atomically records stamp procurement, inventory stock movement, and expense transaction
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
      supplier_name,
      vendor_id,
      payment_account_id,
      items, // array of { stamp_product_id, quantity, unit_cost }
      notes,
    } = body;

    if (!supplier_name || !payment_account_id || !Array.isArray(items) || items.length === 0) {
      return new Response(
        JSON.stringify({ error: "Missing required procurement fields (supplier_name, payment_account_id, items)" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const totalCost = items.reduce(
      (sum: number, it: any) => sum + Number(it.quantity) * Number(it.unit_cost),
      0
    );

    // 1. Create financial expense transaction in ledger
    const { data: txId, error: txError } = await supabase.rpc("create_financial_transaction", {
      p_type: "expense",
      p_business_date: new Date().toISOString().split("T")[0],
      p_description: `Stamp Purchase from ${supplier_name}`,
      p_amount: totalCost,
      p_account_id: payment_account_id,
      p_dest_account_id: null,
      p_client_id: null,
      p_service_order_id: null,
      p_reference_number: `STAMP-PURCHASE-${Date.now()}`,
      p_created_by: user.id,
    });
    if (txError) throw txError;

    // 2. Create stamp_purchases record
    const purchaseNumber = `STP-${Date.now()}`;
    const { data: purchase, error: purchaseError } = await supabase
      .from("stamp_purchases")
      .insert({
        purchase_number: purchaseNumber,
        vendor_id: vendor_id || null,
        supplier_name,
        total_cost: totalCost,
        transaction_id: txId,
        notes: notes || "Procurement of judicial/non-judicial stamp papers",
        created_by: user.id,
      })
      .select()
      .single();
    if (purchaseError) throw purchaseError;

    // 3. Insert purchase line items
    const purchaseItems = items.map((it: any) => ({
      purchase_id: purchase.id,
      stamp_product_id: it.stamp_product_id,
      quantity: Number(it.quantity),
      unit_cost: Number(it.unit_cost),
    }));
    const { error: itemsError } = await supabase.from("stamp_purchase_items").insert(purchaseItems);
    if (itemsError) throw itemsError;

    // 4. Create stock movements (inbound positive)
    const stockMovements = items.map((it: any) => ({
      stamp_product_id: it.stamp_product_id,
      movement_type: "purchase",
      quantity: Number(it.quantity),
      reference_type: "purchase",
      reference_id: purchase.id,
      notes: `Purchase from ${supplier_name}`,
      created_by: user.id,
    }));
    const { error: moveError } = await supabase.from("stamp_stock_movements").insert(stockMovements);
    if (moveError) throw moveError;

    return new Response(
      JSON.stringify({
        success: true,
        purchase,
        transaction_id: txId,
        message: "Stamp purchase recorded and inventory updated.",
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
