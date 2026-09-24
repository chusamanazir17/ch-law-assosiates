import { getAdminDatabaseClient } from "@/lib/supabase/service";
import type { Invoice, InvoiceItem, Payment } from "@/types/office";

const isUuid = (str: any): boolean =>
  typeof str === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str);

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
  const supabase = await getAdminDatabaseClient();
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

  if (filter?.clientId && isUuid(filter.clientId)) {
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
  if (!isUuid(id)) return null;
  const supabase = await getAdminDatabaseClient();
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
  const supabase = await getAdminDatabaseClient();

  // Resolve client_id if non-UUID or mock
  let resolvedClientId: string | undefined = dto.client_id;
  if (!isUuid(resolvedClientId)) {
    const { data: cl } = await supabase.from("clients").select("id").limit(1).maybeSingle();
    resolvedClientId = cl?.id;
  }

  if (!resolvedClientId || !isUuid(resolvedClientId)) {
    throw new Error("A valid Client is required to generate an invoice.");
  }

  const resolvedCaseId = dto.case_id && isUuid(dto.case_id) ? dto.case_id : null;

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
      client_id: resolvedClientId,
      case_id: resolvedCaseId,
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

    const { error: itemsError } = await supabase.from("invoice_items").insert(itemsPayload);
    if (itemsError) {
      console.warn("[BillingService] invoice_items insert warn:", itemsError.message);
    }
  }

  return (await getInvoiceById(invoice.id)) as Invoice;
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
  const supabase = await getAdminDatabaseClient();
  const receiptNo = data.reference_number || `REC-${Date.now().toString().slice(-6)}`;

  let clientId = data.client_id;
  let targetInvoice: any = null;

  if (data.invoice_id && isUuid(data.invoice_id)) {
    const { data: inv } = await supabase
      .from("invoices")
      .select("id, client_id, total_amount, paid_amount, invoice_number")
      .eq("id", data.invoice_id)
      .maybeSingle();

    if (inv) {
      targetInvoice = inv;
      if (!clientId || !isUuid(clientId)) {
        clientId = inv.client_id;
      }
    }
  }

  if (!clientId || !isUuid(clientId)) {
    const { data: cl } = await supabase.from("clients").select("id").limit(1).maybeSingle();
    clientId = cl?.id;
  }

  if (!clientId || !isUuid(clientId)) {
    throw new Error("Client ID is required to record payment");
  }

  // Resolve payment account
  let targetAccountId = data.payment_account_id;
  if (!targetAccountId || !isUuid(targetAccountId)) {
    const method = (data.payment_method || "cash").toLowerCase();
    const { data: accounts } = await supabase.from("payment_accounts").select("id, account_type, name");
    if (accounts && accounts.length > 0) {
      const match = accounts.find((a: any) =>
        (method.includes("bank") && a.account_type === "bank") ||
        (method.includes("jazz") && a.account_type === "jazzcash") ||
        (method.includes("easy") && a.account_type === "easypaisa") ||
        (a.account_type === "cash")
      );
      targetAccountId = match ? match.id : accounts[0].id;
    }
  }

  const { data: payment, error } = await supabase
    .from("payments")
    .insert({
      invoice_id: targetInvoice?.id || (data.invoice_id && isUuid(data.invoice_id) ? data.invoice_id : null),
      client_id: clientId,
      amount: data.amount,
      payment_method: data.payment_method || "cash",
      payment_account_id: targetAccountId && isUuid(targetAccountId) ? targetAccountId : null,
      receipt_number: receiptNo,
      notes: data.notes || null,
    })
    .select()
    .single();

  if (error) {
    console.error("[BillingService] recordPaymentRecord error:", error);
    throw new Error(`Failed to record payment: ${error.message}`);
  }

  // Sync Invoice status and paid_amount
  if (targetInvoice) {
    const newPaid = Number(targetInvoice.paid_amount || 0) + Number(data.amount);
    const newStatus = newPaid >= Number(targetInvoice.total_amount) ? "paid" : "partial";
    await supabase
      .from("invoices")
      .update({
        paid_amount: newPaid,
        status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", targetInvoice.id);
  }

  // Sync Financial Ledger & Account Balance
  if (targetAccountId && isUuid(targetAccountId)) {
    const { data: acc } = await supabase
      .from("payment_accounts")
      .select("current_balance")
      .eq("id", targetAccountId)
      .maybeSingle();

    if (acc) {
      const currentBal = Number(acc.current_balance || 0);
      const newBal = currentBal + Number(data.amount);
      await supabase.from("payment_accounts").update({ current_balance: newBal }).eq("id", targetAccountId);

      const txNum = `TX-REC-${Date.now().toString().slice(-6)}`;
      const { error: ledgerError } = await supabase.from("financial_ledger").insert({
        transaction_number: txNum,
        entry_type: "credit",
        account_id: targetAccountId,
        amount: data.amount,
        balance_after: newBal,
        category: "Legal Fee",
        description: `Payment for Invoice ${targetInvoice?.invoice_number || receiptNo}`,
        client_id: clientId,
        reference_type: "payment",
        reference_id: payment.id,
      });
      if (ledgerError) {
        console.warn("[BillingService] ledger insert error:", ledgerError.message);
      }
    }
  }

  return payment as Payment;
}

export const recordInvoicePayment = recordPaymentRecord;

export async function listPayments(): Promise<Payment[]> {
  const supabase = await getAdminDatabaseClient();
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
