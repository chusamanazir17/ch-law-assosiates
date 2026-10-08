import { getAdminDatabaseClient } from "@/lib/supabase/service";
import { callRpc } from "@/lib/services/rpc";
import type { Invoice, InvoiceItem, Payment } from "@/types/office";

const isUuid = (str: any): boolean =>
  typeof str === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str);

/** Money guard (API-2): finite and strictly positive. */
function assertPositiveAmount(amount: unknown, label = "Amount"): asserts amount is number {
  if (typeof amount !== "number" || !Number.isFinite(amount) || amount <= 0) {
    throw new Error(`${label} must be a finite number greater than 0.`);
  }
}

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
    .is("deleted_at", null)
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
    .is("deleted_at", null)
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

  // H4: an invalid client reference must fail loudly, never attach to a
  // random client.
  if (!isUuid(dto.client_id)) {
    throw new Error("A valid client_id is required to generate an invoice.");
  }

  const resolvedCaseId = dto.case_id && isUuid(dto.case_id) ? dto.case_id : null;
  if (dto.case_id && !resolvedCaseId) {
    throw new Error("Invalid case_id: must be a valid UUID or omitted.");
  }

  // Validate line items before the RPC (defense in depth; the RPC re-checks).
  if (!dto.items || dto.items.length === 0) {
    throw new Error("At least one line item is required.");
  }
  for (const item of dto.items) {
    if (!item.description || !item.description.trim()) {
      throw new Error("Line item description is required.");
    }
    if (!Number.isInteger(item.quantity) || item.quantity < 1) {
      throw new Error("Line item quantity must be an integer >= 1.");
    }
    if (typeof item.unit_price !== "number" || !Number.isFinite(item.unit_price) || item.unit_price < 0) {
      throw new Error("Line item unit price cannot be negative.");
    }
  }

  // Atomic invoice + items via SECURITY DEFINER RPC (DB-03): totals are
  // computed in SQL, the invoice number comes from a DB sequence (FIN-12),
  // and an items failure rolls back the invoice — no orphans.
  const created = await callRpc<any>(supabase, "create_invoice_with_items", {
    p_client_id: dto.client_id,
    p_case_id: resolvedCaseId,
    p_due_date: dto.due_date,
    p_tax_amount: dto.tax_amount || 0,
    p_discount_amount: dto.discount_amount || 0,
    p_notes: dto.notes || null,
    p_items: dto.items.map((item) => ({
      description: item.description.trim(),
      quantity: item.quantity,
      unit_price: item.unit_price,
    })),
  });

  return (await getInvoiceById(created.id)) as Invoice;
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

  // NOTE: invoice paid_amount/status and the payment account balance are
  // maintained by the DB trigger `handle_payment_applied` (single source of
  // truth). Do NOT update them here — doing so applies the same money twice.

  // Record Financial Ledger entry
  if (targetAccountId && isUuid(targetAccountId)) {
    // Re-read the balance AFTER the payment insert so `balance_after`
    // reflects the trigger-applied credit.
    const { data: acc } = await supabase
      .from("payment_accounts")
      .select("current_balance")
      .eq("id", targetAccountId)
      .maybeSingle();

    if (acc) {
      const balanceAfter = Number(acc.current_balance || 0);

      const txNum = `TX-REC-${Date.now().toString().slice(-6)}`;
      const { error: ledgerError } = await supabase.from("financial_ledger").insert({
        transaction_number: txNum,
        entry_type: "credit",
        account_id: targetAccountId,
        amount: data.amount,
        balance_after: balanceAfter,
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
