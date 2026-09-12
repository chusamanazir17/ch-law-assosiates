import type { MetadataRoute } from "next";
import { SERVICES } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://legalassist.pk";
  const lastModified = new Date();
  return [
    { url: base, lastModified, changeFrequency: "weekly", priority: 1 },
    ...SERVICES.map((s) => ({
      url: `${base}${s.href}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
