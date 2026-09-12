import { SITE } from "@/lib/site";

export default function JsonLd() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "LegalService",
    name: "LegalAssist Pakistan",
    description:
      "Pakistan's trusted legal documentation firm for E-Stamping, property registry, business registration, tax filings, and family legal services.",
    url: "https://legalassist.pk",
    telephone: SITE.phone,
    email: SITE.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: "Office 402, Business Tower, Blue Area",
      addressLocality: "Islamabad",
      addressCountry: "PK",
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "09:00",
        closes: "18:00",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: "Saturday",
        opens: "10:00",
        closes: "14:00",
      },
    ],
    areaServed: {
      "@type": "Country",
      name: "Pakistan",
    },
    sameAs: [],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
