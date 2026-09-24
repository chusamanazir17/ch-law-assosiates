import { createClient } from "@/lib/supabase/server";
import { createPublicClient } from "@/lib/supabase/public";
import type { Appointment } from "@/types/office";

export interface BookAppointmentDTO {
  client_id?: string | null;
  assigned_to?: string | null;
  client_name: string;
  client_phone: string;
  service_requested?: string | null;
  appointment_date: string;
  appointment_time: string;
  source?: Appointment["source"];
  notes?: string | null;
}

export async function listAppointments(filter?: { date?: string; upcomingOnly?: boolean }): Promise<Appointment[]> {
  const supabase = await createClient();
  let query = supabase
    .from("appointments")
    .select(`
      *,
      lawyer:profiles(full_name)
    `)
    .order("appointment_date", { ascending: true })
    .order("appointment_time", { ascending: true });

  if (filter?.date) {
    query = query.eq("appointment_date", filter.date);
  }

  if (filter?.upcomingOnly) {
    const today = new Date().toISOString().split("T")[0];
    query = query.gte("appointment_date", today);
  }

  const { data, error } = await query;
  if (error) {
    console.error("[AppointmentsService] listAppointments error:", error);
    throw new Error(`Failed to load appointments: ${error.message}`);
  }

  return (data || []).map((row: any) => ({
    ...row,
    assigned_lawyer_name: row.lawyer?.full_name,
  })) as Appointment[];
}

export async function bookAppointmentRecord(dto: BookAppointmentDTO): Promise<Appointment> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("appointments")
    .insert({
      client_id: dto.client_id || null,
      assigned_to: dto.assigned_to || null,
      client_name: dto.client_name.trim(),
      client_phone: dto.client_phone.trim(),
      service_requested: dto.service_requested || null,
      appointment_date: dto.appointment_date,
      appointment_time: dto.appointment_time,
      status: "scheduled",
      source: dto.source || "office_counter",
      notes: dto.notes || null,
    })
    .select()
    .single();

  if (error) {
    console.error("[AppointmentsService] bookAppointmentRecord error:", error);
    throw new Error(`Failed to schedule appointment: ${error.message}`);
  }

  return data as Appointment;
}

export async function bookPublicAppointment(dto: BookAppointmentDTO): Promise<Appointment> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("appointments")
    .insert({
      client_name: dto.client_name.trim(),
      client_phone: dto.client_phone.trim(),
      service_requested: dto.service_requested || null,
      appointment_date: dto.appointment_date,
      appointment_time: dto.appointment_time,
      status: "scheduled",
      source: "website",
      notes: dto.notes || null,
    })
    .select()
    .single();

  if (error) {
    console.error("[AppointmentsService] bookPublicAppointment error:", error);
    throw new Error(`Failed to submit appointment request: ${error.message}`);
  }

  return data as Appointment;
}

export async function updateAppointmentStatus(id: string, status: Appointment["status"]): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("appointments")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) throw new Error(`Failed to update appointment: ${error.message}`);
}
