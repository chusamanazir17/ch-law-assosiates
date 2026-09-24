import { getAdminDatabaseClient } from "@/lib/supabase/service";
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
    .order("hearing_date", { ascending: true });

  if (filter?.caseId && isUuid(filter.caseId)) {
    query = query.eq("case_id", filter.caseId);
  }

  if (filter?.date) {
    query = query.eq("hearing_date", filter.date);
  }

  if (filter?.upcomingOnly) {
    const today = new Date().toISOString().split("T")[0];
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
    // Attempt lookup by case_number or fallback to first available case
    const { data: matchedCase } = await supabase
      .from("cases")
      .select("id")
      .or(`case_number.eq.${resolvedCaseId},id.eq.${resolvedCaseId}`)
      .limit(1)
      .maybeSingle();

    if (matchedCase?.id) {
      resolvedCaseId = matchedCase.id;
    } else {
      const { data: anyCase } = await supabase.from("cases").select("id").limit(1).maybeSingle();
      if (anyCase?.id) resolvedCaseId = anyCase.id;
    }
  }

  if (!resolvedCaseId || !isUuid(resolvedCaseId)) {
    throw new Error("A valid Case is required to record a hearing.");
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

export async function updateHearingRecord(id: string, updates: Partial<CreateHearingDTO>): Promise<Hearing | null> {
  if (!isUuid(id)) return null;
  const supabase = await getAdminDatabaseClient();
  const { data, error } = await supabase
    .from("hearings")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select(`
      *,
      case:cases(case_number, title)
    `)
    .single();

  if (error) {
    console.error("[HearingsService] updateHearingRecord error:", error);
    throw new Error(`Failed to update hearing: ${error.message}`);
  }

  return {
    ...data,
    case_number: data.case?.case_number,
    case_title: data.case?.title,
  } as Hearing;
}

export async function deleteHearingRecord(id: string): Promise<void> {
  if (!isUuid(id)) return;
  const supabase = await getAdminDatabaseClient();
  const { error } = await supabase.from("hearings").delete().eq("id", id);
  if (error) throw new Error(`Failed to delete hearing: ${error.message}`);
}
