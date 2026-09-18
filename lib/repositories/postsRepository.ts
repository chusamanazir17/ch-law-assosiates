import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";
import type { Post } from "@/types/cms";
import type { ValidatedPostInput } from "@/lib/validation/post";

type DbClient = SupabaseClient<Database>;

export async function listPosts(client: DbClient): Promise<Post[]> {
  const { data, error } = await client
    .from("posts")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Unable to load posts: ${error.message}`);
  return data ?? [];
}

export async function findPostBySlug(client: DbClient, slug: string): Promise<Post | null> {
  const { data, error } = await client
    .from("posts")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw new Error(`Unable to load post: ${error.message}`);
  return data;
}

export async function savePost(client: DbClient, input: ValidatedPostInput): Promise<Post> {
  const now = new Date().toISOString();
  const payload: Database["public"]["Tables"]["posts"]["Insert"] = {
    title: input.title,
    slug: input.slug,
    excerpt: input.excerpt,
    content: input.content,
    cover_image_url: input.cover_image_url,
    category: input.category,
    author_name: input.author_name,
    status: input.status,
    ...(input.views_count !== undefined ? { views_count: input.views_count } : {}),
    published_at:
      input.status === "published"
        ? input.published_at || now
        : null,
    updated_at: now,
  };

  if (input.id) {
    const { data, error } = await client
      .from("posts")
      .update(payload)
      .eq("id", input.id)
      .select("*")
      .single();

    if (error || !data) {
      throw new Error(`Unable to update post: ${error?.message || "Unknown database error"}`);
    }

    return data;
  }

  const { data, error } = await client
    .from("posts")
    .insert(payload)
    .select("*")
    .single();

  if (error || !data) {
    throw new Error(`Unable to create post: ${error?.message || "Unknown database error"}`);
  }

  return data;
}

export async function removePost(client: DbClient, idOrSlug: string): Promise<void> {
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(idOrSlug);
  const query = client.from("posts").delete();
  const { error } = isUuid
    ? await query.eq("id", idOrSlug)
    : await query.eq("slug", idOrSlug);

  if (error) throw new Error(`Unable to delete post: ${error.message}`);
}
