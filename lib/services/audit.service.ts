import { getAdminDatabaseClient } from "@/lib/supabase/service";
import type { AuditLog } from "@/types/office";

const isUuid = (str: any): boolean =>
  typeof str === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str);

export interface RecordAuditLogDTO {
  user_id?: string | null;
  user_name?: string | null;
  user_role?: string | null;
  action: string;
  entity_type: string;
  entity_id?: string | null;
  details?: Record<string, unknown> | null;
  ip_address?: string | null;
}

export async function listAuditLogs(filter?: {
  entityType?: string;
  limit?: number;
}): Promise<AuditLog[]> {
  const supabase = await getAdminDatabaseClient();
  let query = supabase
    .from("audit_logs")
    .select("*")
    .order("created_at", { ascending: false });

  if (filter?.entityType && filter.entityType !== "ALL") {
    query = query.eq("entity_type", filter.entityType);
  }

  if (filter?.limit) {
    query = query.limit(filter.limit);
  } else {
    query = query.limit(100);
  }

  const { data, error } = await query;
  if (error) {
    console.error("[AuditService] listAuditLogs error:", error);
    throw new Error(`Failed to load audit logs: ${error.message}`);
  }

  return (data || []) as AuditLog[];
}

export async function recordAuditLog(dto: RecordAuditLogDTO): Promise<void> {
  try {
    const supabase = await getAdminDatabaseClient();
    const sanitizedUserId = dto.user_id && isUuid(dto.user_id) ? dto.user_id : null;

    await supabase.from("audit_logs").insert({
      user_id: sanitizedUserId,
      user_name: dto.user_name || null,
      user_role: dto.user_role || null,
      action: dto.action,
      entity_type: dto.entity_type,
      entity_id: dto.entity_id || null,
      details: (dto.details as any) || {},
      ip_address: dto.ip_address || null,
    });
  } catch (err) {
    console.error("[AuditService] recordAuditLog failed:", err);
  }
}
