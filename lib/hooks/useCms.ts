"use client";

import { useState, useEffect } from "react";
import type { SiteSettings } from "@/lib/db/siteSettingsStore";
import type { CmsService } from "@/lib/db/servicesStore";
import type { PageContentItem } from "@/lib/db/pagesContentStore";
import type { HomeSectionsData } from "@/lib/db/homeSectionsStore";

interface CmsState {
  settings: SiteSettings | null;
  services: CmsService[];
  pages: PageContentItem[];
  homeSections: HomeSectionsData | null;
  isLoading: boolean;
}

let cachedCmsState: CmsState | null = null;
const listeners = new Set<(state: CmsState) => void>();

export function useCms() {
  const [state, setState] = useState<CmsState>(
    cachedCmsState || {
      settings: null,
      services: [],
      pages: [],
      homeSections: null,
      isLoading: true,
    }
  );

  useEffect(() => {
    listeners.add(setState);

    if (!cachedCmsState) {
      fetch("/api/cms/content")
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            const newState: CmsState = {
              settings: data.settings,
              services: data.services || [],
              pages: data.pages || [],
              homeSections: data.homeSections || null,
              isLoading: false,
            };
            cachedCmsState = newState;
            listeners.forEach((listener) => listener(newState));
          }
        })
        .catch((err) => {
          console.warn("[useCms] Could not fetch CMS content:", err);
          setState((prev) => ({ ...prev, isLoading: false }));
        });
    }

    return () => {
      listeners.delete(setState);
    };
  }, []);

  const getPageContent = (route: string): PageContentItem | undefined => {
    return state.pages.find((p) => p.route === route);
  };

  const getService = (slug: string): CmsService | undefined => {
    return state.services.find((s) => s.slug === slug || s.id === slug);
  };

  return {
    settings: state.settings,
    services: state.services,
    pages: state.pages,
    homeSections: state.homeSections,
    isLoading: state.isLoading,
    getPageContent,
    getService,
  };
}

