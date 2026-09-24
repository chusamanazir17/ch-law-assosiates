// ==============================================================================
// Edge Function: record-stamp-sale
// Project: CH Office Management System
// Atomically records counter stamp sale, inventory deduction, ledger income, and optional receipt
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
      client_name,
      client_id,
      cnic,
      purpose,
      payment_account_id,
      items, // array of { stamp_product_id, quantity, unit_price }
      generate_receipt,
    } = body;

    if (!client_name || !payment_account_id || !Array.isArray(items) || items.length === 0) {
      return new Response(
        JSON.stringify({ error: "Missing required sale fields (client_name, payment_account_id, items)" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const totalAmount = items.reduce(
      (sum: number, it: any) => sum + Number(it.quantity) * Number(it.unit_price),
      0
    );

    // 1. Create income transaction in ledger
    const { data: txId, error: txError } = await supabase.rpc("create_financial_transaction", {
      p_type: "income",
      p_business_date: new Date().toISOString().split("T")[0],
      p_description: `Stamp Paper Sale: ${client_name} (${purpose || "E-Stamp"})`,
      p_amount: totalAmount,
      p_account_id: payment_account_id,
      p_dest_account_id: null,
      p_client_id: client_id || null,
      p_service_order_id: null,
      p_reference_number: `STAMP-SALE-${Date.now()}`,
      p_created_by: user.id,
    });
    if (txError) throw txError;

    // 2. Create stamp_sales record
    const saleNumber = `STS-${Date.now()}`;
    const { data: sale, error: saleError } = await supabase
      .from("stamp_sales")
      .insert({
        sale_number: saleNumber,
        client_id: client_id || null,
        client_name,
        cnic: cnic || null,
        purpose: purpose || "General Legal Instrument",
        total_amount: totalAmount,
        transaction_id: txId,
        created_by: user.id,
      })
      .select()
      .single();
    if (saleError) throw saleError;

    // 3. Insert sale line items
    const saleItems = items.map((it: any) => ({
      sale_id: sale.id,
      stamp_product_id: it.stamp_product_id,
      quantity: Number(it.quantity),
      unit_price: Number(it.unit_price),
    }));
    const { error: itemsError } = await supabase.from("stamp_sale_items").insert(saleItems);
    if (itemsError) throw itemsError;

    // 4. Create negative stock movements (outbound)
    const stockMovements = items.map((it: any) => ({
      stamp_product_id: it.stamp_product_id,
      movement_type: "sale",
      quantity: -Math.abs(Number(it.quantity)),
      reference_type: "sale",
      reference_id: sale.id,
      notes: `Counter sale to ${client_name}`,
      created_by: user.id,
    }));
    const { error: moveError } = await supabase.from("stamp_stock_movements").insert(stockMovements);
    if (moveError) throw moveError;

    // 5. Optional Receipt Creation
    let receipt = null;
    if (generate_receipt) {
      const { data: recNum } = await supabase.rpc("generate_receipt_number");
      const { data: newRec } = await supabase
        .from("receipts")
        .insert({
          receipt_number: recNum,
          client_id: client_id || null,
          transaction_id: txId,
          status: "paid",
          remarks: `E-Stamp counter sale for ${purpose || "Legal deed"}`,
          issued_by: user.id,
        })
        .select()
        .single();

      if (newRec) {
        receipt = newRec;
        const receiptLineItems = items.map((it: any) => ({
          receipt_id: newRec.id,
          description: `Stamp Paper (Qty: ${it.quantity})`,
          quantity: it.quantity,
          unit_price: it.unit_price,
        }));
        await supabase.from("receipt_items").insert(receiptLineItems);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        sale,
        transaction_id: txId,
        receipt,
        message: "Stamp sale recorded and stock deducted successfully.",
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
