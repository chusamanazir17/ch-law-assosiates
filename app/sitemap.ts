import type { MetadataRoute } from "next";
import { SERVICES } from "@/lib/site";
import { getSiteUrl, getSupabasePublicConfig } from "@/config/env";
import { createPublicClient } from "@/lib/supabase/public";
import { listPublishedPosts } from "@/lib/services/posts.service";

export const dynamic = "force-dynamic";

/**
 * Sitemap built from the CMS (SEO-003): active services from `cms_services`,
 * published posts from `posts`, and published rows from `cms_pages` — so
 * anything an editor adds, removes, or unpublishes is reflected. When the
 * database is unreachable, the hard-coded service list from `lib/site.ts`
 * is used as a fallback so the sitemap never comes back empty.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
  const generatedAt = new Date();
  const entries: MetadataRoute.Sitemap = [
    { url: base, lastModified: generatedAt, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/about`, lastModified: generatedAt, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/updates`, lastModified: generatedAt, changeFrequency: "weekly", priority: 0.7 },
  ];

  const addEntry = (url: string, lastModified: Date, changeFrequency: "monthly" | "weekly", priority: number) => {
    if (!entries.some((e) => e.url === url)) {
      entries.push({ url, lastModified, changeFrequency, priority });
    }
  };

  const supabase = (() => {
    try {
      return getSupabasePublicConfig() ? createPublicClient() : null;
    } catch (error) {
      console.error("[Sitemap] Unable to create Supabase client:", error);
      return null;
    }
  })();

  // --- CMS services (published/active only) ---
  let servicesFromCms = false;
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("cms_services")
        .select("slug,updated_at")
        .eq("active", true)
        .order("sort_order", { ascending: true });

      if (!error && data) {
        servicesFromCms = true;
        for (const service of data) {
          addEntry(
            `${base}/services/${service.slug}`,
            new Date(service.updated_at || generatedAt),
            "monthly",
            0.8
          );
        }
      }
    } catch (error) {
      console.error("[Sitemap] Unable to load CMS services:", error);
    }
  }

  // Fallback: static service list only when the CMS read failed.
  if (!servicesFromCms) {
    for (const service of SERVICES) {
      addEntry(`${base}${service.href}`, generatedAt, "monthly", 0.8);
    }
  }

  // --- CMS pages (published only) ---
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("cms_pages")
        .select("route,updated_at")
        .eq("status", "published");

      if (!error && data) {
        for (const page of data) {
          const route = page.route === "/" ? "" : page.route;
          // Skip routes already covered above or backed by a dedicated template.
          if (["", "/about", "/updates"].includes(page.route)) continue;
          if (route.startsWith("/services/")) continue; // covered by the services section
          addEntry(`${base}${route}`, new Date(page.updated_at || generatedAt), "monthly", 0.6);
        }
      }
    } catch (error) {
      console.error("[Sitemap] Unable to load CMS pages:", error);
    }
  }

  // --- Published posts (same source the /updates pages render) ---
  try {
    const posts = await listPublishedPosts();
    for (const post of posts) {
      addEntry(
        `${base}/updates/${post.slug}`,
        new Date(post.updated_at || post.published_at || generatedAt),
        "monthly",
        0.6
      );
    }
  } catch (error) {
    console.error("[Sitemap] Unable to load published posts:", error);
  }

  // Safety net: merge any Supabase posts that the service call missed.
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("posts")
        .select("slug,updated_at,published_at")
        .eq("status", "published")
        .order("published_at", { ascending: false });

      if (!error && data) {
        for (const post of data) {
          addEntry(
            `${base}/updates/${post.slug}`,
            new Date(post.updated_at || post.published_at || generatedAt),
            "monthly",
            0.6
          );
        }
      }
    } catch (error) {
      console.error("[Sitemap] Unable to load Supabase posts:", error);
    }
  }

  return entries;
}
