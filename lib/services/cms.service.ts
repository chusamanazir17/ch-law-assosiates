import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createPublicClient } from "@/lib/supabase/public";
import type { TeamMember, Testimonial } from "@/types/office";
import type { SiteAnnouncement, ConsultationInquiry, MediaAsset } from "@/types/cms";
import { SITE } from "@/lib/site";

// ==============================================================================
// 1. SITE SETTINGS SERVICE
// ==============================================================================
export async function getSiteSettings<T = Record<string, unknown>>(key = "general"): Promise<T | null> {
  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", key)
      .maybeSingle();

    if (error || !data) return null;
    return (data.value as T) || null;
  } catch (err) {
    console.warn("[CmsService] getSiteSettings error:", err);
    return null;
  }
}

export async function saveSiteSettings(key: string, value: Record<string, unknown>): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("site_settings")
    .upsert({
      key,
      value: value as any,
      updated_at: new Date().toISOString(),
    }, { onConflict: "key" });

  if (error) {
    throw new Error(`Failed to save site settings: ${error.message}`);
  }

  revalidatePath("/");
  revalidatePath("/admin/settings");
  revalidatePath("/admin/dashboard");
}

// ==============================================================================
// 2. TEAM MEMBERS SERVICE
// ==============================================================================
export async function listTeamMembers(): Promise<TeamMember[]> {
  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("team_members")
      .select("*")
      .order("sort_order", { ascending: true });

    if (error || !data || data.length === 0) {
      // Fallback to static SITE.contacts if table is not yet seeded
      return (SITE.contacts || []).map((c, idx) => ({
        id: `contact-${idx + 1}`,
        name: c.name,
        name_urdu: c.nameUrdu,
        role: c.role,
        role_urdu: c.roleUrdu,
        status: "current" as const,
        badge: idx === 0 ? "Senior Consultant" : "Associate",
        image_url: null,
        bio: `${c.name} - ${c.role}`,
        bio_urdu: `${c.nameUrdu} - ${c.roleUrdu}`,
        phone: c.phone || null,
        whatsapp: c.phone || null,
        sort_order: idx + 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));
    }

    return data as TeamMember[];
  } catch {
    return [];
  }
}

export async function saveTeamMember(input: Partial<TeamMember>): Promise<TeamMember> {
  const supabase = await createClient();
  const now = new Date().toISOString();

  if (input.id) {
    const { data, error } = await supabase
      .from("team_members")
      .update({
        name: input.name,
        name_urdu: input.name_urdu,
        role: input.role,
        role_urdu: input.role_urdu,
        status: input.status || "current",
        badge: input.badge,
        image_url: input.image_url,
        bio: input.bio,
        bio_urdu: input.bio_urdu,
        phone: input.phone,
        whatsapp: input.whatsapp,
        sort_order: input.sort_order ?? 0,
        updated_at: now,
      })
      .eq("id", input.id)
      .select()
      .single();

    if (error) throw new Error(`Failed to update team member: ${error.message}`);
    revalidatePath("/");
    revalidatePath("/about");
    return data as TeamMember;
  }

  const { data, error } = await supabase
    .from("team_members")
    .insert({
      name: input.name!,
      name_urdu: input.name_urdu,
      role: input.role!,
      role_urdu: input.role_urdu,
      status: input.status || "current",
      badge: input.badge,
      image_url: input.image_url,
      bio: input.bio,
      bio_urdu: input.bio_urdu,
      phone: input.phone,
      whatsapp: input.whatsapp,
      sort_order: input.sort_order ?? 0,
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to create team member: ${error.message}`);
  revalidatePath("/");
  revalidatePath("/about");
  return data as TeamMember;
}

export async function deleteTeamMember(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("team_members").delete().eq("id", id);
  if (error) throw new Error(`Failed to delete team member: ${error.message}`);
  revalidatePath("/");
  revalidatePath("/about");
}

// ==============================================================================
// 3. TESTIMONIALS SERVICE
// ==============================================================================
export async function listTestimonials(featuredOnly = true): Promise<Testimonial[]> {
  try {
    const supabase = createPublicClient();
    let query = supabase.from("testimonials").select("*").order("sort_order", { ascending: true });
    if (featuredOnly) query = query.eq("is_featured", true);

    const { data, error } = await query;
    if (error || !data) return [];
    return data as Testimonial[];
  } catch {
    return [];
  }
}

export async function saveTestimonial(input: Partial<Testimonial>): Promise<Testimonial> {
  const supabase = await createClient();
  if (input.id) {
    const { data, error } = await supabase
      .from("testimonials")
      .update({
        client_name: input.client_name,
        client_title: input.client_title,
        comment: input.comment,
        rating: input.rating,
        is_featured: input.is_featured,
        sort_order: input.sort_order ?? 0,
      })
      .eq("id", input.id)
      .select()
      .single();

    if (error) throw new Error(`Failed to update testimonial: ${error.message}`);
    revalidatePath("/");
    return data as Testimonial;
  }

  const { data, error } = await supabase
    .from("testimonials")
    .insert({
      client_name: input.client_name!,
      client_title: input.client_title,
      comment: input.comment!,
      rating: input.rating ?? 5,
      is_featured: input.is_featured ?? true,
      sort_order: input.sort_order ?? 0,
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to create testimonial: ${error.message}`);
  revalidatePath("/");
  return data as Testimonial;
}

export async function deleteTestimonial(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("testimonials").delete().eq("id", id);
  if (error) throw new Error(`Failed to delete testimonial: ${error.message}`);
  revalidatePath("/");
}

// ==============================================================================
// 4. ANNOUNCEMENTS & BANNERS SERVICE
// ==============================================================================
export async function listAnnouncements(activeOnly = false): Promise<SiteAnnouncement[]> {
  try {
    const supabase = createPublicClient();
    let query = supabase.from("site_announcements").select("*").order("created_at", { ascending: false });
    if (activeOnly) query = query.eq("is_active", true);

    const { data, error } = await query;
    if (error || !data) return [];
    return data as SiteAnnouncement[];
  } catch {
    return [];
  }
}

export async function saveAnnouncement(input: Partial<SiteAnnouncement>): Promise<SiteAnnouncement> {
  const supabase = await createClient();
  const now = new Date().toISOString();

  if (input.id) {
    const { data, error } = await supabase
      .from("site_announcements")
      .update({
        title: input.title,
        message: input.message,
        tone: input.tone || "info",
        is_active: input.is_active ?? false,
        link_url: input.link_url,
        link_text: input.link_text,
        updated_at: now,
      })
      .eq("id", input.id)
      .select()
      .single();

    if (error) throw new Error(`Failed to update announcement: ${error.message}`);
    revalidatePath("/");
    revalidatePath("/admin/announcements");
    return data as SiteAnnouncement;
  }

  const { data, error } = await supabase
    .from("site_announcements")
    .insert({
      title: input.title!,
      message: input.message!,
      tone: input.tone || "info",
      is_active: input.is_active ?? false,
      link_url: input.link_url,
      link_text: input.link_text,
      created_at: now,
      updated_at: now,
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to create announcement: ${error.message}`);
  revalidatePath("/");
  revalidatePath("/admin/announcements");
  return data as SiteAnnouncement;
}

// ==============================================================================
// 5. CONSULTATION INQUIRIES SERVICE
// ==============================================================================
export async function listInquiries(status?: string): Promise<ConsultationInquiry[]> {
  const supabase = await createClient();
  let query = supabase.from("consultation_inquiries").select("*").order("created_at", { ascending: false });
  if (status && status !== "all") query = query.eq("status", status as any);

  const { data, error } = await query;
  if (error) throw new Error(`Failed to load inquiries: ${error.message}`);
  return (data || []) as ConsultationInquiry[];
}

export async function updateInquiryStatus(id: string, status: "new" | "in_progress" | "completed" | "archived"): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("consultation_inquiries")
    .update({ status })
    .eq("id", id);

  if (error) throw new Error(`Failed to update inquiry status: ${error.message}`);
  revalidatePath("/admin/inquiries");
  revalidatePath("/admin/dashboard");
}

// ==============================================================================
// 6. MEDIA ASSETS SERVICE
// ==============================================================================
export async function listMediaAssets(): Promise<MediaAsset[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("media_assets")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Failed to load media assets: ${error.message}`);
  return (data || []) as MediaAsset[];
}
