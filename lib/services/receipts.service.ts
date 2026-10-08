import { getAdminDatabaseClient } from "@/lib/supabase/service";
import { nextDocumentNumber } from "@/lib/services/rpc";
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
    .is("deleted_at", null)
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

  // Money guard (API-2): a receipt must record a positive amount.
  if (typeof dto.amount_paid !== "number" || !Number.isFinite(dto.amount_paid) || dto.amount_paid <= 0) {
    throw new Error("Receipt amount must be a finite number greater than 0.");
  }

  // Collision-safe receipt number from a DB sequence (FIN-12).
  const receiptNo = dto.receipt_number || (await nextDocumentNumber(supabase, "receipt"));

  let validClientId: string | null = null;
  if (isUuid(dto.client_id)) {
    const { data: clientExists } = await supabase
      .from("clients")
      .select("id")
      .eq("id", dto.client_id)
      .is("deleted_at", null)
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

export async function updateReceiptStatus(id: string, status: "paid" | "partial" | "unpaid" | "cancelled", notes?: string): Promise<ReceiptRecord | null> {
  const supabase = await getAdminDatabaseClient();
  const { data, error } = await supabase
    .from("receipts")
    .update({
      status,
      notes: notes || undefined,
    })
    .eq("id", id)
    .is("deleted_at", null)
    .select()
    .maybeSingle();

  if (error) {
    console.error("[ReceiptsService] updateReceiptStatus error:", error);
    throw new Error(`Failed to update receipt: ${error.message}`);
  }

  return (data as ReceiptRecord) || null;
}

