import type { MetadataRoute } from "next";
import { SERVICES } from "@/lib/site";
import { getSiteUrl, getSupabasePublicConfig } from "@/config/env";
import { createPublicClient } from "@/lib/supabase/public";
import { getPublishedPosts } from "@/lib/db/postsStore";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
  const generatedAt = new Date();
  const entries: MetadataRoute.Sitemap = [
    { url: base, lastModified: generatedAt, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/about`, lastModified: generatedAt, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/updates`, lastModified: generatedAt, changeFrequency: "weekly", priority: 0.7 },
    ...SERVICES.map((service) => ({
      url: `${base}${service.href}`,
      lastModified: generatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];

  // Load published posts from local CMS store (guarantees sitemap inclusion)
  try {
    const localPosts = await getPublishedPosts();
    for (const post of localPosts) {
      const url = `${base}/updates/${post.slug}`;
      if (!entries.some((e) => e.url === url)) {
        entries.push({
          url,
          lastModified: new Date(post.updated_at || post.published_at || generatedAt),
          changeFrequency: "monthly",
          priority: 0.6,
        });
      }
    }
  } catch (error) {
    console.error("[Sitemap] Unable to load local posts:", error);
  }

  // Also include Supabase posts if configured
  if (getSupabasePublicConfig()) {
    try {
      const supabase = createPublicClient();
      const { data, error } = await supabase
        .from("posts")
        .select("slug,updated_at,published_at")
        .eq("status", "published")
        .order("published_at", { ascending: false });

      if (!error && data) {
        for (const post of data) {
          const url = `${base}/updates/${post.slug}`;
          if (!entries.some((e) => e.url === url)) {
            entries.push({
              url,
              lastModified: new Date(post.updated_at || post.published_at || generatedAt),
              changeFrequency: "monthly",
              priority: 0.6,
            });
          }
        }
      }
    } catch (error) {
      console.error("[Sitemap] Unable to load Supabase posts:", error);
    }
  }

  return entries;
}
