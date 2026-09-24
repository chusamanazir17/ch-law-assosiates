import { getAdminDatabaseClient } from "@/lib/supabase/service";
import type { ReceiptRecord } from "@/types/office";

const isUuid = (val?: string | null): val is string =>
  typeof val === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);

export interface CreateReceiptDTO {
  receipt_number?: string;
  client_id?: string | null;
  client_name: string;
  service_type?: string;
  amount_paid: number;
  balance_due?: number;
  payment_method?: string;
  status?: "paid" | "partial" | "unpaid" | "cancelled";
  notes?: string | null;
  issued_by?: string | null;
}

export async function listReceipts(filter?: {
  status?: string;
  clientId?: string;
  search?: string;
}): Promise<ReceiptRecord[]> {
  const supabase = await getAdminDatabaseClient();
  let query = supabase
    .from("receipts")
    .select("*")
    .order("created_at", { ascending: false });

  if (filter?.status && filter.status !== "ALL") {
    query = query.eq("status", filter.status as any);
  }

  if (filter?.clientId) {
    query = query.eq("client_id", filter.clientId);
  }

  if (filter?.search && filter.search.trim()) {
    const term = `%${filter.search.trim()}%`;
    query = query.or(`receipt_number.ilike.${term},client_name.ilike.${term},service_type.ilike.${term}`);
  }

  const { data, error } = await query;
  if (error) {
    console.error("[ReceiptsService] listReceipts error:", error);
    throw new Error(`Failed to load receipts: ${error.message}`);
  }

  return (data || []) as ReceiptRecord[];
}

export async function createReceiptRecord(dto: CreateReceiptDTO): Promise<ReceiptRecord> {
  const supabase = await getAdminDatabaseClient();
  const receiptNo = dto.receipt_number || `REC-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

  let validClientId: string | null = null;
  if (isUuid(dto.client_id)) {
    const { data: clientExists } = await supabase
      .from("clients")
      .select("id")
      .eq("id", dto.client_id)
      .maybeSingle();
    if (clientExists) validClientId = clientExists.id;
  }

  const { data, error } = await supabase
    .from("receipts")
    .insert({
      receipt_number: receiptNo,
      client_id: validClientId,
      client_name: dto.client_name.trim(),
      service_type: dto.service_type || "Legal Documentation",
      amount_paid: dto.amount_paid || 0,
      balance_due: dto.balance_due || 0,
      payment_method: dto.payment_method || "cash",
      status: dto.status || "paid",
      notes: dto.notes || null,
      issued_by: dto.issued_by || null,
    })
    .select()
    .single();

  if (error) {
    console.error("[ReceiptsService] createReceiptRecord error:", error);
    throw new Error(`Failed to create receipt: ${error.message}`);
  }

  return data as ReceiptRecord;
}

export async function updateReceiptStatus(id: string, status: "paid" | "partial" | "unpaid" | "cancelled", notes?: string): Promise<ReceiptRecord> {
  const supabase = await getAdminDatabaseClient();
  const { data, error } = await supabase
    .from("receipts")
    .update({
      status,
      notes: notes || undefined,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("[ReceiptsService] updateReceiptStatus error:", error);
    throw new Error(`Failed to update receipt: ${error.message}`);
  }

  return data as ReceiptRecord;
}

