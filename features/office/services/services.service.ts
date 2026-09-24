// ==============================================================================
// src/services/services.service.ts
// Project: CH Office Management System
// Legal Composing, Typing, E-Stamp Processing & Service Orders
// ==============================================================================

import { supabase } from "../lib/supabase/client";

export const servicesService = {
  // 1. Fetch service catalog
  async getCatalog() {
    const { data, error } = await supabase
      .from("services")
      .select(`
        *,
        category:service_categories(id, name)
      `)
      .eq("active", true)
      .order("name");
    if (error) throw error;
    return data;
  },

  // 2. Fetch service orders with client info
  async getOrders(clientId?: string) {
    let query = supabase
      .from("service_orders")
      .select(`
        *,
        client:clients(id, full_name, mobile),
        service:services(id, name),
        items:service_order_items(*)
      `)
      .order("created_at", { ascending: false });

    if (clientId) query = query.eq("client_id", clientId);

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  // 3. Create service order
  async createOrder(payload: {
    clientId: string;
    serviceId?: string;
    totalAmount: number;
    discount?: number;
    dueDate?: string;
    notes?: string;
    items?: Array<{ description: string; quantity: number; unitPrice: number }>;
  }) {
    const { data: { user } } = await supabase.auth.getUser();
    const discount = payload.discount || 0;
    const netAmount = Math.max(0, payload.totalAmount - discount);

    const { data: order, error } = await supabase
      .from("service_orders")
      .insert({
        client_id: payload.clientId,
        service_id: payload.serviceId || null,
        total_amount: payload.totalAmount,
        discount,
        net_amount: netAmount,
        due_date: payload.dueDate || null,
        notes: payload.notes || null,
        status: "pending",
        created_by: user?.id || null,
      })
      .select()
      .single();

    if (error) throw error;

    if (payload.items && payload.items.length > 0) {
      const lineItems = payload.items.map((i) => ({
        order_id: order.id,
        description: i.description,
        quantity: i.quantity,
        unit_price: i.unitPrice,
      }));
      await supabase.from("service_order_items").insert(lineItems);
    }

    return order;
  },

  // 4. Revenue report by service
  async getRevenueDistribution() {
    const { data, error } = await supabase
      .from("v_service_revenue")
      .select("*")
      .order("total_revenue", { ascending: false });
    if (error) throw error;
    return data;
  },
};
