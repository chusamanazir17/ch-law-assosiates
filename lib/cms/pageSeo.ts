import type { Metadata } from "next";
import { getSiteUrl } from "@/config/env";
import { getPageContentByRoute } from "@/lib/db/pagesContentStore";

export interface PageSeoFallback {
  title: string;
  description: string;
  keywords?: string[];
}

const DEFAULT_OG_IMAGE = "/images/hero-scales-justice.jpg";
const SITE_NAME = "Ch Composing Estamp and Tax Advisor";

/** Shared Open Graph + Twitter card block (absolute URLs via metadataBase). */
function socialMetadata(
  title: string,
  description: string,
  ogImage?: string
): Pick<Metadata, "openGraph" | "twitter"> {
  const image = ogImage?.trim() || DEFAULT_OG_IMAGE;
  return {
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      locale: "en_PK",
      title,
      description,
      images: [{ url: image }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
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
        ...socialMetadata(title, description, page.ogImage),
      };
      if (fallback.keywords?.length) metadata.keywords = fallback.keywords;
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
    ...socialMetadata(fallback.title, fallback.description),
  };
  if (fallback.keywords?.length) fallbackMetadata.keywords = fallback.keywords;
  return fallbackMetadata;
}
