import { getAdminDatabaseClient } from "@/lib/supabase/service";
import type { ReminderDelivery } from "@/types/reminders";

export const DELIVERY_PAGE_SIZE = 20;

export interface DeliveryListResult {
  deliveries: any[];
  totalCount: number;
}

/**
 * Server-side reads/writes for the admin reminder history screen
 * (`reminder_deliveries` + verified `tax_deadlines`).
 */
export async function listReminderDeliveries(options: {
  status?: string;
  page: number;
  pageSize?: number;
}): Promise<DeliveryListResult> {
  const supabase = await getAdminDatabaseClient();
  const pageSize = options.pageSize ?? DELIVERY_PAGE_SIZE;
  const from = (options.page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("reminder_deliveries")
    .select(
      `
      id,
      subscriber_id,
      deadline_id,
      deadline_revision,
      reminder_interval,
      scheduled_date,
      status,
      provider_message_id,
      idempotency_key,
      attempt_count,
      last_attempt_at,
      sent_at,
      error_details,
      created_at,
      updated_at,
      subscribers ( name, email, status ),
      tax_deadlines (
        title,
        tax_year_or_period,
        filing_deadline,
        tax_categories ( name )
      )
    `,
      { count: "exact" }
    );

  if (options.status && options.status !== "all") {
    query = query.eq("status", options.status as NonNullable<ReminderDelivery["status"]>);
  }

  const { data, count, error } = await query
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) throw new Error(error.message);
  return { deliveries: data ?? [], totalCount: count ?? 0 };
}

export async function listVerifiedDeadlines() {
  const supabase = await getAdminDatabaseClient();
  const { data, error } = await supabase
    .from("tax_deadlines")
    .select("id, title, tax_year_or_period, filing_deadline, is_active, tax_categories(name)")
    .eq("is_active", true)
    .not("verified_at", "is", null);

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function queueDeliveryRetry(deliveryId: string) {
  const supabase = await getAdminDatabaseClient();
  const { error } = await supabase
    .from("reminder_deliveries")
    .update({
      status: "queued" as const,
      attempt_count: 0,
      error_details: "Queued for retry by administrator.",
      updated_at: new Date().toISOString(),
    })
    .eq("id", deliveryId);

  if (error) throw new Error(error.message);
}
