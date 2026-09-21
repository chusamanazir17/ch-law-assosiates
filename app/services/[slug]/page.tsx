import React from "react";
import type { Metadata } from "next";
import ServicePageTemplate from "@/components/services/ServicePageTemplate";
import { getServiceBySlug, getAllServices } from "@/lib/db/servicesStore";
import { getSiteUrl } from "@/config/env";

export const dynamic = "force-dynamic";

interface ServicePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ServicePageProps): Promise<Metadata> {
  const { slug } = await params;
  const service = getServiceBySlug(slug);

  if (!service) {
    return {
      title: "Legal & Documentation Services | Ch Composing Sahiwal",
      description: "Official legal and documentation services at District Court Sahiwal.",
    };
  }

  return {
    title: `${service.name} | Ch Composing Estamp & Tax Advisor`,
    description: service.description || `Authorized ${service.name} services at Chamber 121, District Court Sahiwal.`,
    alternates: {
      canonical: `${getSiteUrl()}/services/${service.slug}`,
    },
  };
}

export default async function DynamicServicePage({ params }: ServicePageProps) {
  const { slug } = await params;
  return <ServicePageTemplate slug={slug} />;
}
