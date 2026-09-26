import {
  cmsCacheGet,
  cmsCacheSet,
  getCmsClient,
  invalidateCmsCache,
  isCmsBackendConfigured,
} from "@/lib/db/cmsClient";
import type { Database } from "@/types/database.types";

type CmsDbClient = import("@supabase/supabase-js").SupabaseClient<Database>;

export interface CmsTestimonial {
  id: string;
  clientName: string;
  clientTitle: string;
  comment: string;
  rating: number;
  isFeatured: boolean;
  sortOrder: number;
  createdAt?: string;
}

const CACHE_KEY = "cms:testimonials";

type TestimonialRow = Database["public"]["Tables"]["testimonials"]["Row"];

function rowToTestimonial(row: TestimonialRow): CmsTestimonial {
  return {
    id: row.id,
    clientName: row.client_name,
    clientTitle: row.client_title || "",
    comment: row.comment,
    rating: row.rating,
    isFeatured: row.is_featured,
    sortOrder: row.sort_order ?? 0,
    createdAt: row.created_at,
  };
}

function testimonialToRow(t: Partial<CmsTestimonial>) {
  return {
    client_name: t.clientName || "",
    client_title: t.clientTitle || null,
    comment: t.comment || "",
    rating: Math.min(5, Math.max(1, t.rating ?? 5)),
    is_featured: t.isFeatured ?? true,
    sort_order: t.sortOrder ?? 0,
  };
}

const FALLBACK_TESTIMONIALS: CmsTestimonial[] = [
  {
    id: "58e5d15b-44fa-412d-8264-bb79b4356a1a",
    clientName: "Chaudhry Tariq Mehmood",
    clientTitle: "Agricultural Property Owner, Sahiwal",
    comment: "Chamber 121 made our property transfer and e-stamp generation completely hassle-free. Extremely professional service.",
    rating: 5,
    isFeatured: true,
    sortOrder: 1,
  },
  {
    id: "7db0c7d1-9583-4864-8d46-43f7b92bc8fa",
    clientName: "Malik Imran Aslam",
    clientTitle: "Managing Director, Sahiwal Cotton Ginners",
    comment: "Usama Ch handles all our corporate income tax returns and PRA sales tax filings. Accurate, punctual, and reliable.",
    rating: 5,
    isFeatured: true,
    sortOrder: 2,
  },
  {
    id: "968fe9fa-c987-4c4e-934c-d091e90ee458",
    clientName: "Dr. Farooq Tariq",
    clientTitle: "Consultant Physician, DHQ Hospital",
    comment: "Got my NTN registration and annual wealth statement filed in less than 24 hours. Highest recommendation for Chamber 121.",
    rating: 5,
    isFeatured: true,
    sortOrder: 3,
  },
];

export async function getAllTestimonials(): Promise<CmsTestimonial[]> {
  const cached = cmsCacheGet<CmsTestimonial[]>(CACHE_KEY);
  if (cached) return cached;

  if (!isCmsBackendConfigured()) return FALLBACK_TESTIMONIALS;

  try {
    const client = await getCmsClient();
    if (!client) return FALLBACK_TESTIMONIALS;

    const { data, error } = await (client as CmsDbClient)
      .from("testimonials")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });

    if (error) {
      console.error("[TestimonialsStore] Failed to fetch testimonials from Supabase:", error.message);
      return FALLBACK_TESTIMONIALS;
    }

    if (!data || data.length === 0) {
      return FALLBACK_TESTIMONIALS;
    }

    const items = data.map(rowToTestimonial);
    cmsCacheSet(CACHE_KEY, items);
    return items;
  } catch (err) {
    console.error("[TestimonialsStore] Exception fetching testimonials:", err);
    return FALLBACK_TESTIMONIALS;
  }
}

export async function getTestimonialById(id: string): Promise<CmsTestimonial | null> {
  const all = await getAllTestimonials();
  return all.find((t) => t.id === id) || null;
}

export async function saveTestimonial(data: Partial<CmsTestimonial>): Promise<CmsTestimonial> {
  const client = await getCmsClient();
  if (!client) {
    throw new Error("CMS backend is not configured: set NEXT_PUBLIC_SUPABASE_URL (and SUPABASE_SERVICE_ROLE_KEY for writes).");
  }
  const db = client as CmsDbClient;

  if (!data.clientName || !data.clientName.trim()) {
    throw new Error("Client name is required.");
  }
  if (!data.comment || !data.comment.trim()) {
    throw new Error("Testimonial review text is required.");
  }

  const row = testimonialToRow(data);

  if (data.id && data.id.includes("-") && data.id.length >= 30) {
    // Existing UUID
    const { data: updated, error } = await db
      .from("testimonials")
      .update(row)
      .eq("id", data.id)
      .select("*")
      .single();

    if (error) throw error;
    invalidateCmsCache(CACHE_KEY);
    return rowToTestimonial(updated);
  } else {
    // New entry
    const { data: inserted, error } = await db
      .from("testimonials")
      .insert(row)
      .select("*")
      .single();

    if (error) throw error;
    invalidateCmsCache(CACHE_KEY);
    return rowToTestimonial(inserted);
  }
}

export async function deleteTestimonial(id: string): Promise<boolean> {
  const client = await getCmsClient();
  if (!client) {
    throw new Error("CMS backend is not configured: set NEXT_PUBLIC_SUPABASE_URL (and SUPABASE_SERVICE_ROLE_KEY for writes).");
  }
  const db = client as CmsDbClient;

  const { error } = await db.from("testimonials").delete().eq("id", id);
  if (error) throw error;

  invalidateCmsCache(CACHE_KEY);
  return true;
}

export async function reorderTestimonials(orderedIds: string[]): Promise<void> {
  const client = await getCmsClient();
  if (!client) return;
  const db = client as CmsDbClient;

  for (let i = 0; i < orderedIds.length; i++) {
    await db
      .from("testimonials")
      .update({ sort_order: i + 1 })
      .eq("id", orderedIds[i]);
  }

  invalidateCmsCache(CACHE_KEY);
}
