import type { Post } from "@/types/cms";
import { getSupabasePublicConfig } from "@/config/env";
import { createPublicClient } from "@/lib/supabase/public";

/** Public CMS reads. RLS limits the anonymous client to published posts. */
export async function getPublishedPosts(): Promise<Post[]> {
  if (!getSupabasePublicConfig()) return [];

  const client = createPublicClient();
  const { data, error } = await client
    .from("posts")
    .select("*")
    .eq("status", "published")
    .order("published_at", { ascending: false });

  if (error) {
    console.error("[PublicPosts] Failed to load published posts:", error.message);
    return [];
  }

  return data ?? [];
}

export async function getPublishedPostBySlug(slug: string): Promise<Post | null> {
  if (!slug || !getSupabasePublicConfig()) return null;

  const client = createPublicClient();
  const { data, error } = await client
    .from("posts")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (error) {
    console.error("[PublicPosts] Failed to load post:", error.message);
    return null;
  }

  return data;
}
