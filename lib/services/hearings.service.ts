import { getAdminDatabaseClient } from "@/lib/supabase/service";
import { pkTodayIso } from "@/lib/dates/pkDay";
import type { Hearing } from "@/types/office";

const isUuid = (str: any): boolean =>
  typeof str === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str);

export interface CreateHearingDTO {
  case_id: string;
  hearing_date: string;
  court_room?: string | null;
  judge_name?: string | null;
  purpose: string;
  proceedings_summary?: string | null;
  next_hearing_date?: string | null;
  next_purpose?: string | null;
  status?: Hearing["status"];
}

export async function listHearings(filter?: { caseId?: string; upcomingOnly?: boolean; date?: string }): Promise<Hearing[]> {
  const supabase = await getAdminDatabaseClient();
  let query = supabase
    .from("hearings")
    .select(`
      *,
      case:cases(case_number, title)
    `)
    .is("deleted_at", null)
    .order("hearing_date", { ascending: true });

  if (filter?.caseId && isUuid(filter.caseId)) {
    query = query.eq("case_id", filter.caseId);
  }

  if (filter?.date) {
    query = query.eq("hearing_date", filter.date);
  }

  if (filter?.upcomingOnly) {
    const today = pkTodayIso(); // hearing_date is a PK-calendar date
    query = query.gte("hearing_date", today);
  }

  const { data, error } = await query;
  if (error) {
    console.error("[HearingsService] listHearings error:", error);
    throw new Error(`Failed to load hearings: ${error.message}`);
  }

  return (data || []).map((row: any) => ({
    ...row,
    case_number: row.case?.case_number,
    case_title: row.case?.title,
  })) as Hearing[];
}

export async function createHearingRecord(dto: CreateHearingDTO): Promise<Hearing> {
  const supabase = await getAdminDatabaseClient();

  let resolvedCaseId = dto.case_id;
  if (!isUuid(resolvedCaseId)) {
    // Attempt lookup by case_number only — never fall back to an arbitrary case.
    const { data: matchedCase } = await supabase
      .from("cases")
      .select("id")
      .eq("case_number", resolvedCaseId)
      .is("deleted_at", null)
      .limit(1)
      .maybeSingle();

    if (matchedCase?.id) {
      resolvedCaseId = matchedCase.id;
    }
  }

  // H4: an unresolvable case reference must fail loudly, never attach the
  // hearing to a random case.
  if (!resolvedCaseId || !isUuid(resolvedCaseId)) {
    throw new Error("A valid case_id or case_number is required to record a hearing.");
  }

  const { data, error } = await supabase
    .from("hearings")
    .insert({
      case_id: resolvedCaseId,
      hearing_date: dto.hearing_date,
      court_room: dto.court_room || null,
      judge_name: dto.judge_name || null,
      purpose: dto.purpose.trim(),
      proceedings_summary: dto.proceedings_summary || null,
      next_hearing_date: dto.next_hearing_date || null,
      next_purpose: dto.next_purpose || null,
      status: dto.status || "scheduled",
    })
    .select(`
      *,
      case:cases(case_number, title)
    `)
    .single();

  if (error) {
    console.error("[HearingsService] createHearingRecord error:", error);
    throw new Error(`Failed to record hearing: ${error.message}`);
  }

  return {
    ...data,
    case_number: data.case?.case_number,
    case_title: data.case?.title,
  } as Hearing;
}

export async function updateHearingRecord(
  id: string,
  updates: Partial<CreateHearingDTO>,
  opts?: { allowedFields?: readonly string[] }
): Promise<Hearing | null> {
  if (!isUuid(id)) return null;
  const supabase = await getAdminDatabaseClient();

  // Mass-assignment guard (API-1): only explicitly allowed fields reach the
  // DB. case_id moves are never allowed through the generic update path.
  const allowed = new Set(opts?.allowedFields || []);
  const { case_id: _caseId, ...rest } = updates as Record<string, unknown>;
  const fields: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(rest)) {
    if (allowed.size === 0 || allowed.has(key)) fields[key] = value;
  }

  const { data, error } = await supabase
    .from("hearings")
    .update({
      ...fields,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .is("deleted_at", null)
    .select(`
      *,
      case:cases(case_number, title)
    `)
    .maybeSingle();

  if (error) {
    console.error("[HearingsService] updateHearingRecord error:", error);
    throw new Error(`Failed to update hearing: ${error.message}`);
  }

  if (!data) return null;

  return {
    ...data,
    case_number: data.case?.case_number,
    case_title: data.case?.title,
  } as Hearing;
}

export async function deleteHearingRecord(id: string): Promise<void> {
  if (!isUuid(id)) return;
  const supabase = await getAdminDatabaseClient();
  // Soft delete: hidden from lists, retained for history.
  const { error } = await supabase
    .from("hearings")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id)
    .is("deleted_at", null);
  if (error) throw new Error(`Failed to delete hearing: ${error.message}`);
}
