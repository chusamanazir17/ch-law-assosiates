import { getSupabasePublicConfig } from "@/config/env";
import { createServiceClient } from "@/lib/supabase/service";
import type { SubscriberWithCategories, TaxCategory } from "@/types/reminders";

/**
 * Server-side store for reminder subscribers, persisted in Supabase
 * (`subscribers` + `subscriber_categories`). Writes use the service-role
 * client because subscriber rows are managed by the confirmation RPCs and
 * admin sessions may be env-credential based (no Supabase JWT).
 */

export async function getAllSubscribers(): Promise<SubscriberWithCategories[]> {
  const config = getSupabasePublicConfig();
  if (!config) {
    console.error("[SubscribersStore] Supabase is not configured; cannot list subscribers.");
    return [];
  }

  try {
    const client = createServiceClient();
    const { data: dbSubs, error } = await client
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

    if (error) throw error;

    return (dbSubs ?? []).map((sub: any) => ({
      id: sub.id,
      name: sub.name,
      email: sub.email,
      status: sub.status,
      consent_at: sub.consent_at,
      consent_text_version: sub.consent_text_version,
      confirmed_at: sub.confirmed_at,
      created_at: sub.created_at,
      updated_at: sub.updated_at,
      categories: (sub.subscriber_categories || [])
        .map((sc: any) => sc.tax_categories)
        .filter(Boolean),
    }));
  } catch (err) {
    console.error("[SubscribersStore] Failed to list subscribers:", err);
    return [];
  }
}

export async function addOrUpdateSubscriber(payload: {
  name: string;
  email: string;
  categoryIds: string[];
  consent?: boolean;
}): Promise<SubscriberWithCategories> {
  const config = getSupabasePublicConfig();
  if (!config) {
    throw new Error("Supabase is not configured: cannot save subscription.");
  }

  const client = createServiceClient();
  const normalizedEmail = payload.email.trim().toLowerCase();
  const now = new Date().toISOString();

  // Upsert the subscriber (unique on email)
  const { data: dbSub, error: upsertError } = await client
    .from("subscribers")
    .upsert(
      {
        name: payload.name.trim() || normalizedEmail.split("@")[0],
        email: normalizedEmail,
        status: "active",
        consent_at: now,
        consent_text_version: "v1.0",
        confirmed_at: now,
        updated_at: now,
      },
      { onConflict: "email" }
    )
    .select("id, name, email, status, consent_at, consent_text_version, confirmed_at, created_at, updated_at")
    .single();

  if (upsertError) {
    console.error("[SubscribersStore] Failed to save subscriber:", upsertError.message);
    throw new Error(`Failed to save subscription: ${upsertError.message}`);
  }

  // Replace category selections (only valid category rows will match)
  if (payload.categoryIds.length > 0) {
    const { error: deleteError } = await client
      .from("subscriber_categories")
      .delete()
      .eq("subscriber_id", dbSub.id);
    if (deleteError) {
      console.error("[SubscribersStore] Failed to clear subscriber categories:", deleteError.message);
    }

    const rows = payload.categoryIds.map((catId) => ({
      subscriber_id: dbSub.id,
      category_id: catId,
    }));
    const { error: catError } = await client
      .from("subscriber_categories")
      .upsert(rows, { onConflict: "subscriber_id,category_id" });
    if (catError) {
      console.error("[SubscribersStore] Failed to link subscriber categories:", catError.message);
    }
  }

  const categories = await resolveCategoriesByIds(payload.categoryIds);

  return {
    id: dbSub.id,
    name: dbSub.name,
    email: dbSub.email,
    status: dbSub.status,
    consent_at: dbSub.consent_at,
    consent_text_version: dbSub.consent_text_version,
    confirmed_at: dbSub.confirmed_at,
    created_at: dbSub.created_at,
    updated_at: dbSub.updated_at,
    categories,
  };
}

export async function updateSubscriberStatus(
  id: string,
  status: "active" | "pending" | "unsubscribed" | "suppressed"
): Promise<boolean> {
  const config = getSupabasePublicConfig();
  if (!config) {
    throw new Error("Supabase is not configured: cannot update subscription.");
  }

  const client = createServiceClient();
  const { error } = await client
    .from("subscribers")
    .update({ status, updated_at: new Date().toISOString() })
    .or(`id.eq.${id},email.eq.${id}`);

  if (error) {
    console.error("[SubscribersStore] Failed to update subscriber status:", error.message);
    return false;
  }
  return true;
}

/**
 * Resolve display names for tax categories from the database, falling back to
 * a title-cased id so confirmation emails never show a raw UUID.
 */
export async function getCategoryNamesByIds(ids: string[]): Promise<string[]> {
  if (ids.length === 0) return [];

  const categories = await resolveCategoriesByIds(ids);
  return categories.map((category) => category.name);
}

async function resolveCategoriesByIds(ids: string[]): Promise<TaxCategory[]> {
  if (ids.length === 0) return [];

  const config = getSupabasePublicConfig();
  if (!config) return [];

  const client = createServiceClient();
  const { data, error } = await client
    .from("tax_categories")
    .select("*")
    .in("id", ids);

  if (error || !data) {
    return ids.map(fallbackCategory);
  }

  const found = new Map<string, TaxCategory>(data.map((c) => [c.id, c as TaxCategory]));
  return ids.map((id) => found.get(id) ?? fallbackCategory(id));
}

function fallbackCategory(id: string): TaxCategory {
  return {
    id,
    name: id.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    slug: id,
    description: "Tax & Compliance Reminders",
    is_active: true,
    sort_order: 99,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}
