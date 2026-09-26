import {
  cmsCacheGet,
  cmsCacheSet,
  getCmsClient,
  invalidateCmsCache,
  isCmsBackendConfigured,
} from "@/lib/db/cmsClient";
import { OWNERS } from "@/lib/owners";
import type { Database } from "@/types/database.types";

type CmsDbClient = import("@supabase/supabase-js").SupabaseClient<Database>;

export interface CmsTeamMember {
  id: string;
  name: string;
  nameUrdu: string;
  role: string;
  roleUrdu: string;
  status: "current" | "late";
  badge: string;
  imageUrl: string;
  bio: string;
  bioUrdu: string;
  phone: string;
  whatsapp: string;
  sortOrder: number;
  createdAt?: string;
  updatedAt?: string;
}

const CACHE_KEY = "cms:team-members";

type TeamRow = Database["public"]["Tables"]["team_members"]["Row"];

function rowToMember(row: TeamRow): CmsTeamMember {
  return {
    id: row.id,
    name: row.name,
    nameUrdu: row.name_urdu || "",
    role: row.role,
    roleUrdu: row.role_urdu || "",
    status: row.status,
    badge: row.badge || "",
    imageUrl: row.image_url || "",
    bio: row.bio || "",
    bioUrdu: row.bio_urdu || "",
    phone: row.phone || "",
    whatsapp: row.whatsapp || "",
    sortOrder: row.sort_order ?? 0,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function memberToRow(m: Partial<CmsTeamMember>) {
  return {
    name: m.name || "",
    name_urdu: m.nameUrdu || null,
    role: m.role || "",
    role_urdu: m.roleUrdu || null,
    status: m.status || "current",
    badge: m.badge || null,
    image_url: m.imageUrl || null,
    bio: m.bio || null,
    bio_urdu: m.bioUrdu || null,
    phone: m.phone || null,
    whatsapp: m.whatsapp || null,
    sort_order: m.sortOrder ?? 0,
  };
}

function getFallbackTeamMembers(): CmsTeamMember[] {
  return OWNERS.map((o, idx) => ({
    id: o.id,
    name: o.name,
    nameUrdu: o.nameUrdu || "",
    role: o.role,
    roleUrdu: o.roleUrdu || "",
    status: o.status,
    badge: o.badge || "",
    imageUrl: o.image || "",
    bio: o.bio || "",
    bioUrdu: o.bioUrdu || "",
    phone: o.phone || "",
    whatsapp: o.whatsapp || "",
    sortOrder: idx + 1,
  }));
}

export async function getAllTeamMembers(): Promise<CmsTeamMember[]> {
  const cached = cmsCacheGet<CmsTeamMember[]>(CACHE_KEY);
  if (cached) return cached;

  if (!isCmsBackendConfigured()) return getFallbackTeamMembers();

  try {
    const client = await getCmsClient();
    if (!client) return getFallbackTeamMembers();

    const { data, error } = await (client as CmsDbClient)
      .from("team_members")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });

    if (error) {
      console.error("[TeamMembersStore] Failed to fetch team members from Supabase:", error.message);
      return getFallbackTeamMembers();
    }

    if (!data || data.length === 0) {
      return getFallbackTeamMembers();
    }

    const members = data.map(rowToMember);
    cmsCacheSet(CACHE_KEY, members);
    return members;
  } catch (err) {
    console.error("[TeamMembersStore] Exception fetching team members:", err);
    return getFallbackTeamMembers();
  }
}

export async function getTeamMemberById(id: string): Promise<CmsTeamMember | null> {
  const all = await getAllTeamMembers();
  return all.find((m) => m.id === id) || null;
}

export async function saveTeamMember(data: Partial<CmsTeamMember>): Promise<CmsTeamMember> {
  const client = await getCmsClient();
  if (!client) {
    throw new Error("CMS backend is not configured: set NEXT_PUBLIC_SUPABASE_URL (and SUPABASE_SERVICE_ROLE_KEY for writes).");
  }
  const db = client as CmsDbClient;

  if (!data.name || !data.name.trim()) {
    throw new Error("Team member full name is required.");
  }
  if (!data.role || !data.role.trim()) {
    throw new Error("Team member role/designation is required.");
  }

  const row = memberToRow(data);

  if (data.id && data.id.includes("-") && data.id.length >= 30) {
    // Existing UUID
    const { data: updated, error } = await db
      .from("team_members")
      .update(row)
      .eq("id", data.id)
      .select("*")
      .single();

    if (error) throw error;
    invalidateCmsCache(CACHE_KEY);
    return rowToMember(updated);
  } else {
    // New entry
    const { data: inserted, error } = await db
      .from("team_members")
      .insert(row)
      .select("*")
      .single();

    if (error) throw error;
    invalidateCmsCache(CACHE_KEY);
    return rowToMember(inserted);
  }
}

export async function deleteTeamMember(id: string): Promise<boolean> {
  const client = await getCmsClient();
  if (!client) {
    throw new Error("CMS backend is not configured: set NEXT_PUBLIC_SUPABASE_URL (and SUPABASE_SERVICE_ROLE_KEY for writes).");
  }
  const db = client as CmsDbClient;

  const { error } = await db.from("team_members").delete().eq("id", id);
  if (error) throw error;

  invalidateCmsCache(CACHE_KEY);
  return true;
}

export async function reorderTeamMembers(orderedIds: string[]): Promise<void> {
  const client = await getCmsClient();
  if (!client) return;
  const db = client as CmsDbClient;

  for (let i = 0; i < orderedIds.length; i++) {
    await db
      .from("team_members")
      .update({ sort_order: i + 1 })
      .eq("id", orderedIds[i]);
  }

  invalidateCmsCache(CACHE_KEY);
}
