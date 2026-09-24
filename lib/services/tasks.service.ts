import { getAdminDatabaseClient } from "@/lib/supabase/service";
import type { OfficeTask } from "@/types/office";

const isUuid = (str: any): boolean =>
  typeof str === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str);

export interface CreateTaskDTO {
  title: string;
  description?: string | null;
  assigned_to?: string | null;
  case_id?: string | null;
  client_id?: string | null;
  due_date: string;
  priority?: OfficeTask["priority"];
  status?: OfficeTask["status"];
}

export async function listTasks(filter?: { status?: string; assignedTo?: string }): Promise<OfficeTask[]> {
  const supabase = await getAdminDatabaseClient();
  let query = supabase
    .from("tasks")
    .select(`
      *,
      assigned:profiles(full_name),
      case:cases(case_number),
      client:clients(full_name)
    `)
    .order("due_date", { ascending: true });

  if (filter?.status && filter.status !== "ALL") {
    query = query.eq("status", filter.status as any);
  }

  if (filter?.assignedTo && isUuid(filter.assignedTo)) {
    query = query.eq("assigned_to", filter.assignedTo);
  }

  const { data, error } = await query;
  if (error) {
    console.error("[TasksService] listTasks error:", error);
    throw new Error(`Failed to load tasks: ${error.message}`);
  }

  return (data || []).map((row: any) => ({
    ...row,
    assigned_to_name: row.assigned?.full_name,
    case_number: row.case?.case_number,
    client_name: row.client?.full_name,
  })) as OfficeTask[];
}

export async function createTaskRecord(dto: CreateTaskDTO): Promise<OfficeTask> {
  const supabase = await getAdminDatabaseClient();

  const sanitizedAssignedTo = dto.assigned_to && isUuid(dto.assigned_to) ? dto.assigned_to : null;
  const sanitizedCaseId = dto.case_id && isUuid(dto.case_id) ? dto.case_id : null;
  const sanitizedClientId = dto.client_id && isUuid(dto.client_id) ? dto.client_id : null;

  const { data, error } = await supabase
    .from("tasks")
    .insert({
      title: dto.title.trim(),
      description: dto.description || null,
      assigned_to: sanitizedAssignedTo,
      case_id: sanitizedCaseId,
      client_id: sanitizedClientId,
      due_date: dto.due_date,
      priority: dto.priority || "medium",
      status: dto.status || "pending",
    })
    .select()
    .single();

  if (error) {
    console.error("[TasksService] createTaskRecord error:", error);
    throw new Error(`Failed to create task: ${error.message}`);
  }

  return data as OfficeTask;
}

export async function updateTaskStatus(id: string, status: OfficeTask["status"]): Promise<void> {
  if (!isUuid(id)) return;
  const supabase = await getAdminDatabaseClient();
  const { error } = await supabase
    .from("tasks")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) throw new Error(`Failed to update task: ${error.message}`);
}

export async function deleteTaskRecord(id: string): Promise<void> {
  if (!isUuid(id)) return;
  const supabase = await getAdminDatabaseClient();
  const { error } = await supabase.from("tasks").delete().eq("id", id);
  if (error) throw new Error(`Failed to delete task: ${error.message}`);
}
