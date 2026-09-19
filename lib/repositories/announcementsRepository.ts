import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";
import type { SiteAnnouncement } from "@/types/cms";
import * as announcementsStore from "@/lib/db/announcementsStore";

type DbClient = SupabaseClient<Database>;

export async function listAnnouncements(client?: DbClient | null): Promise<SiteAnnouncement[]> {
  if (client) {
    try {
      const { data, error } = await client
        .from("site_announcements")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data && data.length > 0) {
        return data as SiteAnnouncement[];
      }
    } catch (err) {
      console.warn("[AnnouncementsRepo] Supabase list failed, using local store:", err);
    }
  }

  return announcementsStore.getAllAnnouncements() as SiteAnnouncement[];
}

export async function getActiveNotice(client?: DbClient | null): Promise<SiteAnnouncement | null> {
  if (client) {
    try {
      const { data, error } = await client
        .from("site_announcements")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(1);

      if (!error && data && data.length > 0) {
        return data[0] as SiteAnnouncement;
      }
    } catch (err) {
      console.warn("[AnnouncementsRepo] Supabase getActive failed, using local store:", err);
    }
  }

  return announcementsStore.getActiveAnnouncement() as SiteAnnouncement | null;
}

export async function saveNotice(
  client: DbClient | null | undefined,
  input: {
    id?: string;
    title: string;
    message: string;
    tone?: "warning" | "danger" | "info" | "dark";
    link_url?: string | null;
    link_text?: string | null;
    is_active?: boolean;
  }
): Promise<SiteAnnouncement> {
  // Always persist to local store first
  const saved = announcementsStore.saveAnnouncement(input);

  // Sync to Supabase if connected
  if (client) {
    try {
      const payload = {
        title: saved.title,
        message: saved.message,
        tone: saved.tone,
        link_url: saved.link_url || null,
        link_text: saved.link_text || null,
        is_active: saved.is_active,
        updated_at: saved.updated_at,
      };

      if (input.id) {
        await client.from("site_announcements").update(payload).eq("id", input.id);
      } else {
        await client.from("site_announcements").insert(payload);
      }
    } catch (err) {
      console.warn("[AnnouncementsRepo] Supabase sync failed:", err);
    }
  }

  return saved as SiteAnnouncement;
}

export async function toggleNotice(client: DbClient | null | undefined, id: string): Promise<SiteAnnouncement | null> {
  const updated = announcementsStore.toggleAnnouncementActive(id);

  if (client && updated) {
    try {
      await client
        .from("site_announcements")
        .update({ is_active: updated.is_active, updated_at: updated.updated_at })
        .eq("id", id);
    } catch (err) {
      console.warn("[AnnouncementsRepo] Supabase toggle failed:", err);
    }
  }

  return updated as SiteAnnouncement | null;
}

export async function deleteNotice(client: DbClient | null | undefined, id: string): Promise<boolean> {
  const success = announcementsStore.deleteAnnouncement(id);

  if (client && success) {
    try {
      await client.from("site_announcements").delete().eq("id", id);
    } catch (err) {
      console.warn("[AnnouncementsRepo] Supabase delete failed:", err);
    }
  }

  return success;
}
