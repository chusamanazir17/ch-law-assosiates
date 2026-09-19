import fs from "fs";
import path from "path";

export interface AnnouncementItem {
  id: string;
  title: string;
  message: string;
  tone: "warning" | "danger" | "info" | "dark";
  link_url?: string | null;
  link_text?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const DATA_DIR = path.join(process.cwd(), "data");
const ANNOUNCEMENTS_FILE = path.join(DATA_DIR, "announcements.json");

export const DEFAULT_ANNOUNCEMENTS: AnnouncementItem[] = [
  {
    id: "ann-fbr-filing-2026",
    title: "FBR Tax Filing & ATL Compliance Notice",
    message: "Active Taxpayer List (ATL) verification and statutory compliance services are actively processed at Chamber 121, District Court Sahiwal.",
    tone: "warning",
    link_url: "/services/fbr-tax-filing",
    link_text: "View Details",
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

function ensureFileExists() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(ANNOUNCEMENTS_FILE)) {
    fs.writeFileSync(ANNOUNCEMENTS_FILE, JSON.stringify(DEFAULT_ANNOUNCEMENTS, null, 2), "utf-8");
  }
}

export function getAllAnnouncements(): AnnouncementItem[] {
  try {
    ensureFileExists();
    const raw = fs.readFileSync(ANNOUNCEMENTS_FILE, "utf-8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : DEFAULT_ANNOUNCEMENTS;
  } catch (error) {
    console.error("[AnnouncementsStore] Failed to read announcements:", error);
    return DEFAULT_ANNOUNCEMENTS;
  }
}

export function getActiveAnnouncement(): AnnouncementItem | null {
  const all = getAllAnnouncements();
  return all.find((a) => a.is_active) || null;
}

export function saveAnnouncement(input: {
  id?: string;
  title: string;
  message: string;
  tone?: "warning" | "danger" | "info" | "dark";
  link_url?: string | null;
  link_text?: string | null;
  is_active?: boolean;
}): AnnouncementItem {
  ensureFileExists();
  const all = getAllAnnouncements();
  const now = new Date().toISOString();

  if (input.id) {
    const idx = all.findIndex((a) => a.id === input.id);
    if (idx !== -1) {
      const updated: AnnouncementItem = {
        ...all[idx],
        title: input.title.trim(),
        message: input.message.trim(),
        tone: input.tone || all[idx].tone || "warning",
        link_url: input.link_url !== undefined ? input.link_url : all[idx].link_url,
        link_text: input.link_text !== undefined ? input.link_text : all[idx].link_text,
        is_active: input.is_active !== undefined ? input.is_active : all[idx].is_active,
        updated_at: now,
      };

      // If set to active, deactivate other announcements to ensure clean single notice
      if (updated.is_active) {
        all.forEach((a, i) => {
          if (i !== idx) a.is_active = false;
        });
      }

      all[idx] = updated;
      fs.writeFileSync(ANNOUNCEMENTS_FILE, JSON.stringify(all, null, 2), "utf-8");
      return updated;
    }
  }

  // Create new
  const newId = `ann-${Date.now()}`;
  const newItem: AnnouncementItem = {
    id: newId,
    title: input.title.trim(),
    message: input.message.trim(),
    tone: input.tone || "warning",
    link_url: input.link_url || null,
    link_text: input.link_text || null,
    is_active: input.is_active !== undefined ? input.is_active : true,
    created_at: now,
    updated_at: now,
  };

  if (newItem.is_active) {
    all.forEach((a) => {
      a.is_active = false;
    });
  }

  all.unshift(newItem);
  fs.writeFileSync(ANNOUNCEMENTS_FILE, JSON.stringify(all, null, 2), "utf-8");
  return newItem;
}

export function toggleAnnouncementActive(id: string): AnnouncementItem | null {
  ensureFileExists();
  const all = getAllAnnouncements();
  const idx = all.findIndex((a) => a.id === id);
  if (idx === -1) return null;

  const newStatus = !all[idx].is_active;

  if (newStatus) {
    all.forEach((a) => {
      a.is_active = false;
    });
  }

  all[idx].is_active = newStatus;
  all[idx].updated_at = new Date().toISOString();

  fs.writeFileSync(ANNOUNCEMENTS_FILE, JSON.stringify(all, null, 2), "utf-8");
  return all[idx];
}

export function deleteAnnouncement(id: string): boolean {
  ensureFileExists();
  const all = getAllAnnouncements();
  const filtered = all.filter((a) => a.id !== id);
  if (filtered.length === all.length) return false;

  fs.writeFileSync(ANNOUNCEMENTS_FILE, JSON.stringify(filtered, null, 2), "utf-8");
  return true;
}
