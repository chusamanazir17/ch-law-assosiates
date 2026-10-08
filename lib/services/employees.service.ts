import { getAdminDatabaseClient } from "@/lib/supabase/service";
import { pkTodayIso } from "@/lib/dates/pkDay";
import type { Profile, AttendanceRecord } from "@/types/office";

const isUuid = (val?: string | null): val is string =>
  typeof val === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);

/**
 * Staff directory listing.
 * FIN-07: full PII (email/phone) is only returned when `fullPII` is true
 * (super_admin / office_admin). Everyone else gets a directory-safe subset.
 */
export async function listEmployees(opts?: { fullPII?: boolean }): Promise<Profile[]> {
  const supabase = await getAdminDatabaseClient();
  const columns = opts?.fullPII
    ? "*"
    : "id, full_name, role, designation, department, status, avatar_url, created_at, updated_at";
  const { data, error } = await supabase
    .from("profiles")
    .select(columns)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("[EmployeesService] listEmployees error:", error);
    throw new Error(`Failed to load staff list: ${error.message}`);
  }

  return (data || []) as unknown as Profile[];
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

export async function updateEmployee(
  id: string,
  updates: Partial<Profile>,
  opts?: { allowPrivilegedFields?: boolean }
): Promise<Profile> {
  const supabase = await getAdminDatabaseClient();
  // Privilege guard: `role` and `status` are never taken from an untrusted
  // update body. A caller must explicitly opt in (super_admin only) to change
  // them, otherwise they are stripped here as defense in depth.
  const { role: _role, status: _status, ...safeUpdates } = updates;
  const payload = opts?.allowPrivilegedFields ? updates : safeUpdates;
  const { data, error } = await supabase
    .from("profiles")
    .update({
      ...payload,
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
  const targetDate = date || pkTodayIso(); // attendance.date is a PK-calendar date

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
  const targetDate = data.date || pkTodayIso(); // attendance.date is a PK-calendar date

  // H4 / FIN-16: an invalid employee_id must fail loudly — never record
  // attendance against a random employee.
  if (!isUuid(data.employee_id)) {
    throw new Error(
      `Invalid employee_id '${data.employee_id}'. Attendance must reference a valid staff profile.`
    );
  }
  const resolvedEmpId = data.employee_id;

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


