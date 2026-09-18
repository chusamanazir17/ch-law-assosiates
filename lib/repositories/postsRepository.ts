import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";
import type { Post } from "@/types/cms";
import type { ValidatedPostInput } from "@/lib/validation/post";
import * as postsStore from "@/lib/db/postsStore";

type DbClient = SupabaseClient<Database>;

export async function listPosts(client?: DbClient | null): Promise<Post[]> {
  if (client) {
    try {
      const { data, error } = await client
        .from("posts")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data && data.length > 0) {
        return data;
      }
    } catch (err) {
      console.warn("[PostsRepository] Supabase listPosts failed, falling back to local postsStore:", err);
    }
  }

  return postsStore.getAllPosts();
}

export async function findPostBySlug(client: DbClient | null | undefined, slug: string): Promise<Post | null> {
  if (client) {
    try {
      const { data, error } = await client
        .from("posts")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();

      if (!error && data) {
        return data;
      }
    } catch (err) {
      console.warn("[PostsRepository] Supabase findPostBySlug failed, falling back to local postsStore:", err);
    }
  }

  return postsStore.getPostBySlug(slug);
}

export async function savePost(client: DbClient | null | undefined, input: ValidatedPostInput): Promise<Post> {
  // Always persist to resilient local store first
  const savedPost = await postsStore.savePost(input);

  // Attempt Supabase sync if client is available
  if (client) {
    try {
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
        await client.from("posts").update(payload).eq("id", input.id);
      } else {
        await client.from("posts").insert(payload);
      }
    } catch (err) {
      console.warn("[PostsRepository] Supabase save sync failed (post safely stored in postsStore):", err);
    }
  }

  return savedPost;
}

export async function removePost(client: DbClient | null | undefined, idOrSlug: string): Promise<void> {
  await postsStore.deletePost(idOrSlug);

  if (client) {
    try {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(idOrSlug);
      const query = client.from("posts").delete();
      if (isUuid) {
        await query.eq("id", idOrSlug);
      } else {
        await query.eq("slug", idOrSlug);
      }
    } catch (err) {
      console.warn("[PostsRepository] Supabase remove sync failed (post removed from postsStore):", err);
    }
  }
}
