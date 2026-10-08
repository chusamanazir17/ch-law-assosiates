import React from "react";
import type { Metadata } from "next";
import ServicePageTemplate from "@/components/services/ServicePageTemplate";
import { getServiceBySlug, getAllServices } from "@/lib/db/servicesStore";
import { getSiteUrl } from "@/config/env";
import { BreadcrumbJsonLd } from "@/components/seo/JsonLd";

export const revalidate = 300;

interface ServicePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ServicePageProps): Promise<Metadata> {
  const { slug } = await params;
  const service = await getServiceBySlug(slug);

  if (!service) {
    return {
      title: "Legal & Documentation Services | Ch Composing Sahiwal",
      description: "Official legal and documentation services at District Court Sahiwal.",
    };
  }

  // CMS-managed SEO fields take precedence; fall back to service fields.
  const title = service.seoTitle?.trim() || `${service.name} | Ch Composing Estamp & Tax Advisor`;
  const description =
    service.metaDescription?.trim() ||
    service.description ||
    `Authorized ${service.name} services at Chamber 121, District Court Sahiwal.`;
  const canonical = service.canonicalUrl?.trim() || `${getSiteUrl()}/services/${service.slug}`;
  const ogImage = service.ogImage?.trim() || service.heroImage || undefined;

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      type: "website",
      siteName: "Ch Composing Estamp and Tax Advisor",
      locale: "en_PK",
      title: service.seoTitle?.trim() || service.name,
      description,
      images: ogImage ? [{ url: ogImage }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: service.seoTitle?.trim() || service.name,
      description,
      images: ogImage ? [ogImage] : undefined,
    },
  };
}

export default async function DynamicServicePage({ params }: ServicePageProps) {
  const { slug } = await params;
  const service = await getServiceBySlug(slug);
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: "/" },
          { name: "Services", url: "/services" },
          { name: service?.name || "Service" },
        ]}
      />
      <ServicePageTemplate slug={slug} />
    </>
  );
}
