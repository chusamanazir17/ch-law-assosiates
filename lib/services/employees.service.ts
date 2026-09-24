import { createClient } from "@/lib/supabase/server";
import type { Profile, AttendanceRecord } from "@/types/office";

export async function listEmployees(): Promise<Profile[]> {
  const supabase = await createClient();
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
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(`Failed to load employee: ${error.message}`);
  return (data as Profile) || null;
}

export async function updateEmployee(id: string, updates: Partial<Profile>): Promise<Profile> {
  const supabase = await createClient();
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

export async function listAttendance(date?: string): Promise<AttendanceRecord[]> {
  const supabase = await createClient();
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
  const supabase = await createClient();
  const targetDate = data.date || new Date().toISOString().split("T")[0];

  const { data: record, error } = await supabase
    .from("attendance")
    .upsert({
      employee_id: data.employee_id,
      date: targetDate,
      status: data.status,
      check_in_time: data.check_in_time || null,
      check_out_time: data.check_out_time || null,
      notes: data.notes || null,
    }, { onConflict: "employee_id,date" })
    .select()
    .single();

  if (error) {
    console.error("[EmployeesService] recordAttendance error:", error);
    throw new Error(`Failed to record attendance: ${error.message}`);
  }

  return record as AttendanceRecord;
}
