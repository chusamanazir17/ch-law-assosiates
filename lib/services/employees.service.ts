import { getAdminDatabaseClient } from "@/lib/supabase/service";
import type { Profile, AttendanceRecord } from "@/types/office";

const isUuid = (val?: string | null): val is string =>
  typeof val === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);

export async function listEmployees(): Promise<Profile[]> {
  const supabase = await getAdminDatabaseClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("[EmployeesService] listEmployees error:", error);
    throw new Error(`Failed to load staff list: ${error.message}`);
  }

  return (data || []) as Profile[];
}

export async function getEmployeeById(id: string): Promise<Profile | null> {
  const supabase = await getAdminDatabaseClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(`Failed to load employee: ${error.message}`);
  return (data as Profile) || null;
}

export async function updateEmployee(id: string, updates: Partial<Profile>): Promise<Profile> {
  const supabase = await getAdminDatabaseClient();
  const { data, error } = await supabase
    .from("profiles")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(`Failed to update employee: ${error.message}`);
  return data as Profile;
}

function formatToIsoTimestamp(dateStr: string, timeStr?: string | null): string | null {
  if (!timeStr || !timeStr.trim()) return null;
  const trimmed = timeStr.trim();
  if (trimmed.includes("T")) return trimmed;
  const parts = trimmed.split(":");
  const hours = parts[0].padStart(2, "0");
  const minutes = (parts[1] || "00").padStart(2, "0");
  const seconds = (parts[2] || "00").padStart(2, "0");
  return `${dateStr}T${hours}:${minutes}:${seconds}Z`;
}

function formatFromTimestamp(val?: string | null): string | null {
  if (!val) return null;
  if (!val.includes("T")) return val;
  try {
    const d = new Date(val);
    const h = d.getUTCHours().toString().padStart(2, "0");
    const m = d.getUTCMinutes().toString().padStart(2, "0");
    return `${h}:${m}`;
  } catch {
    return val;
  }
}

export async function listAttendance(date?: string): Promise<AttendanceRecord[]> {
  const supabase = await getAdminDatabaseClient();
  const targetDate = date || new Date().toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("attendance")
    .select(`
      *,
      employee:profiles(full_name)
    `)
    .eq("date", targetDate);

  if (error) {
    console.error("[EmployeesService] listAttendance error:", error);
    throw new Error(`Failed to load attendance: ${error.message}`);
  }

  return (data || []).map((row: any) => ({
    ...row,
    employee_name: row.employee?.full_name,
    check_in_time: formatFromTimestamp(row.check_in_time),
    check_out_time: formatFromTimestamp(row.check_out_time),
  })) as AttendanceRecord[];
}

export async function recordAttendance(data: {
  employee_id: string;
  date?: string;
  status: AttendanceRecord["status"];
  check_in_time?: string | null;
  check_out_time?: string | null;
  notes?: string | null;
}): Promise<AttendanceRecord> {
  const supabase = await getAdminDatabaseClient();
  const targetDate = data.date || new Date().toISOString().split("T")[0];

  let resolvedEmpId = data.employee_id;

  // If employee_id is not a valid UUID (e.g. mock ID 'emp-1'), resolve to an existing profile in profiles
  if (!isUuid(resolvedEmpId)) {
    const { data: firstProfile } = await supabase
      .from("profiles")
      .select("id")
      .limit(1)
      .maybeSingle();

    if (firstProfile) {
      resolvedEmpId = firstProfile.id;
    } else {
      throw new Error(`Cannot record attendance: Staff profile ID '${data.employee_id}' is not a valid UUID and no staff profiles exist in the database yet.`);
    }
  }

  const isoCheckIn = formatToIsoTimestamp(targetDate, data.check_in_time);
  const isoCheckOut = formatToIsoTimestamp(targetDate, data.check_out_time);

  const { data: record, error } = await supabase
    .from("attendance")
    .upsert({
      employee_id: resolvedEmpId,
      date: targetDate,
      status: data.status,
      check_in_time: isoCheckIn,
      check_out_time: isoCheckOut,
      notes: data.notes || null,
    }, { onConflict: "employee_id,date" })
    .select()
    .single();

  if (error) {
    console.error("[EmployeesService] recordAttendance error:", error);
    throw new Error(`Failed to record attendance: ${error.message}`);
  }

  return {
    ...record,
    check_in_time: formatFromTimestamp(record.check_in_time),
    check_out_time: formatFromTimestamp(record.check_out_time),
  } as AttendanceRecord;
}


