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

export function notifyCmsUpdated(state: CmsState) {
  cachedCmsState = state;
  listeners.forEach((listener) => listener(state));
}

export function refreshCms(): Promise<void> {
  return fetch("/api/cms/content", { cache: "no-store" })
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
        notifyCmsUpdated(newState);
      }
    })
    .catch((err) => {
      console.warn("[useCms] Could not fetch CMS content:", err);
    });
}

export function useCms(initialData?: Partial<CmsState>) {
  if (initialData && !cachedCmsState) {
    cachedCmsState = {
      settings: initialData.settings ?? null,
      services: initialData.services ?? [],
      pages: initialData.pages ?? [],
      homeSections: initialData.homeSections ?? null,
      isLoading: false,
    };
  }

  const [state, setState] = useState<CmsState>(
    cachedCmsState || {
      settings: initialData?.settings ?? null,
      services: initialData?.services ?? [],
      pages: initialData?.pages ?? [],
      homeSections: initialData?.homeSections ?? null,
      isLoading: !initialData,
    }
  );

  useEffect(() => {
    listeners.add(setState);

    // Always fetch fresh in background so admin edits show immediately
    refreshCms();

    const handleCmsEvent = () => {
      refreshCms();
    };

    window.addEventListener("cms-updated", handleCmsEvent);
    window.addEventListener("focus", handleCmsEvent);

    return () => {
      listeners.delete(setState);
      window.removeEventListener("cms-updated", handleCmsEvent);
      window.removeEventListener("focus", handleCmsEvent);
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
    refresh: refreshCms,
  };
}

