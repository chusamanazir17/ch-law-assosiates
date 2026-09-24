// ==============================================================================
// src/services/clients.service.ts
// Project: CH Office Management System
// Clients Directory, Receivables, History and Documents
// ==============================================================================

import { supabase } from "../lib/supabase/client";

export interface CreateClientDTO {
  fullName: string;
  businessName?: string;
  mobile: string;
  phone?: string;
  cnic?: string;
  ntn?: string;
  email?: string;
  city?: string;
  address?: string;
}

export const clientsService = {
  // 1. Fetch clients with real-time outstanding balances
  async getClients(searchTerm?: string) {
    let query = supabase
      .from("v_client_balances")
      .select("*")
      .order("full_name");

    if (searchTerm && searchTerm.trim()) {
      const term = `%${searchTerm.trim()}%`;
      query = query.or(`full_name.ilike.${term},business_name.ilike.${term},mobile.ilike.${term},client_code.ilike.${term}`);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  // 2. Fetch clients with pending outstanding dues
  async getOutstandingClients() {
    const { data, error } = await supabase
      .from("v_outstanding_clients")
      .select("*")
      .order("outstanding_balance", { ascending: false });
    if (error) throw error;
    return data;
  },

  // 3. Get single client profile with services and payment history
  async getClientById(clientId: string) {
    const { data: client, error: clientErr } = await supabase
      .from("clients")
      .select(`
        *,
        contacts:client_contacts(*),
        notes:client_notes(*),
        documents:client_documents(*)
      `)
      .eq("id", clientId)
      .single();

    if (clientErr) throw clientErr;

    // Get calculated balance
    const { data: balance } = await supabase
      .from("v_client_balances")
      .select("total_billed, total_paid, outstanding_balance")
      .eq("client_id", clientId)
      .single();

    return {
      ...client,
      financials: balance || { total_billed: 0, total_paid: 0, outstanding_balance: 0 },
    };
  },

  // 4. Create new client
  async createClient(dto: CreateClientDTO) {
    const { data, error } = await supabase
      .from("clients")
      .insert({
        full_name: dto.fullName,
        business_name: dto.businessName || null,
        mobile: dto.mobile,
        phone: dto.phone || null,
        cnic: dto.cnic || null,
        ntn: dto.ntn || null,
        email: dto.email || null,
        city: dto.city || "Sahiwal",
        address: dto.address || null,
        status: "active",
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // 5. Update client
  async updateClient(clientId: string, updates: Partial<CreateClientDTO>) {
    const updatePayload: any = {};
    if (updates.fullName !== undefined) updatePayload.full_name = updates.fullName;
    if (updates.businessName !== undefined) updatePayload.business_name = updates.businessName;
    if (updates.mobile !== undefined) updatePayload.mobile = updates.mobile;
    if (updates.phone !== undefined) updatePayload.phone = updates.phone;
    if (updates.cnic !== undefined) updatePayload.cnic = updates.cnic;
    if (updates.ntn !== undefined) updatePayload.ntn = updates.ntn;
    if (updates.email !== undefined) updatePayload.email = updates.email;
    if (updates.city !== undefined) updatePayload.city = updates.city;
    if (updates.address !== undefined) updatePayload.address = updates.address;

    const { data, error } = await supabase
      .from("clients")
      .update(updatePayload)
      .eq("id", clientId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};
