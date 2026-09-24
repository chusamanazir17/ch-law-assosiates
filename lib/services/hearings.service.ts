import { createClient } from "@/lib/supabase/server";
import type { Hearing } from "@/types/office";

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

export async function listHearings(filter?: { caseId?: string; upcomingOnly?: boolean }): Promise<Hearing[]> {
  const supabase = await createClient();
  let query = supabase
    .from("hearings")
    .select(`
      *,
      case:cases(case_number, title)
    `)
    .order("hearing_date", { ascending: true });

  if (filter?.caseId) {
    query = query.eq("case_id", filter.caseId);
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
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("hearings")
    .insert({
      case_id: dto.case_id,
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

export async function updateHearingRecord(id: string, updates: Partial<CreateHearingDTO>): Promise<Hearing> {
  const supabase = await createClient();
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
  const supabase = await createClient();
  const { error } = await supabase.from("hearings").delete().eq("id", id);
  if (error) throw new Error(`Failed to delete hearing: ${error.message}`);
}
