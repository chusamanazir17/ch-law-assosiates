"use client";

import { useState, useEffect } from "react";
import type { SiteSettings } from "@/lib/db/siteSettingsStore";
import type { CmsService } from "@/lib/db/servicesStore";
import type { PageContentItem } from "@/lib/db/pagesContentStore";
import type { HomeSectionsData } from "@/lib/db/homeSectionsStore";
import type { CmsTeamMember } from "@/lib/db/teamMembersStore";
import type { CmsTestimonial } from "@/lib/db/testimonialsStore";
import type { CmsFaq } from "@/lib/db/faqsStore";

interface CmsState {
  settings: SiteSettings | null;
  services: CmsService[];
  pages: PageContentItem[];
  homeSections: HomeSectionsData | null;
  teamMembers: CmsTeamMember[];
  testimonials: CmsTestimonial[];
  faqs: CmsFaq[];
  isLoading: boolean;
}

let cachedCmsState: CmsState | null = null;
const listeners = new Set<(state: CmsState) => void>();

export function notifyCmsUpdated(state: CmsState) {
  cachedCmsState = state;
  listeners.forEach((listener) => listener(state));
}

let lastCmsRefreshAt = 0;
const CMS_REFRESH_TTL_MS = 60_000;

/**
 * Re-fetch CMS content. Background triggers (window focus) are TTL-gated
 * (M7/FE-20: stops the focus refetch storm); pass { force: true } for
 * mount and explicit admin-edit signals, which always fetch.
 */
export function refreshCms(options?: { force?: boolean }): Promise<void> {
  const now = Date.now();
  if (!options?.force && now - lastCmsRefreshAt < CMS_REFRESH_TTL_MS) {
    return Promise.resolve();
  }
  lastCmsRefreshAt = now;
  return fetch("/api/cms/content", { cache: "no-store" })
    .then((res) => res.json())
    .then((data) => {
      if (data.success) {
        const newState: CmsState = {
          settings: data.settings,
          services: data.services || [],
          pages: data.pages || [],
          homeSections: data.homeSections || null,
          teamMembers: data.teamMembers || [],
          testimonials: data.testimonials || [],
          faqs: data.faqs || [],
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
      teamMembers: initialData.teamMembers ?? [],
      testimonials: initialData.testimonials ?? [],
      faqs: initialData.faqs ?? [],
      isLoading: false,
    };
  }

  const [state, setState] = useState<CmsState>(
    cachedCmsState || {
      settings: initialData?.settings ?? null,
      services: initialData?.services ?? [],
      pages: initialData?.pages ?? [],
      homeSections: initialData?.homeSections ?? null,
      teamMembers: initialData?.teamMembers ?? [],
      testimonials: initialData?.testimonials ?? [],
      faqs: initialData?.faqs ?? [],
      isLoading: !initialData,
    }
  );

  useEffect(() => {
    listeners.add(setState);

    // Fetch fresh on mount so admin edits show immediately. The
    // cms-updated event (dispatched after admin saves) always forces;
    // window focus revalidates only when the cache is stale.
    refreshCms({ force: true });

    const handleCmsUpdated = () => {
      refreshCms({ force: true });
    };
    const handleFocus = () => {
      refreshCms();
    };

    window.addEventListener("cms-updated", handleCmsUpdated);
    window.addEventListener("focus", handleFocus);

    return () => {
      listeners.delete(setState);
      window.removeEventListener("cms-updated", handleCmsUpdated);
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  const getPageContent = (route: string): PageContentItem | undefined => {
    return state.pages.find((p) => p.route === route);
  };

  const getService = (slug: string): CmsService | undefined => {
    return state.services.find((s) => s.slug === slug || s.id === slug);
  };

  const getTeamMember = (id: string): CmsTeamMember | undefined => {
    return state.teamMembers.find((m) => m.id === id || m.name === id);
  };

  const getFaq = (id: string): CmsFaq | undefined => {
    return state.faqs.find((f) => f.id === id);
  };

  return {
    settings: state.settings,
    services: state.services,
    pages: state.pages,
    homeSections: state.homeSections,
    teamMembers: state.teamMembers,
    testimonials: state.testimonials,
    faqs: state.faqs,
    isLoading: state.isLoading,
    getPageContent,
    getService,
    getTeamMember,
    getFaq,
    refresh: refreshCms,
  };
}

