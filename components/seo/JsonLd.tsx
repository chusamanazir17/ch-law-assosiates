import { SITE } from "@/lib/site";
import { getSiteUrl } from "@/config/env";
import { getSiteSettings } from "@/lib/db/siteSettingsStore";
import { getAllFaqs } from "@/lib/db/faqsStore";
import { createPublicClient } from "@/lib/supabase/public";

/**
 * Probe that `public.faqs` actually exists before trusting faqsStore output.
 * The faqs migration was never applied on some projects (migration drift), in
 * which case getAllFaqs() silently falls back to hard-coded defaults — we
 * must NOT emit those as FAQPage structured data (schema/content mismatch).
 * Fail loudly in the server log and omit the FAQ schema instead.
 */
async function getFaqsForSchema(): Promise<{ question: string; answer: string }[]> {
  let probeError: { message: string; code?: string } | null = null;
  try {
    const supabase = createPublicClient();
    const { error } = await supabase.from("faqs").select("id").limit(1);
    if (error) probeError = { message: error.message, code: (error as { code?: string }).code };
  } catch (error) {
    probeError = { message: error instanceof Error ? error.message : String(error) };
  }

  if (probeError) {
    console.error(
      `[JsonLd] Cannot read public.faqs (${probeError.code ?? "unknown"}: ${probeError.message}). ` +
        "The faqs migration may not have been applied (migration drift). " +
        "FAQPage JSON-LD is omitted until the table exists — no fallback data is emitted."
    );
    return [];
  }

  const allFaqs = await getAllFaqs();
  return allFaqs
    .filter((f) => f.isPublished && f.question?.trim() && f.answer?.trim())
    .sort((a, b) => a.displayOrder - b.displayOrder);
}

export default async function JsonLd() {
  const siteUrl = getSiteUrl();
  let settings;
  let faqs: { question: string; answer: string }[] = [];

  try {
    settings = await getSiteSettings();
  } catch {
    settings = null;
  }

  try {
    // CMS-002: the visible FAQ section renders from the unified `public.faqs`
    // table, so the FAQPage schema must come from the same source.
    faqs = await getFaqsForSchema();
  } catch (error) {
    console.error(
      "[JsonLd] Failed to load FAQs for FAQPage schema:",
      error instanceof Error ? error.message : error
    );
    faqs = [];
  }

  const legalServiceSchema = {
    "@context": "https://schema.org",
    "@type": "LegalService",
    name: settings?.fullName || settings?.name || "Ch Composing Estamp and Tax Advisor",
    description:
      settings?.footerSettings?.description ||
      "Pakistan's trusted legal documentation and tax consultancy firm for E-Stamping, property registry, business registration, and FBR tax filings.",
    url: siteUrl,
    telephone: settings?.phone || SITE.phone,
    email: settings?.email || SITE.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: settings?.address || SITE.address,
      addressLocality: settings?.city || SITE.city,
      addressCountry: "PK",
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "08:00",
        closes: "20:00",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: "Saturday",
        opens: "08:00",
        closes: "18:00",
      },
    ],
    areaServed: {
      "@type": "Country",
      name: "Pakistan",
    },
    priceRange: "$$",
  };

  // Build FAQPage schema from the same unified faqs table the visible
  // homepage FAQ section renders (CMS-002).
  const faqSchema =
    faqs.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map((faq) => ({
            "@type": "Question",
            name: faq.question,
            acceptedAnswer: {
              "@type": "Answer",
              text: faq.answer,
            },
          })),
        }
      : null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(legalServiceSchema).replace(/</g, "\\u003c"),
        }}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(faqSchema).replace(/</g, "\\u003c"),
          }}
        />
      )}
    </>
  );
}

/**
 * BreadcrumbList structured data for detail pages (SEO-004).
 * Pass crumb items as { name, url? } — the last item may omit url.
 */
export function BreadcrumbJsonLd({ items }: { items: { name: string; url?: string }[] }) {
  const siteUrl = getSiteUrl();
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      ...(item.url ? { item: item.url.startsWith("http") ? item.url : `${siteUrl}${item.url}` } : {}),
    })),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema).replace(/</g, "\\u003c"),
      }}
    />
  );
}
