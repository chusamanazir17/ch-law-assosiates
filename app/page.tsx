import type { Metadata } from "next";
import HomePageClient from "@/components/home/HomePageClient";

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
  return <HomePageClient />;
}
