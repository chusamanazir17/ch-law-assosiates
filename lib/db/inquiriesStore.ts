import { getSupabasePublicConfig } from "@/config/env";
import { createServiceClient } from "@/lib/supabase/service";
import type { ConsultationInquiry } from "@/types/cms";

/**
 * Server-side store for consultation inquiries, persisted in Supabase
 * (`consultation_inquiries`). All writes go through the service-role client
 * because anonymous clients are blocked from inserting by RLS and admin
 * sessions may be env-credential based (no Supabase JWT).
 */

export async function getAllInquiries(): Promise<ConsultationInquiry[]> {
  const config = getSupabasePublicConfig();
  if (!config) {
    console.error("[InquiriesStore] Supabase is not configured; cannot list inquiries.");
    return [];
  }

  const client = createServiceClient();
  const { data, error } = await client
    .from("consultation_inquiries")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[InquiriesStore] Failed to list inquiries:", error.message);
    return [];
  }

  return (data ?? []) as ConsultationInquiry[];
}

export async function addInquiry(payload: {
  name: string;
  phone: string;
  service: string;
  message?: string;
  email?: string;
}): Promise<ConsultationInquiry> {
  const config = getSupabasePublicConfig();
  if (!config) {
    throw new Error("Supabase is not configured: cannot save inquiry.");
  }

  const client = createServiceClient();
  const now = new Date().toISOString();
  const newInquiry: ConsultationInquiry = {
    id: crypto.randomUUID(),
    name: payload.name.trim(),
    phone: payload.phone.trim(),
    email: payload.email?.trim() || null,
    service_needed: payload.service.trim(),
    message: payload.message?.trim() || null,
    status: "new",
    created_at: now,
  };

  const { data, error } = await client
    .from("consultation_inquiries")
    .insert({
      name: newInquiry.name,
      phone: newInquiry.phone,
      email: newInquiry.email,
      service_needed: newInquiry.service_needed,
      message: newInquiry.message,
      status: "new",
    })
    .select("*")
    .single();

  if (error) {
    console.error("[InquiriesStore] Failed to save inquiry:", error.message);
    throw new Error(`Failed to save inquiry: ${error.message}`);
  }

  return data as ConsultationInquiry;
}

export async function updateInquiryStatus(
  id: string,
  status: ConsultationInquiry["status"]
): Promise<boolean> {
  const config = getSupabasePublicConfig();
  if (!config) {
    throw new Error("Supabase is not configured: cannot update inquiry.");
  }

  const client = createServiceClient();
  const { error } = await client
    .from("consultation_inquiries")
    .update({ status })
    .eq("id", id);

  if (error) {
    console.error("[InquiriesStore] Failed to update inquiry status:", error.message);
    return false;
  }
  return true;
}

export async function deleteInquiry(id: string): Promise<boolean> {
  const config = getSupabasePublicConfig();
  if (!config) {
    throw new Error("Supabase is not configured: cannot delete inquiry.");
  }

  const client = createServiceClient();
  const { error } = await client.from("consultation_inquiries").delete().eq("id", id);

  if (error) {
    console.error("[InquiriesStore] Failed to delete inquiry:", error.message);
    return false;
  }
  return true;
}
