import { createClient } from "@/lib/supabase/server";
import type { Invoice, InvoiceItem, Payment } from "@/types/office";

export interface CreateInvoiceDTO {
  client_id: string;
  case_id?: string | null;
  due_date: string;
  discount_amount?: number;
  tax_amount?: number;
  notes?: string | null;
  items: {
    description: string;
    quantity: number;
    unit_price: number;
  }[];
}

export async function listInvoices(filter?: { status?: string; clientId?: string }): Promise<Invoice[]> {
  const supabase = await createClient();
  let query = supabase
    .from("invoices")
    .select(`
      *,
      client:clients(full_name),
      case:cases(case_number),
      items:invoice_items(*)
    `)
    .order("created_at", { ascending: false });

  if (filter?.status && filter.status !== "ALL") {
    query = query.eq("status", filter.status as any);
  }

  if (filter?.clientId) {
    query = query.eq("client_id", filter.clientId);
  }

  const { data, error } = await query;
  if (error) {
    console.error("[BillingService] listInvoices error:", error);
    throw new Error(`Failed to load invoices: ${error.message}`);
  }

  return (data || []).map((row: any) => ({
    ...row,
    client_name: row.client?.full_name,
    case_number: row.case?.case_number,
    items: row.items || [],
  })) as Invoice[];
}

export async function getInvoiceById(id: string): Promise<Invoice | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("invoices")
    .select(`
      *,
      client:clients(full_name, mobile, address, cnic),
      case:cases(case_number, title),
      items:invoice_items(*)
    `)
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(`Failed to load invoice: ${error.message}`);
  if (!data) return null;

  return {
    ...data,
    client_name: (data as any).client?.full_name,
    case_number: (data as any).case?.case_number,
    items: (data as any).items || [],
  } as Invoice;
}

export async function createInvoiceRecord(dto: CreateInvoiceDTO): Promise<Invoice> {
  const supabase = await createClient();

  // Compute subtotal and total
  const subtotal = dto.items.reduce((acc, item) => acc + (item.quantity * item.unit_price), 0);
  const tax = dto.tax_amount || 0;
  const discount = dto.discount_amount || 0;
  const total = Math.max(0, subtotal + tax - discount);

  // Generate unique invoice number
  const invoiceNumber = `INV-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

  const { data: invoice, error: invError } = await supabase
    .from("invoices")
    .insert({
      invoice_number: invoiceNumber,
      client_id: dto.client_id,
      case_id: dto.case_id || null,
      due_date: dto.due_date,
      subtotal,
      tax_amount: tax,
      discount_amount: discount,
      total_amount: total,
      paid_amount: 0,
      status: "unpaid",
      notes: dto.notes || null,
    })
    .select()
    .single();

  if (invError) {
    console.error("[BillingService] createInvoiceRecord error:", invError);
    throw new Error(`Failed to create invoice: ${invError.message}`);
  }

  // Insert items
  if (dto.items && dto.items.length > 0) {
    const itemsPayload = dto.items.map(item => ({
      invoice_id: invoice.id,
      description: item.description.trim(),
      quantity: item.quantity,
      unit_price: item.unit_price,
      total_price: item.quantity * item.unit_price,
    }));

    await supabase.from("invoice_items").insert(itemsPayload);
  }

  return getInvoiceById(invoice.id) as Promise<Invoice>;
}

export async function recordPaymentRecord(data: {
  invoice_id?: string | null;
  client_id?: string;
  amount: number;
  payment_method?: string;
  payment_account_id?: string | null;
  reference_number?: string | null;
  notes?: string | null;
}): Promise<Payment> {
  const supabase = await createClient();
  const receiptNo = data.reference_number || `REC-${Date.now().toString().slice(-6)}`;

  let clientId = data.client_id;
  if (!clientId && data.invoice_id) {
    const { data: inv } = await supabase
      .from("invoices")
      .select("client_id")
      .eq("id", data.invoice_id)
      .single();
    if (inv?.client_id) {
      clientId = inv.client_id;
    }
  }

  if (!clientId) {
    throw new Error("Client ID is required to record payment");
  }

  const { data: payment, error } = await supabase
    .from("payments")
    .insert({
      invoice_id: data.invoice_id || null,
      client_id: clientId,
      amount: data.amount,
      payment_method: data.payment_method || "cash",
      payment_account_id: data.payment_account_id || null,
      receipt_number: receiptNo,
      notes: data.notes || null,
    })
    .select()
    .single();

  if (error) {
    console.error("[BillingService] recordPaymentRecord error:", error);
    throw new Error(`Failed to record payment: ${error.message}`);
  }

  return payment as Payment;
}

export const recordInvoicePayment = recordPaymentRecord;

export async function listPayments(): Promise<Payment[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("payments")
    .select(`
      *,
      client:clients(full_name),
      account:payment_accounts(name)
    `)
    .order("payment_date", { ascending: false });

  if (error) throw new Error(`Failed to load payments: ${error.message}`);

  return (data || []).map((row: any) => ({
    ...row,
    client_name: row.client?.full_name,
    account_name: row.account?.name,
  })) as Payment[];
}
