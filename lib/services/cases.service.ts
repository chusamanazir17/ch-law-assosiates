import { getAdminDatabaseClient } from "@/lib/supabase/service";
import type { LegalCase } from "@/types/office";

const isUuid = (str: any): boolean =>
  typeof str === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str);

export interface CreateCaseDTO {
  case_number: string;
  title: string;
  court_name?: string;
  judge_name?: string | null;
  case_type?: string;
  case_category?: string | null;
  stage?: string;
  status?: LegalCase["status"];
  filing_date?: string;
  description?: string | null;
  client_id?: string;
  client_role?: string;
  lawyer_id?: string;
}

export async function listCases(filter?: { status?: string; lawyerId?: string; clientId?: string; search?: string }): Promise<LegalCase[]> {
  const supabase = await getAdminDatabaseClient();
  let query = supabase
    .from("cases")
    .select(`
      *,
      clients:case_clients(client:clients(*)),
      lawyers:case_lawyers(lawyer:profiles(*))
    `)
    .order("filing_date", { ascending: false });

  if (filter?.status && filter.status !== "ALL") {
    query = query.eq("status", filter.status as any);
  }

  if (filter?.clientId && isUuid(filter.clientId)) {
    query = query.eq("case_clients.client_id", filter.clientId);
  }

  if (filter?.search && filter.search.trim()) {
    const term = `%${filter.search.trim()}%`;
    query = query.or(`case_number.ilike.${term},title.ilike.${term},court_name.ilike.${term}`);
  }

  const { data, error } = await query;

  if (error) {
    console.error("[CasesService] listCases error:", error);
    throw new Error(`Failed to load cases: ${error.message}`);
  }

  // Format nested relations
  return (data || []).map((row: any) => ({
    ...row,
    clients: row.clients?.map((c: any) => c.client).filter(Boolean) || [],
    lawyers: row.lawyers?.map((l: any) => l.lawyer).filter(Boolean) || [],
  })) as LegalCase[];
}

export async function getCaseById(id: string): Promise<LegalCase | null> {
  if (!isUuid(id)) return null;
  const supabase = await getAdminDatabaseClient();
  const { data, error } = await supabase
    .from("cases")
    .select(`
      *,
      clients:case_clients(client:clients(*)),
      lawyers:case_lawyers(lawyer:profiles(*))
    `)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("[CasesService] getCaseById error:", error);
    throw new Error(`Failed to load case: ${error.message}`);
  }

  if (!data) return null;

  const row = data as any;
  return {
    ...row,
    clients: row.clients?.map((c: any) => c.client).filter(Boolean) || [],
    lawyers: row.lawyers?.map((l: any) => l.lawyer).filter(Boolean) || [],
  } as LegalCase;
}

export async function createCaseRecord(dto: CreateCaseDTO): Promise<LegalCase> {
  const supabase = await getAdminDatabaseClient();
  const now = new Date().toISOString();

  const { data: newCase, error: caseErr } = await supabase
    .from("cases")
    .insert({
      case_number: dto.case_number.trim(),
      title: dto.title.trim(),
      court_name: dto.court_name || "District Court Sahiwal",
      judge_name: dto.judge_name ? dto.judge_name.trim() : null,
      case_type: dto.case_type || "Civil",
      case_category: dto.case_category || null,
      stage: dto.stage || "filing",
      status: dto.status || "active",
      filing_date: dto.filing_date || now.split("T")[0],
      description: dto.description || null,
    })
    .select()
    .single();

  if (caseErr) {
    console.error("[CasesService] createCaseRecord error:", caseErr);
    throw new Error(`Failed to create case: ${caseErr.message}`);
  }

  // Link client if provided and is valid UUID
  let resolvedClientId = dto.client_id;
  if (resolvedClientId && !isUuid(resolvedClientId)) {
    const { data: cl } = await supabase.from("clients").select("id").limit(1).maybeSingle();
    resolvedClientId = cl?.id;
  }

  if (resolvedClientId && isUuid(resolvedClientId)) {
    const { error: caseClientError } = await supabase.from("case_clients").insert({
      case_id: newCase.id,
      client_id: resolvedClientId,
      client_role: dto.client_role || "petitioner",
    });
    if (caseClientError) {
      console.warn("[CasesService] case_clients insert warning:", caseClientError.message);
    }
  }

  // Link lawyer if provided and is valid UUID
  if (dto.lawyer_id && isUuid(dto.lawyer_id)) {
    const { error: caseLawyerError } = await supabase.from("case_lawyers").insert({
      case_id: newCase.id,
      lawyer_id: dto.lawyer_id,
      role: "lead",
    });
    if (caseLawyerError) {
      console.warn("[CasesService] case_lawyers insert warning:", caseLawyerError.message);
    }
  }

  return newCase as LegalCase;
}

export async function updateCaseRecord(id: string, updates: Partial<CreateCaseDTO>): Promise<LegalCase | null> {
  if (!isUuid(id)) return null;
  const supabase = await getAdminDatabaseClient();
  const { client_id, lawyer_id, client_role, ...caseFields } = updates;

  const { data, error } = await supabase
    .from("cases")
    .update({
      ...caseFields,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("[CasesService] updateCaseRecord error:", error);
    throw new Error(`Failed to update case: ${error.message}`);
  }

  if (client_id && isUuid(client_id)) {
    await assignClientToCase(id, client_id, client_role || "petitioner");
  }

  if (lawyer_id && isUuid(lawyer_id)) {
    await assignLawyerToCase(id, lawyer_id, "lead");
  }

  return data as LegalCase;
}

export async function assignLawyerToCase(caseId: string, lawyerId: string, role = "lead"): Promise<void> {
  if (!isUuid(caseId) || !isUuid(lawyerId)) return;
  const supabase = await getAdminDatabaseClient();
  const { error } = await supabase
    .from("case_lawyers")
    .upsert({
      case_id: caseId,
      lawyer_id: lawyerId,
      role,
      assigned_at: new Date().toISOString(),
    }, { onConflict: "case_id,lawyer_id" });

  if (error) {
    throw new Error(`Failed to assign lawyer: ${error.message}`);
  }
}

export async function assignClientToCase(caseId: string, clientId: string, clientRole = "petitioner"): Promise<void> {
  if (!isUuid(caseId) || !isUuid(clientId)) return;
  const supabase = await getAdminDatabaseClient();
  const { error } = await supabase
    .from("case_clients")
    .upsert({
      case_id: caseId,
      client_id: clientId,
      client_role: clientRole,
    }, { onConflict: "case_id,client_id" });

  if (error) {
    throw new Error(`Failed to assign client to case: ${error.message}`);
  }
}
