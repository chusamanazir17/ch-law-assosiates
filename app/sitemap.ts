import type { MetadataRoute } from "next";
import { SERVICES } from "@/lib/site";
import { getSiteUrl, getSupabasePublicConfig } from "@/config/env";
import { createPublicClient } from "@/lib/supabase/public";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
  const generatedAt = new Date();
  const entries: MetadataRoute.Sitemap = [
    { url: base, lastModified: generatedAt, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/updates`, lastModified: generatedAt, changeFrequency: "weekly", priority: 0.7 },
    ...SERVICES.map((service) => ({
      url: `${base}${service.href}`,
      lastModified: generatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];

  if (!getSupabasePublicConfig()) return entries;

  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("posts")
      .select("slug,updated_at,published_at")
      .eq("status", "published")
      .order("published_at", { ascending: false });

    if (error) throw error;

    for (const post of data ?? []) {
      entries.push({
        url: `${base}/updates/${post.slug}`,
        lastModified: new Date(post.updated_at || post.published_at || generatedAt),
        changeFrequency: "monthly",
        priority: 0.6,
      });
    }
  } catch (error) {
    console.error("[Sitemap] Unable to load published posts:", error);
  }

  return entries;
}
