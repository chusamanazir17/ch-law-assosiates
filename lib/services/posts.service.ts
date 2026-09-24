import { revalidatePath } from "next/cache";
import { createPublicClient } from "@/lib/supabase/public";
import { isCmsBackendConfigured } from "@/lib/db/cmsClient";
import type { Post } from "@/types/cms";
import { slugify, type ValidatedPostInput } from "@/lib/validation/post";

/**
 * Supabase-backed post service (`posts` table). This is the single source of
 * truth for blog content — there is intentionally no local fallback store.
 *
 * Public reads use the stateless anon client (RLS restricts rows to
 * published posts); admin reads and writes use the service-role client so
 * they work for every admin session type.
 */

async function getAdminPostsClient() {
  if (!isCmsBackendConfigured()) return null;
  const { getCmsClient } = await import("@/lib/db/cmsClient");
  return getCmsClient();
}

function publicClientOrNull() {
  if (!isCmsBackendConfigured()) return null;
  try {
    return createPublicClient();
  } catch {
    return null;
  }
}

/**
 * List all posts for Admin Dashboard (drafts + published)
 */
export async function listAllPosts(): Promise<Post[]> {
  const client = await getAdminPostsClient();
  if (!client) {
    console.error("[PostsService] Supabase is not configured; cannot list posts.");
    return [];
  }

  const { data, error } = await client
    .from("posts")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[PostsService] listAllPosts error:", error.message);
    return [];
  }

  return (data ?? []) as Post[];
}

/**
 * List published posts for Public Website (/updates)
 */
export async function listPublishedPosts(category?: string, query?: string): Promise<Post[]> {
  const supabase = publicClientOrNull();
  if (!supabase) return [];

  let queryBuilder = supabase
    .from("posts")
    .select("*")
    .eq("status", "published")
    .order("published_at", { ascending: false });

  if (category && category !== "all") {
    queryBuilder = queryBuilder.ilike("category", category);
  }

  if (query && query.trim()) {
    queryBuilder = queryBuilder.or(`title.ilike.%${query.trim()}%,excerpt.ilike.%${query.trim()}%`);
  }

  const { data, error } = await queryBuilder;
  if (error) {
    console.error("[PostsService] listPublishedPosts error:", error.message);
    return [];
  }

  return (data ?? []) as Post[];
}

/**
 * Find single published post by slug for Public Website (/updates/[slug])
 */
export async function getPublishedPostBySlug(slug: string): Promise<Post | null> {
  if (!slug) return null;

  const supabase = publicClientOrNull();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("slug", slug.trim().toLowerCase())
    .eq("status", "published")
    .maybeSingle();

  if (error) {
    console.error("[PostsService] getPublishedPostBySlug error:", error.message);
    return null;
  }

  return (data as Post) ?? null;
}

/**
 * Find post by slug or ID for Admin Editor
 */
export async function getAdminPostBySlugOrId(slugOrId: string): Promise<Post | null> {
  const client = await getAdminPostsClient();
  if (!client) return null;

  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(slugOrId);

  let queryBuilder = client.from("posts").select("*");
  if (isUuid) {
    queryBuilder = queryBuilder.eq("id", slugOrId);
  } else {
    queryBuilder = queryBuilder.eq("slug", slugOrId.trim().toLowerCase());
  }

  const { data, error } = await queryBuilder.maybeSingle();
  if (error) {
    console.error("[PostsService] getAdminPostBySlugOrId error:", error.message);
    return null;
  }

  return (data as Post) ?? null;
}

/**
 * Create or Update Post with complete validation, UUID generation, and Next.js revalidation
 */
export async function savePost(input: ValidatedPostInput): Promise<Post> {
  const client = await getAdminPostsClient();
  if (!client) {
    throw new Error("CMS backend is not configured: set NEXT_PUBLIC_SUPABASE_URL (and SUPABASE_SERVICE_ROLE_KEY for writes).");
  }
  const now = new Date().toISOString();

  // Validate or generate slug
  const finalSlug = slugify(input.slug || input.title);

  // Check if updating existing post
  if (input.id) {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(input.id);
    if (!isUuid) {
      throw new Error(`Invalid post ID format (must be a valid UUID): "${input.id}"`);
    }

    const updatePayload = {
      title: input.title.trim(),
      slug: finalSlug,
      excerpt: input.excerpt ? input.excerpt.trim() : null,
      content: input.content,
      cover_image_url: input.cover_image_url ? input.cover_image_url.trim() : null,
      category: input.category || "Taxation & FBR",
      author_name: input.author_name || "Usama Nazir Ch",
      status: input.status,
      views_count: input.views_count !== undefined ? input.views_count : 0,
      published_at: input.status === "published" ? (input.published_at || now) : null,
      updated_at: now,
    };

    const { data, error } = await client
      .from("posts")
      .update(updatePayload)
      .eq("id", input.id)
      .select()
      .single();

    if (error) {
      console.error("[PostsService] update post error:", error);
      throw new Error(`Database error updating post: ${error.message}`);
    }

    revalidatePath("/updates");
    revalidatePath(`/updates/${finalSlug}`);
    revalidatePath("/admin/posts");
    revalidatePath("/admin/dashboard");
    revalidatePath("/");

    return data as Post;
  }

  // Create new post — the database generates the UUID primary key.
  const insertPayload = {
    title: input.title.trim(),
    slug: finalSlug,
    excerpt: input.excerpt ? input.excerpt.trim() : null,
    content: input.content,
    cover_image_url: input.cover_image_url ? input.cover_image_url.trim() : null,
    category: input.category || "Taxation & FBR",
    author_name: input.author_name || "Usama Nazir Ch",
    status: input.status,
    views_count: 0,
    published_at: input.status === "published" ? (input.published_at || now) : null,
    created_at: now,
    updated_at: now,
  };

  const { data, error } = await client
    .from("posts")
    .insert(insertPayload)
    .select()
    .single();

  if (error) {
    console.error("[PostsService] insert post error:", error);
    throw new Error(`Database error creating post: ${error.message}`);
  }

  revalidatePath("/updates");
  revalidatePath(`/updates/${finalSlug}`);
  revalidatePath("/admin/posts");
  revalidatePath("/admin/dashboard");
  revalidatePath("/");

  return data as Post;
}

/**
 * Delete a post by ID or Slug
 */
export async function deletePost(idOrSlug: string): Promise<void> {
  const client = await getAdminPostsClient();
  if (!client) {
    throw new Error("CMS backend is not configured: set NEXT_PUBLIC_SUPABASE_URL (and SUPABASE_SERVICE_ROLE_KEY for writes).");
  }
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(idOrSlug);

  // Retrieve post slug before deleting to properly revalidate route
  let postSlug = idOrSlug;
  const { data: existing } = await client
    .from("posts")
    .select("slug")
    .eq(isUuid ? "id" : "slug", idOrSlug)
    .maybeSingle();

  if (existing?.slug) {
    postSlug = existing.slug;
  }

  const { error } = await client
    .from("posts")
    .delete()
    .eq(isUuid ? "id" : "slug", idOrSlug);

  if (error) {
    throw new Error(`Database error deleting post: ${error.message}`);
  }

  revalidatePath("/updates");
  revalidatePath(`/updates/${postSlug}`);
  revalidatePath("/admin/posts");
  revalidatePath("/admin/dashboard");
  revalidatePath("/");
}

/**
 * Toggle publish status of a post
 */
export async function togglePostPublish(id: string, publish: boolean): Promise<Post> {
  const client = await getAdminPostsClient();
  if (!client) {
    throw new Error("CMS backend is not configured: set NEXT_PUBLIC_SUPABASE_URL (and SUPABASE_SERVICE_ROLE_KEY for writes).");
  }
  const now = new Date().toISOString();

  const { data, error } = await client
    .from("posts")
    .update({
      status: publish ? "published" : "draft",
      published_at: publish ? now : null,
      updated_at: now,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to toggle post publish status: ${error.message}`);
  }

  revalidatePath("/updates");
  if (data?.slug) revalidatePath(`/updates/${data.slug}`);
  revalidatePath("/admin/posts");
  revalidatePath("/");

  return data as Post;
}
