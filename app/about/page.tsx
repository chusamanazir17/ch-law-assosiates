import type { Metadata } from "next";
import AboutPageClient from "@/components/about/AboutPageClient";
import { getSiteUrl } from "@/config/env";

export const metadata: Metadata = {
  title: "About Us & Leadership | Ch Composing Estamp and Tax Advisor Chamber 121",
  description:
    "Learn about Chamber 121 Sahiwal, founded by Late Haji Faqir Muhammad, and now managed by Haji Nazir Ahmed & Usama Ch. Trusted e-stamping, registry deeds, and tax advisory.",
  keywords: [
    "About Ch Composing",
    "Chamber 121 Sahiwal",
    "Haji Faqir Muhammad Late",
    "Haji Nazir Ahmed",
    "Usama Ch",
    "District Court Sahiwal",
    "E-Stamping Sahiwal",
    "Property Registry Advisor",
  ],
  alternates: {
    canonical: `${getSiteUrl()}/about`,
  },
};

export default function AboutPage() {
  return <AboutPageClient />;
}
