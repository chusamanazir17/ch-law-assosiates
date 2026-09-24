import type { Post } from "@/types/cms";
import {
  listPublishedPosts as fetchPublishedPosts,
  getPublishedPostBySlug as fetchPublishedPostBySlug,
} from "@/lib/services/posts.service";

/**
 * Public CMS reads. Fetches directly from PostgreSQL database via PostsService.
 * Returns empty array when no posts exist; never resurrects outdated local json mocks.
 */
export async function getPublishedPosts(): Promise<Post[]> {
  return fetchPublishedPosts();
}

export async function getPublishedPostBySlug(slug: string): Promise<Post | null> {
  return fetchPublishedPostBySlug(slug);
}

