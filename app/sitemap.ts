import type { MetadataRoute } from "next";
import { SERVICES } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://legalassist.pk";
  return [
    { url: base, priority: 1 },
    ...SERVICES.map((s) => ({
      url: `${base}${s.href}`,
      priority: 0.8,
    })),
  ];
}
