import { getAdminDatabaseClient } from "@/lib/supabase/service";
import type { ServiceOrderRecord } from "@/types/office";

const isUuid = (str: any): boolean =>
  typeof str === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str);

export interface CreateServiceOrderDTO {
  order_number?: string;
  client_id?: string | null;
  customer_name: string;
  service_name: string;
  category?: string;
  pages?: number;
  amount?: number;
  payment_status?: string;
  delivery_date?: string | null;
  file_reference?: string | null;
  status?: string;
  notes?: string | null;
}

export async function listServiceOrders(filter?: {
  status?: string;
  category?: string;
  clientId?: string;
  search?: string;
}): Promise<ServiceOrderRecord[]> {
  const supabase = await getAdminDatabaseClient();
  let query = supabase
    .from("service_orders")
    .select(`
      *,
      client:clients(full_name)
    `)
    .order("created_at", { ascending: false });

  if (filter?.status && filter.status !== "ALL") {
    query = query.eq("status", filter.status);
  }

  if (filter?.category && filter.category !== "ALL") {
    query = query.eq("category", filter.category);
  }

  if (filter?.clientId && isUuid(filter.clientId)) {
    query = query.eq("client_id", filter.clientId);
  }

  if (filter?.search && filter.search.trim()) {
    const term = `%${filter.search.trim()}%`;
    query = query.or(`order_number.ilike.${term},customer_name.ilike.${term},service_name.ilike.${term},file_reference.ilike.${term}`);
  }

  const { data, error } = await query;
  if (error) {
    console.error("[ServicesService] listServiceOrders error:", error);
    throw new Error(`Failed to load service orders: ${error.message}`);
  }

  return (data || []).map((row: any) => ({
    ...row,
    client_name: row.client?.full_name,
  })) as ServiceOrderRecord[];
}

export async function getServiceOrderById(id: string): Promise<ServiceOrderRecord | null> {
  if (!isUuid(id)) return null;
  const supabase = await getAdminDatabaseClient();
  const { data, error } = await supabase
    .from("service_orders")
    .select(`
      *,
      client:clients(full_name)
    `)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("[ServicesService] getServiceOrderById error:", error);
    throw new Error(`Failed to load service order: ${error.message}`);
  }

  if (!data) return null;

  return {
    ...data,
    client_name: (data as any).client?.full_name,
  } as ServiceOrderRecord;
}

export async function createServiceOrderRecord(dto: CreateServiceOrderDTO): Promise<ServiceOrderRecord> {
  const supabase = await getAdminDatabaseClient();
  const orderNumber = dto.order_number || `SO-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

  let resolvedClientId = dto.client_id;
  if (resolvedClientId && !isUuid(resolvedClientId)) {
    resolvedClientId = null;
  }

  const { data, error } = await supabase
    .from("service_orders")
    .insert({
      order_number: orderNumber,
      client_id: resolvedClientId,
      customer_name: dto.customer_name.trim(),
      service_name: dto.service_name.trim(),
      category: dto.category || "Legal Drafting",
      pages: dto.pages || 1,
      amount: dto.amount || 0,
      payment_status: dto.payment_status || "Unpaid",
      delivery_date: dto.delivery_date || null,
      file_reference: dto.file_reference || null,
      status: dto.status || "In Progress",
      notes: dto.notes || null,
    })
    .select(`
      *,
      client:clients(full_name)
    `)
    .single();

  if (error) {
    console.error("[ServicesService] createServiceOrderRecord error:", error);
    throw new Error(`Failed to create service order: ${error.message}`);
  }

  return {
    ...data,
    client_name: (data as any).client?.full_name,
  } as ServiceOrderRecord;
}

export async function updateServiceOrderRecord(id: string, updates: Partial<CreateServiceOrderDTO>): Promise<ServiceOrderRecord | null> {
  if (!isUuid(id)) return null;
  const supabase = await getAdminDatabaseClient();

  const sanitizedUpdates: any = {
    ...updates,
    updated_at: new Date().toISOString(),
  };

  if ("client_id" in sanitizedUpdates && !isUuid(sanitizedUpdates.client_id)) {
    delete sanitizedUpdates.client_id;
  }

  const { data, error } = await supabase
    .from("service_orders")
    .update(sanitizedUpdates)
    .eq("id", id)
    .select(`
      *,
      client:clients(full_name)
    `)
    .single();

  if (error) {
    console.error("[ServicesService] updateServiceOrderRecord error:", error);
    throw new Error(`Failed to update service order: ${error.message}`);
  }

  return {
    ...data,
    client_name: (data as any).client?.full_name,
  } as ServiceOrderRecord;
}

export async function deleteServiceOrderRecord(id: string): Promise<void> {
  if (!isUuid(id)) return;
  const supabase = await getAdminDatabaseClient();
  const { error } = await supabase.from("service_orders").delete().eq("id", id);
  if (error) {
    throw new Error(`Failed to delete service order: ${error.message}`);
  }
}
