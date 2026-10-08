import type { Metadata } from "next";
import { getSiteUrl } from "@/config/env";
import { getPageContentByRoute } from "@/lib/db/pagesContentStore";

export interface PageSeoFallback {
  title: string;
  description: string;
  keywords?: string[];
}

/**
 * Build page <Metadata> from the CMS `cms_pages` row (route "/", "/about",
 * "/updates", ...), preferring the editor-managed SEO fields and falling back
 * to the template defaults when the row is missing, draft, or has no SEO
 * values. Draft pages never override the template defaults.
 */
export async function getPageSeoMetadata(
  route: string,
  fallback: PageSeoFallback
): Promise<Metadata> {
  const siteUrl = getSiteUrl();

  try {
    const page = await getPageContentByRoute(route);
    if (page && page.status === "published") {
      const title = page.metaTitle?.trim() || fallback.title;
      const description = page.metaDescription?.trim() || fallback.description;
      const metadata: Metadata = {
        title,
        description,
        alternates: {
          canonical: page.canonicalUrl?.trim() || `${siteUrl}${route === "/" ? "" : route}`,
        },
      };
      if (fallback.keywords?.length) metadata.keywords = fallback.keywords;
      const ogImage = page.ogImage?.trim();
      if (ogImage) {
        metadata.openGraph = {
          title,
          description,
          images: [{ url: ogImage }],
        };
      }
      return metadata;
    }
  } catch {
    // Fall through to the template defaults on read errors.
  }

  const fallbackMetadata: Metadata = {
    title: fallback.title,
    description: fallback.description,
    alternates: {
      canonical: `${siteUrl}${route === "/" ? "" : route}`,
    },
  };
  if (fallback.keywords?.length) fallbackMetadata.keywords = fallback.keywords;
  return fallbackMetadata;
}
