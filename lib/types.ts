import type { LucideIcon } from "lucide-react";

/** Translation shape for a single service category */
export interface TranslationCategoryItem {
  title: string;
  description: string;
}

export interface TranslationCategory {
  title: string;
  shortTitle: string;
  tagline: string;
  description: string;
  items: TranslationCategoryItem[];
}

/** Map of category IDs to their translations */
export type CategoryTranslations = Record<string, TranslationCategory>;

/** Feature item used in "Why Trust" and similar sections */
export interface TrustFeature {
  title: string;
  text: string;
}

/** Prepare Visit step */
export interface PrepareStep {
  title: string;
  text: string;
}
