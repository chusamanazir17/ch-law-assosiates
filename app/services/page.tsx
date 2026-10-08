import React from "react";
import type { Metadata } from "next";
import ServicesIndexClient from "@/components/services/ServicesIndexClient";
import { getAllServices } from "@/lib/db/servicesStore";
import { getPageSeoMetadata } from "@/lib/cms/pageSeo";

export async function generateMetadata(): Promise<Metadata> {
  return getPageSeoMetadata("/services", {
    title: "Legal & Documentation Practice Areas | Ch Composing Estamp & Tax Advisor",
    description:
      "Explore our complete range of certified legal documentation, e-stamping, property registry deeds, FBR tax filings, SECP registrations, and banking services at District Court Sahiwal.",
  });
}

export default async function ServicesPage() {
  const services = await getAllServices();
  return <ServicesIndexClient initialServices={services} />;
}
