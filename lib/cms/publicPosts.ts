import type { Post } from "@/types/cms";
import { getSupabasePublicConfig } from "@/config/env";
import { createPublicClient } from "@/lib/supabase/public";
import * as postsStore from "@/lib/db/postsStore";

/** Public CMS reads. Gracefully uses Supabase if online, otherwise serves from local postsStore. */
export async function getPublishedPosts(): Promise<Post[]> {
  if (getSupabasePublicConfig()) {
    try {
      const client = createPublicClient();
      const { data, error } = await client
        .from("posts")
        .select("*")
        .eq("status", "published")
        .order("published_at", { ascending: false });

      if (!error && data && data.length > 0) {
        return data;
      }
    } catch (err) {
      console.warn("[PublicPosts] Supabase fetch failed, serving from local postsStore:", err);
    }
  }

  return postsStore.getPublishedPosts();
}

export async function getPublishedPostBySlug(slug: string): Promise<Post | null> {
  if (!slug) return null;

  if (getSupabasePublicConfig()) {
    try {
      const client = createPublicClient();
      const { data, error } = await client
        .from("posts")
        .select("*")
        .eq("slug", slug)
        .eq("status", "published")
        .maybeSingle();

      if (!error && data) {
        return data;
      }
    } catch (err) {
      console.warn("[PublicPosts] Supabase slug fetch failed, serving from local postsStore:", err);
    }
  }

  return postsStore.getPublishedPostBySlug(slug);
}
