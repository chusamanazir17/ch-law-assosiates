import { SITE } from "@/lib/site";
import { getSiteUrl } from "@/config/env";
import { getSiteSettings } from "@/lib/db/siteSettingsStore";
import { getHomeSections } from "@/lib/db/homeSectionsStore";

export default function JsonLd() {
  const siteUrl = getSiteUrl();
  let settings;
  let homeSections;

  try {
    settings = getSiteSettings();
  } catch {
    settings = null;
  }

  try {
    homeSections = getHomeSections();
  } catch {
    homeSections = null;
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

  // Build FAQPage schema if FAQ items exist and are visible
  const visibleFaqs = homeSections?.faqSection?.items?.filter((f) => f.visible) || [];
  const faqSchema =
    visibleFaqs.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: visibleFaqs.map((faq) => ({
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
