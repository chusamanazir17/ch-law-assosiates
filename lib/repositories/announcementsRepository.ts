import { cmsCacheGet, cmsCacheSet, getCmsClient, invalidateCmsCache, isCmsBackendConfigured } from "@/lib/db/cmsClient";
import type { Database } from "@/types/database.types";
import type { SiteAnnouncement } from "@/types/cms";

/**
 * Supabase-backed repository for site announcements (`site_announcements`).
 * Server-side only: writes use the service-role client when available so
 * admin API routes can persist changes regardless of the admin session type.
 */

type CmsDbClient = import("@supabase/supabase-js").SupabaseClient<Database>;

const CACHE_KEY = "cms:announcements";

export async function listAnnouncements(): Promise<SiteAnnouncement[]> {
  const cached = cmsCacheGet<SiteAnnouncement[]>(CACHE_KEY);
  if (cached) return cached;

  if (!isCmsBackendConfigured()) return [];

  const client = await getCmsClient();
  if (!client) return [];

  const { data, error } = await (client as CmsDbClient)
    .from("site_announcements")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[AnnouncementsRepo] Failed to list announcements:", error.message);
    return [];
  }

  const announcements = (data ?? []) as SiteAnnouncement[];
  cmsCacheSet(CACHE_KEY, announcements);
  return announcements;
}

export async function getActiveNotice(): Promise<SiteAnnouncement | null> {
  if (!isCmsBackendConfigured()) return null;

  const client = await getCmsClient();
  if (!client) return null;

  const { data, error } = await (client as CmsDbClient)
    .from("site_announcements")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(1);

  if (error) {
    console.error("[AnnouncementsRepo] Failed to fetch active notice:", error.message);
    return null;
  }

  return (data?.[0] as SiteAnnouncement) ?? null;
}

export async function saveNotice(input: {
  id?: string;
  title: string;
  message: string;
  tone?: "warning" | "danger" | "info" | "dark";
  link_url?: string | null;
  link_text?: string | null;
  is_active?: boolean;
}): Promise<SiteAnnouncement> {
  const client = await getCmsClient();
  if (!client) {
    throw new Error("CMS backend is not configured: set NEXT_PUBLIC_SUPABASE_URL (and SUPABASE_SERVICE_ROLE_KEY for writes).");
  }
  const db = client as CmsDbClient;

  const payload = {
    title: input.title,
    message: input.message,
    tone: input.tone ?? "info",
    link_url: input.link_url ?? null,
    link_text: input.link_text ?? null,
    is_active: input.is_active ?? true,
    updated_at: new Date().toISOString(),
  };

  if (input.id) {
    const { data, error } = await db
      .from("site_announcements")
      .update(payload)
      .eq("id", input.id)
      .select("*")
      .single();
    if (error) throw error;
    invalidateCmsCache(CACHE_KEY);
    return data as SiteAnnouncement;
  }

  const { data, error } = await db
    .from("site_announcements")
    .insert(payload)
    .select("*")
    .single();
  if (error) throw error;
  invalidateCmsCache(CACHE_KEY);
  return data as SiteAnnouncement;
}

export async function toggleNotice(id: string): Promise<SiteAnnouncement | null> {
  const client = await getCmsClient();
  if (!client) {
    throw new Error("CMS backend is not configured: set NEXT_PUBLIC_SUPABASE_URL (and SUPABASE_SERVICE_ROLE_KEY for writes).");
  }
  const db = client as CmsDbClient;

  const { data: existing } = await db
    .from("site_announcements")
    .select("id, is_active")
    .eq("id", id)
    .maybeSingle();

  if (!existing) return null;

  const { data, error } = await db
    .from("site_announcements")
    .update({ is_active: !existing.is_active, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw error;
  invalidateCmsCache(CACHE_KEY);
  return data as SiteAnnouncement;
}

export async function deleteNotice(id: string): Promise<boolean> {
  const client = await getCmsClient();
  if (!client) {
    throw new Error("CMS backend is not configured: set NEXT_PUBLIC_SUPABASE_URL (and SUPABASE_SERVICE_ROLE_KEY for writes).");
  }
  const db = client as CmsDbClient;

  const { data, error } = await db
    .from("site_announcements")
    .delete()
    .eq("id", id)
    .select("id");

  if (error) throw error;
  const deleted = (data ?? []).length > 0;
  if (deleted) invalidateCmsCache(CACHE_KEY);
  return deleted;
}
