import type { Metadata } from "next";
import HomePageClient from "@/components/home/HomePageClient";
import { getHomeSections } from "@/lib/db/homeSectionsStore";
import { getAllPagesContent } from "@/lib/db/pagesContentStore";
import { getSiteSettings } from "@/lib/db/siteSettingsStore";
import { getAllServices } from "@/lib/db/servicesStore";

export const metadata: Metadata = {
  title: "Ch Composing Estamp and Tax Advisor | Legal Documentation & Tax Services",
  description:
    "Ch Composing Estamp and Tax Advisor - Sahiwal's premier firm for E-Stamping, property registry, business registration, and FBR tax filings at Sharki Gate Chamber No 121 District Court Sahiwal.",
  keywords: [
    "Ch Composing",
    "E-Stamp and Tax Advisor",
    "Ch Composing Estamp and Tax Advisor",
    "E-Stamping Sahiwal",
    "Property Registry Sahiwal",
    "District Court Sahiwal Chamber",
    "SECP Registration",
    "NTN Registration",
    "FBR Tax Filing",
  ],
  alternates: {
    canonical: "https://chcomposing.pk",
  },
};

export default function HomePage() {
  const initialCms = {
    settings: getSiteSettings(),
    services: getAllServices(),
    pages: getAllPagesContent(),
    homeSections: getHomeSections(),
    isLoading: false,
  };

  return <HomePageClient initialCms={initialCms} />;
}
