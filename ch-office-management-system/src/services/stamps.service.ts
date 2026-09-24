// ==============================================================================
// src/services/stamps.service.ts
// Project: CH Office Management System
// E-Stamp & Stamp Paper Inventory, Procurement, Sales and Stock Reconciliations
// ==============================================================================

import { supabase } from "../lib/supabase/client";

export const stampsService = {
  // 1. Fetch stamp products with real-time calculated stock
  async getStock() {
    const { data, error } = await supabase
      .from("v_stamp_current_stock")
      .select("*")
      .order("denomination");
    if (error) throw error;
    return data;
  },

  // 2. Fetch stock movements (single source of truth history)
  async getMovements(productId?: string, limit = 50) {
    let query = supabase
      .from("stamp_stock_movements")
      .select(`
        *,
        product:stamp_products(name, denomination)
      `)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (productId) query = query.eq("stamp_product_id", productId);

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  // 3. Record counter stamp paper sale
  async recordSale(payload: {
    clientName: string;
    clientId?: string;
    cnic?: string;
    purpose?: string;
    paymentAccountId: string;
    items: Array<{ stampProductId: string; quantity: number; unitPrice: number }>;
    generateReceipt?: boolean;
  }) {
    const { data, error } = await supabase.functions.invoke("record-stamp-sale", {
      body: {
        client_name: payload.clientName,
        client_id: payload.clientId,
        cnic: payload.cnic,
        purpose: payload.purpose,
        payment_account_id: payload.paymentAccountId,
        items: payload.items.map((i) => ({
          stamp_product_id: i.stampProductId,
          quantity: i.quantity,
          unit_price: i.unitPrice,
        })),
        generate_receipt: payload.generateReceipt,
      },
    });

    if (error) throw error;
    return data;
  },

  // 4. Record stamp purchase / procurement from Treasury
  async recordPurchase(payload: {
    supplierName: string;
    vendorId?: string;
    paymentAccountId: string;
    items: Array<{ stampProductId: string; quantity: number; unitCost: number }>;
    notes?: string;
  }) {
    const { data, error } = await supabase.functions.invoke("record-stamp-purchase", {
      body: {
        supplier_name: payload.supplierName,
        vendor_id: payload.vendorId,
        payment_account_id: payload.paymentAccountId,
        items: payload.items.map((i) => ({
          stamp_product_id: i.stampProductId,
          quantity: i.quantity,
          unit_cost: i.unitCost,
        })),
        notes: payload.notes,
      },
    });

    if (error) throw error;
    return data;
  },

  // 5. Adjust stock during physical count verification
  async adjustStock(payload: {
    stampProductId: string;
    adjustedStock: number;
    reason: string;
  }) {
    const { data, error } = await supabase.functions.invoke("adjust-stamp-stock", {
      body: {
        stamp_product_id: payload.stampProductId,
        adjusted_stock: payload.adjustedStock,
        reason: payload.reason,
      },
    });

    if (error) throw error;
    return data;
  },
};
