import type { Metadata } from "next";
import HomePageClient from "@/components/home/HomePageClient";

export const metadata: Metadata = {
  title: "Official Legal Documentation & Attestation Services in Islamabad",
  description:
    "Pakistan's premier legal documentation firm for E-Stamping, property registry, business registration, tax filings, and family legal services at Blue Area, Islamabad.",
  keywords: [
    "Legal services Islamabad",
    "E-Stamping Pakistan",
    "Property Registry Islamabad",
    "SECP Registration",
    "NTN Registration",
    "Legal Documentation Pakistan",
  ],
  alternates: {
    canonical: "https://legalassist.pk",
  },
};

export default function HomePage() {
  return <HomePageClient />;
}
