import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";
import type { SubscriberWithCategories } from "@/types/reminders";

type DbClient = SupabaseClient<Database>;

export async function listSubscribers(client: DbClient): Promise<SubscriberWithCategories[]> {
  const { data, error } = await client
    .from("subscribers")
    .select(`
      id,
      name,
      email,
      status,
      consent_at,
      consent_text_version,
      confirmed_at,
      created_at,
      updated_at,
      subscriber_categories (
        category_id,
        tax_categories ( id, name, slug, description, is_active, sort_order, created_at, updated_at )
      )
    `)
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Unable to load subscribers: ${error.message}`);

  return (data ?? []).map((subscriber) => ({
    id: subscriber.id,
    name: subscriber.name,
    email: subscriber.email,
    status: subscriber.status,
    consent_at: subscriber.consent_at,
    consent_text_version: subscriber.consent_text_version,
    confirmed_at: subscriber.confirmed_at,
    created_at: subscriber.created_at,
    updated_at: subscriber.updated_at,
    categories: (subscriber.subscriber_categories ?? [])
      .map((row) => row.tax_categories)
      .filter((category): category is NonNullable<typeof category> => Boolean(category)),
  }));
}

export async function setSubscriberStatus(
  client: DbClient,
  id: string,
  status: Database["public"]["Tables"]["subscribers"]["Row"]["status"]
): Promise<void> {
  const now = new Date().toISOString();
  const { error } = await client
    .from("subscribers")
    .update({ status, updated_at: now })
    .eq("id", id);

  if (error) throw new Error(`Unable to update subscriber: ${error.message}`);

  if (status !== "active") {
    const { error: deliveryError } = await client
      .from("reminder_deliveries")
      .update({
        status: "cancelled",
        error_details: `Subscriber status changed to ${status} by an administrator.`,
        updated_at: now,
      })
      .eq("subscriber_id", id)
      .in("status", ["queued", "processing"]);

    if (deliveryError) {
      throw new Error(`Subscriber status changed, but pending reminders could not be cancelled: ${deliveryError.message}`);
    }
  }
}
