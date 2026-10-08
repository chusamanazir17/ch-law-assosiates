import {
  cmsCacheGet,
  cmsCacheSet,
  getCmsClient,
  invalidateCmsCache,
  isCmsBackendConfigured,
} from "@/lib/db/cmsClient";
import { revalidatePath } from "next/cache";
import type { Database } from "@/types/database.types";

type CmsDbClient = import("@supabase/supabase-js").SupabaseClient<Database>;

export interface CmsCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  active: boolean;
  order: number;
  seoTitle?: string;
  metaDescription?: string;
  canonicalUrl?: string;
  ogImage?: string;
  updatedAt: string;
}

const CACHE_KEY = "cms:categories";

type CategoryRow = Database["public"]["Tables"]["categories"]["Row"];

function rowToCategory(row: CategoryRow): CmsCategory {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description ?? "",
    active: row.active ?? true,
    order: row.sort_order ?? 100,
    seoTitle: row.seo_title ?? "",
    metaDescription: row.meta_description ?? "",
    canonicalUrl: row.canonical_url ?? "",
    ogImage: row.og_image ?? "",
    updatedAt: row.updated_at,
  };
}

function categoryToRow(category: CmsCategory) {
  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description ?? "",
    active: category.active ?? true,
    sort_order: category.order ?? 100,
    seo_title: category.seoTitle?.trim() ? category.seoTitle.trim() : null,
    meta_description: category.metaDescription?.trim() ? category.metaDescription.trim() : null,
    canonical_url: category.canonicalUrl?.trim() ? category.canonicalUrl.trim() : null,
    og_image: category.ogImage?.trim() ? category.ogImage.trim() : null,
  };
}

export function slugifyCategoryName(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

/**
 * Validate + normalize a category payload coming from the admin UI.
 * Throws a human-readable error for bad input (surfaced by the API route).
 */
export function validateCategoryInput(input: unknown): {
  id?: string;
  name: string;
  slug: string;
  description: string;
  active: boolean;
  order: number;
  seoTitle: string | null;
  metaDescription: string | null;
  canonicalUrl: string | null;
  ogImage: string | null;
} {
  if (!input || typeof input !== "object") {
    throw new Error("A valid category payload is required.");
  }
  const value = input as Record<string, unknown>;

  const name = typeof value.name === "string" ? value.name.trim() : "";
  if (name.length < 2 || name.length > 100) {
    throw new Error("Category name must be between 2 and 100 characters.");
  }

  const slug = slugifyCategoryName(typeof value.slug === "string" ? value.slug : name);
  if (!slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    throw new Error("Category slug is invalid.");
  }

  const description =
    typeof value.description === "string" ? value.description.trim().slice(0, 500) : "";
  const active = value.active === undefined ? true : value.active === true;
  const order =
    typeof value.order === "number" && Number.isFinite(value.order)
      ? Math.max(0, Math.min(9999, Math.floor(value.order)))
      : 100;

  const optionalUrl = (raw: unknown, label: string): string | null => {
    const text = typeof raw === "string" ? raw.trim() : "";
    if (!text) return null;
    try {
      const parsed = new URL(text);
      if (parsed.protocol !== "https:" && parsed.protocol !== "http:") throw new Error();
      return parsed.toString();
    } catch {
      throw new Error(`${label} must be a valid HTTP or HTTPS URL.`);
    }
  };

  const id = typeof value.id === "string" && value.id.trim() ? value.id.trim() : undefined;

  return {
    ...(id ? { id } : {}),
    name,
    slug,
    description,
    active,
    order,
    seoTitle: typeof value.seoTitle === "string" ? value.seoTitle.trim().slice(0, 180) || null : null,
    metaDescription:
      typeof value.metaDescription === "string" ? value.metaDescription.trim().slice(0, 500) || null : null,
    canonicalUrl: optionalUrl(value.canonicalUrl, "Canonical URL"),
    ogImage: optionalUrl(value.ogImage, "OG image URL"),
  };
}

function revalidateCategories() {
  revalidatePath("/admin/categories");
  revalidatePath("/admin/posts");
  revalidatePath("/updates");
  revalidatePath("/");
}

export async function getAllCategories(): Promise<CmsCategory[]> {
  const cached = cmsCacheGet<CmsCategory[]>(CACHE_KEY);
  if (cached) return cached;

  if (!isCmsBackendConfigured()) return [];

  const client = await getCmsClient();
  if (!client) return [];

  const { data, error } = await client
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (error) {
    // The categories table may not exist yet on projects where the migration
    // has not been applied — return an empty list instead of failing loudly.
    if (error.code === "42P01") return [];
    throw error;
  }

  const categories = ((data ?? []) as CategoryRow[]).map(rowToCategory);
  cmsCacheSet(CACHE_KEY, categories);
  return categories;
}

export async function getActiveCategories(): Promise<CmsCategory[]> {
  return (await getAllCategories()).filter((c) => c.active);
}

export async function getCategoryBySlugOrId(slugOrId: string): Promise<CmsCategory | null> {
  const all = await getAllCategories();
  const needle = slugOrId.trim().toLowerCase();
  return (
    all.find((c) => c.id === slugOrId || c.slug === needle || c.id === needle) || null
  );
}

export async function isCategorySlugAvailable(slug: string, excludeId?: string): Promise<boolean> {
  const client = await getCmsClient();
  if (!client) {
    throw new Error("CMS backend is not configured.");
  }
  const db = client as CmsDbClient;
  const { data, error } = await db
    .from("categories")
    .select("id")
    .eq("slug", slug.trim().toLowerCase())
    .limit(1)
    .maybeSingle();
  if (error) throw new Error(`Unable to verify category slug uniqueness: ${error.message}`);
  if (!data) return true;
  return excludeId ? data.id === excludeId : false;
}

export async function saveCategory(
  input: ReturnType<typeof validateCategoryInput>
): Promise<CmsCategory> {
  const client = await getCmsClient();
  if (!client) {
    throw new Error("CMS backend is not configured: set NEXT_PUBLIC_SUPABASE_URL (and SUPABASE_SERVICE_ROLE_KEY for writes).");
  }
  const db = client as CmsDbClient;
  const nowIso = new Date().toISOString();

  // Enforce slug uniqueness against the table (excluding the row being edited)
  const available = await isCategorySlugAvailable(input.slug, input.id);
  if (!available) {
    throw new Error(`A category with the slug "${input.slug}" already exists. Choose a different slug.`);
  }

  if (input.id) {
    const existing = await db
      .from("categories")
      .select("*")
      .eq("id", input.id)
      .maybeSingle();
    if (existing.error) throw new Error(existing.error.message);
    if (!existing.data) {
      throw new Error("Category not found.");
    }
    const row = existing.data as CategoryRow;
    const updated: CmsCategory = {
      ...rowToCategory(row),
      name: input.name,
      slug: input.slug,
      description: input.description,
      active: input.active,
      order: input.order,
      seoTitle: input.seoTitle ?? "",
      metaDescription: input.metaDescription ?? "",
      canonicalUrl: input.canonicalUrl ?? "",
      ogImage: input.ogImage ?? "",
      updatedAt: nowIso,
    };
    const { error } = await db
      .from("categories")
      .update({ ...categoryToRow(updated), id: undefined, updated_at: nowIso })
      .eq("id", input.id);
    if (error) throw error;

    invalidateCmsCache(CACHE_KEY);
    revalidateCategories();
    return updated;
  }

  const created: CmsCategory = {
    id: "",
    name: input.name,
    slug: input.slug,
    description: input.description,
    active: input.active,
    order: input.order,
    seoTitle: input.seoTitle ?? "",
    metaDescription: input.metaDescription ?? "",
    canonicalUrl: input.canonicalUrl ?? "",
    ogImage: input.ogImage ?? "",
    updatedAt: nowIso,
  };
  const insertRow = categoryToRow(created);
  const { data, error } = await db
    .from("categories")
    .insert({ ...insertRow, id: undefined, created_at: nowIso, updated_at: nowIso })
    .select()
    .single();
  if (error) throw error;

  invalidateCmsCache(CACHE_KEY);
  revalidateCategories();
  return rowToCategory(data as CategoryRow);
}

export async function deleteCategory(idOrSlug: string): Promise<boolean> {
  const client = await getCmsClient();
  if (!client) {
    throw new Error("CMS backend is not configured: set NEXT_PUBLIC_SUPABASE_URL (and SUPABASE_SERVICE_ROLE_KEY for writes).");
  }
  const db = client as CmsDbClient;

  const target = await getCategoryBySlugOrId(idOrSlug);
  if (!target) return false;

  // Detach posts from the deleted category instead of orphaning the filter:
  // posts keep their history but move to the default "Guides" bucket.
  const { error: detachError } = await db
    .from("posts")
    .update({ category: "Guides", updated_at: new Date().toISOString() })
    .eq("category", target.name);
  if (detachError) throw new Error(`Unable to reassign posts: ${detachError.message}`);

  const { error } = await db.from("categories").delete().eq("id", target.id);
  if (error) throw error;

  invalidateCmsCache(CACHE_KEY);
  revalidateCategories();
  return true;
}
