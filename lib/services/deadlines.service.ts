import { getAdminDatabaseClient } from "@/lib/supabase/service";
import type { TaxDeadline } from "@/types/reminders";

export interface DeadlineWithCategory extends TaxDeadline {
  category?: { id: string; name: string; slug: string };
}

export interface DeadlineInput {
  category_id: string;
  tax_year_or_period: string;
  title: string;
  filing_deadline: string;
  official_source_url?: string | null;
  is_active: boolean;
}

/**
 * Server-side CRUD for tax deadlines (`tax_deadlines`). Runs with the
 * service-role client when available so admin API routes can manage rows
 * regardless of the admin session type.
 */
export async function listTaxCategories() {
  const supabase = await getAdminDatabaseClient();
  const { data, error } = await supabase
    .from("tax_categories")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function listDeadlines(): Promise<DeadlineWithCategory[]> {
  const supabase = await getAdminDatabaseClient();
  const { data, error } = await supabase
    .from("tax_deadlines")
    .select(
      `
      id,
      category_id,
      tax_year_or_period,
      title,
      filing_deadline,
      official_source_url,
      verified_at,
      verified_by,
      is_active,
      revision,
      created_at,
      updated_at,
      tax_categories ( id, name, slug )
    `
    )
    .order("filing_deadline", { ascending: true });

  if (error) throw new Error(error.message);

  return ((data ?? []) as any[]).map((deadline) => ({
    ...deadline,
    category: deadline.tax_categories ?? undefined,
  }));
}

export async function createDeadline(input: DeadlineInput) {
  const supabase = await getAdminDatabaseClient();
  const { error } = await supabase.from("tax_deadlines").insert({
    category_id: input.category_id,
    tax_year_or_period: input.tax_year_or_period.trim(),
    title: input.title.trim(),
    filing_deadline: input.filing_deadline,
    official_source_url: input.official_source_url?.trim() || null,
    is_active: input.is_active,
    revision: 1,
  });

  if (error) throw new Error(error.message);
}

export async function updateDeadline(id: string, input: DeadlineInput) {
  const supabase = await getAdminDatabaseClient();
  const { error } = await supabase
    .from("tax_deadlines")
    .update({
      category_id: input.category_id,
      tax_year_or_period: input.tax_year_or_period.trim(),
      title: input.title.trim(),
      filing_deadline: input.filing_deadline,
      official_source_url: input.official_source_url?.trim() || null,
      is_active: input.is_active,
    })
    .eq("id", id);

  if (error) throw new Error(error.message);
}

/**
 * Toggle verification. `verifiedBy` must be a real Supabase auth user UUID
 * (FK into auth.users) or null for credential-based admin sessions.
 */
export async function setDeadlineVerification(id: string, verified: boolean, verifiedBy: string | null) {
  const supabase = await getAdminDatabaseClient();
  const { error } = await supabase
    .from("tax_deadlines")
    .update({
      verified_at: verified ? new Date().toISOString() : null,
      verified_by: verified ? verifiedBy : null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) throw new Error(error.message);
}

export async function setDeadlineActive(id: string, isActive: boolean) {
  const supabase = await getAdminDatabaseClient();
  const { error } = await supabase
    .from("tax_deadlines")
    .update({
      is_active: isActive,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) throw new Error(error.message);
}
