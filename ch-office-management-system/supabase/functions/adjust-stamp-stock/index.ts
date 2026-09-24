// ==============================================================================
// Edge Function: adjust-stamp-stock
// Project: CH Office Management System
// Performs physical audit stock reconciliation using stock movements and audit trail
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
    const { stamp_product_id, adjusted_stock, reason } = body;

    if (!stamp_product_id || adjusted_stock === undefined || adjusted_stock < 0 || !reason) {
      return new Response(
        JSON.stringify({ error: "Valid stamp_product_id, non-negative adjusted_stock, and reason are required." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 1. Calculate current physical stock from movements
    const { data: currentStock, error: stockErr } = await supabase.rpc(
      "calculate_stamp_stock",
      { p_product_id: stamp_product_id }
    );
    if (stockErr) throw stockErr;

    const diff = Number(adjusted_stock) - Number(currentStock);
    if (diff === 0) {
      return new Response(
        JSON.stringify({ success: true, message: "Inventory is already equal to adjusted stock. No movement needed." }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 2. Insert audit adjustment record
    const { data: adjustment, error: adjError } = await supabase
      .from("stamp_adjustments")
      .insert({
        stamp_product_id,
        previous_stock: currentStock,
        adjusted_stock: Number(adjusted_stock),
        reason: reason.trim(),
        adjusted_by: user.id,
      })
      .select()
      .single();
    if (adjError) throw adjError;

    // 3. Insert compensating stock movement
    const movementType = diff > 0 ? "adjustment_in" : "adjustment_out";
    const { error: moveError } = await supabase
      .from("stamp_stock_movements")
      .insert({
        stamp_product_id,
        movement_type: movementType,
        quantity: diff,
        reference_type: "adjustment",
        reference_id: adjustment.id,
        notes: `Physical verification audit: ${reason.trim()}`,
        created_by: user.id,
      });
    if (moveError) throw moveError;

    // 4. Record security audit log
    await supabase.from("audit_logs").insert({
      user_id: user.id,
      action: "ADJUST",
      module: "Stamps",
      table_name: "stamp_products",
      record_id: stamp_product_id,
      old_values: { stock: currentStock },
      new_values: { stock: adjusted_stock, difference: diff },
      reason: reason.trim(),
    });

    return new Response(
      JSON.stringify({
        success: true,
        adjustment,
        new_stock: adjusted_stock,
        difference: diff,
        message: `Stamp stock reconciled successfully from ${currentStock} to ${adjusted_stock}.`,
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
