import { getAdminDatabaseClient } from "@/lib/supabase/service";
import type { TaxCaseRecord } from "@/types/office";

const isUuid = (str: any): boolean =>
  typeof str === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str);

export interface CreateTaxCaseDTO {
  case_number?: string;
  client_id: string;
  tax_year: string;
  return_type?: string;
  fee?: number;
  assigned_to?: string | null;
  due_date?: string | null;
  filing_date?: string | null;
  cpr_number?: string | null;
  status?: string;
  documents?: unknown;
  notes?: string | null;
}

export async function listTaxCases(filter?: {
  status?: string;
  taxYear?: string;
  clientId?: string;
  search?: string;
}): Promise<TaxCaseRecord[]> {
  const supabase = await getAdminDatabaseClient();
  let query = supabase
    .from("tax_cases")
    .select(`
      *,
      client:clients(full_name),
      staff:profiles(full_name)
    `)
    .order("created_at", { ascending: false });

  if (filter?.status && filter.status !== "ALL") {
    query = query.eq("status", filter.status);
  }

  if (filter?.taxYear && filter.taxYear !== "ALL") {
    query = query.eq("tax_year", filter.taxYear);
  }

  if (filter?.clientId && isUuid(filter.clientId)) {
    query = query.eq("client_id", filter.clientId);
  }

  if (filter?.search && filter.search.trim()) {
    const term = `%${filter.search.trim()}%`;
    query = query.or(`case_number.ilike.${term},notes.ilike.${term},cpr_number.ilike.${term}`);
  }

  const { data, error } = await query;
  if (error) {
    console.error("[TaxService] listTaxCases error:", error);
    throw new Error(`Failed to load tax cases: ${error.message}`);
  }

  return (data || []).map((row: any) => ({
    ...row,
    client_name: row.client?.full_name,
    assigned_staff_name: row.staff?.full_name,
  })) as TaxCaseRecord[];
}

export async function getTaxCaseById(id: string): Promise<TaxCaseRecord | null> {
  if (!isUuid(id)) return null;
  const supabase = await getAdminDatabaseClient();
  const { data, error } = await supabase
    .from("tax_cases")
    .select(`
      *,
      client:clients(full_name),
      staff:profiles(full_name)
    `)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("[TaxService] getTaxCaseById error:", error);
    throw new Error(`Failed to load tax case: ${error.message}`);
  }

  if (!data) return null;

  return {
    ...data,
    client_name: (data as any).client?.full_name,
    assigned_staff_name: (data as any).staff?.full_name,
  } as TaxCaseRecord;
}

export async function createTaxCaseRecord(dto: CreateTaxCaseDTO): Promise<TaxCaseRecord> {
  const supabase = await getAdminDatabaseClient();
  const caseNumber = dto.case_number || `TX-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

  let resolvedClientId: string | undefined = dto.client_id;
  if (!isUuid(resolvedClientId)) {
    const { data: cl } = await supabase.from("clients").select("id").limit(1).maybeSingle();
    resolvedClientId = cl?.id;
  }

  if (!resolvedClientId || !isUuid(resolvedClientId)) {
    throw new Error("A valid Client is required to create a tax case.");
  }

  const resolvedAssignedTo = dto.assigned_to && isUuid(dto.assigned_to) ? dto.assigned_to : null;

  const { data, error } = await supabase
    .from("tax_cases")
    .insert({
      case_number: caseNumber,
      client_id: resolvedClientId,
      tax_year: dto.tax_year || "2024",
      return_type: dto.return_type || "Income Tax Return",
      fee: dto.fee || 0,
      assigned_to: resolvedAssignedTo,
      due_date: dto.due_date || null,
      filing_date: dto.filing_date || null,
      cpr_number: dto.cpr_number || null,
      status: dto.status || "In Progress",
      documents: (dto.documents as any) || [],
      notes: dto.notes || null,
    })
    .select(`
      *,
      client:clients(full_name),
      staff:profiles(full_name)
    `)
    .single();

  if (error) {
    console.error("[TaxService] createTaxCaseRecord error:", error);
    throw new Error(`Failed to create tax case: ${error.message}`);
  }

  return {
    ...data,
    client_name: (data as any).client?.full_name,
    assigned_staff_name: (data as any).staff?.full_name,
  } as TaxCaseRecord;
}

export async function updateTaxCaseRecord(id: string, updates: Partial<CreateTaxCaseDTO>): Promise<TaxCaseRecord | null> {
  if (!isUuid(id)) return null;
  const supabase = await getAdminDatabaseClient();

  const sanitizedUpdates: any = {
    ...updates,
    updated_at: new Date().toISOString(),
  };

  if ("client_id" in sanitizedUpdates && !isUuid(sanitizedUpdates.client_id)) {
    delete sanitizedUpdates.client_id;
  }
  if ("assigned_to" in sanitizedUpdates && !isUuid(sanitizedUpdates.assigned_to)) {
    sanitizedUpdates.assigned_to = null;
  }

  const { data, error } = await supabase
    .from("tax_cases")
    .update(sanitizedUpdates)
    .eq("id", id)
    .select(`
      *,
      client:clients(full_name),
      staff:profiles(full_name)
    `)
    .single();

  if (error) {
    console.error("[TaxService] updateTaxCaseRecord error:", error);
    throw new Error(`Failed to update tax case: ${error.message}`);
  }

  return {
    ...data,
    client_name: (data as any).client?.full_name,
    assigned_staff_name: (data as any).staff?.full_name,
  } as TaxCaseRecord;
}

export async function deleteTaxCaseRecord(id: string): Promise<void> {
  if (!isUuid(id)) return;
  const supabase = await getAdminDatabaseClient();
  const { error } = await supabase.from("tax_cases").delete().eq("id", id);
  if (error) {
    throw new Error(`Failed to delete tax case: ${error.message}`);
  }
}
