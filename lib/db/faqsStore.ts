import {
  cmsCacheGet,
  cmsCacheSet,
  getCmsClient,
  invalidateCmsCache,
  isCmsBackendConfigured,
} from "@/lib/db/cmsClient";
import type { Database } from "@/types/database.types";

type CmsDbClient = import("@supabase/supabase-js").SupabaseClient<Database>;

export interface CmsFaq {
  id: string;
  question: string;
  answer: string;
  category: string;
  page: string;
  displayOrder: number;
  isPublished: boolean;
  createdAt?: string;
  updatedAt?: string;
}

const CACHE_KEY = "cms:faqs";
// Legacy key: older versions persisted FAQs as JSON under site_settings.
// The `public.faqs` table is the single source of truth; this key is only
// read once to backfill the table, then never written again.
const LEGACY_SETTINGS_KEY = "faqs";

const INITIAL_FAQS: CmsFaq[] = [
  {
    id: "faq-1",
    question: "What documents are required to generate an e-Stamp Challan 32-A?",
    answer: "You need clear CNIC copies of all buyer/seller parties, property description or plot details, and Challan Form 32-A payment voucher. Our Chamber generates and verifies digital e-stamps within 15–30 minutes.",
    category: "E-Stamping",
    page: "home",
    displayOrder: 1,
    isPublished: true,
  },
  {
    id: "faq-2",
    question: "How long does property registry verification take at Chamber 121?",
    answer: "Standard Fard Malkiat verification and Baya-Nama drafting take same-day processing. Final Sub-Registrar execution and endorsement are typically scheduled within 1 to 3 business days.",
    category: "Property & Land",
    page: "home",
    displayOrder: 2,
    isPublished: true,
  },
  {
    id: "faq-3",
    question: "Can I file my annual FBR Income Tax return without visiting the court?",
    answer: "Yes, our Chamber provides end-to-end online tax return filing, salary wealth reconciliation, and business tax submissions via WhatsApp and email. Once filed, official CPRs and IRIS acknowledgment slips are delivered digitally.",
    category: "Taxation & FBR",
    page: "home",
    displayOrder: 3,
    isPublished: true,
  },
  {
    id: "faq-4",
    question: "What is the procedure for SECP private limited company registration?",
    answer: "We reserve company names through SECP eZpay, prepare Memorandum & Articles of Association, obtain digital signatures, and secure the Certificate of Incorporation alongside corporate NTN registration.",
    category: "Corporate Compliance",
    page: "home",
    displayOrder: 4,
    isPublished: true,
  },
  {
    id: "faq-5",
    question: "What are the official fees for non-judicial stamp papers in Punjab?",
    answer: "Standard non-judicial affidavits and undertakings range from PKR 50 to 1,000 based on the Punjab Stamp Act schedule. Property conveyance deeds are assessed at 1% of the official District Collector (DC) valuation table.",
    category: "E-Stamping",
    page: "home",
    displayOrder: 5,
    isPublished: true,
  },
  {
    id: "faq-6",
    question: "How do I apply for a Succession Certificate for bank accounts or inherited property?",
    answer: "You need the death certificate, NADRA Family Registration Certificate (FRC), CNIC copies of legal heirs, and property/bank balance proof. We facilitate both NADRA succession certification and Court succession proceedings.",
    category: "Family & Civil Law",
    page: "home",
    displayOrder: 6,
    isPublished: true,
  },
];

function mapRowToFaq(row: any): CmsFaq {
  return {
    id: row.id,
    question: row.question,
    answer: row.answer,
    category: row.category || "General",
    page: row.page || "home",
    displayOrder: row.display_order ?? 0,
    isPublished: row.is_published ?? true,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapFaqToRow(faq: CmsFaq): Record<string, unknown> {
  return {
    id: faq.id,
    question: faq.question,
    answer: faq.answer,
    category: faq.category || "General",
    page: faq.page || "home",
    display_order: faq.displayOrder ?? 0,
    is_published: faq.isPublished !== false,
    updated_at: new Date().toISOString(),
  };
}

function canWrite(): boolean {
  return !!process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
}

/**
 * Single source of truth: `public.faqs`.
 *
 * Reads come from the table. If the table is empty, a one-time backfill runs:
 * legacy FAQs stored under the old `site_settings` key are migrated into the
 * table; otherwise the built-in defaults are seeded into the table.
 */
export async function getAllFaqs(): Promise<CmsFaq[]> {
  const cached = cmsCacheGet<CmsFaq[]>(CACHE_KEY);
  if (cached) return cached;

  if (!isCmsBackendConfigured()) return INITIAL_FAQS;

  try {
    const client = await getCmsClient();
    if (!client) return INITIAL_FAQS;

    const { data: tableData, error: tableError } = await (client as any)
      .from("faqs")
      .select("*")
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: true });

    // Migration drift: if public.faqs was never created, fail LOUDLY instead
    // of silently serving hard-coded defaults as if they were live content.
    if (tableError) {
      const code = (tableError as { code?: string }).code || "";
      const msg = tableError.message || "";
      if (code === "PGRST205" || /could not find the table/i.test(msg)) {
        throw new Error(
          "[FaqsStore] public.faqs table is missing (migration drift). " +
            "Apply migration 20261008000003_table_backfill.sql in the Supabase SQL editor, " +
            "then retry. Refusing to serve fallback content."
        );
      }
    }

    if (!tableError && tableData && tableData.length > 0) {
      const items: CmsFaq[] = tableData.map(mapRowToFaq);
      cmsCacheSet(CACHE_KEY, items);
      return items;
    }

    // Table is empty: one-time backfill from the legacy site_settings key,
    // so previously saved FAQs are not lost.
    let seedItems: CmsFaq[] = INITIAL_FAQS;
    if (!tableError) {
      const { data: legacyData } = await (client as any)
        .from("site_settings")
        .select("value")
        .eq("key", LEGACY_SETTINGS_KEY)
        .maybeSingle();
      if (legacyData?.value && Array.isArray(legacyData.value) && legacyData.value.length > 0) {
        seedItems = legacyData.value as CmsFaq[];
      }
    }

    if (canWrite()) {
      const { error: seedError } = await (client as any)
        .from("faqs")
        .upsert(seedItems.map(mapFaqToRow), { onConflict: "id" });
      if (!seedError) {
        // Clear the legacy key now that the table owns the data.
        await (client as any).from("site_settings").delete().eq("key", LEGACY_SETTINGS_KEY);
      } else {
        console.error("[FaqsStore] Failed to seed faqs table:", seedError.message);
      }
    }

    cmsCacheSet(CACHE_KEY, seedItems);
    return seedItems;
  } catch (err) {
    console.error("[FaqsStore] Exception fetching FAQs, using defaults:", err);
    return INITIAL_FAQS;
  }
}

export async function getFaqById(id: string): Promise<CmsFaq | null> {
  const all = await getAllFaqs();
  return all.find((f) => f.id === id) || null;
}

/** Keep the denormalized homepage FAQ section in sync with the table. */
async function syncHomeSectionsFaqs(client: any, items: CmsFaq[]): Promise<void> {
  try {
    const { data: homeData } = await client
      .from("site_settings")
      .select("value")
      .eq("key", "home_sections")
      .maybeSingle();

    if (homeData?.value?.faqSection) {
      const homeSections = homeData.value;
      homeSections.faqSection.items = items
        .filter((f) => f.page === "home")
        .map((f) => ({
          id: f.id,
          question: f.question,
          answer: f.answer,
          order: f.displayOrder,
          visible: f.isPublished,
        }));
      await client
        .from("site_settings")
        .upsert({ key: "home_sections", value: homeSections }, { onConflict: "key" });
    }
  } catch (syncErr) {
    console.warn("[FaqsStore] Error syncing with home_sections:", syncErr);
  }
}

export async function saveFaq(data: Partial<CmsFaq>): Promise<CmsFaq> {
  const client = await getCmsClient();
  if (!client) {
    throw new Error("CMS backend is not configured: set NEXT_PUBLIC_SUPABASE_URL (and SUPABASE_SERVICE_ROLE_KEY for writes).");
  }

  if (!data.question || !data.question.trim()) {
    throw new Error("FAQ question is required.");
  }
  if (!data.answer || !data.answer.trim()) {
    throw new Error("FAQ answer is required.");
  }

  const all = await getAllFaqs();
  const now = new Date().toISOString();
  let savedItem: CmsFaq;

  if (data.id) {
    // Update existing
    const existingIndex = all.findIndex((f) => f.id === data.id);
    savedItem = {
      ...(existingIndex >= 0 ? all[existingIndex] : INITIAL_FAQS[0]),
      ...data,
      id: data.id,
      updatedAt: now,
    } as CmsFaq;

    if (existingIndex >= 0) {
      all[existingIndex] = savedItem;
    } else {
      all.push(savedItem);
    }
  } else {
    // Create new
    savedItem = {
      id: `faq-${Date.now()}`,
      question: data.question.trim(),
      answer: data.answer.trim(),
      category: data.category || "General",
      page: data.page || "home",
      displayOrder: data.displayOrder ?? all.length + 1,
      isPublished: data.isPublished !== false,
      createdAt: now,
      updatedAt: now,
    };
    all.push(savedItem);
  }

  // Persist to the single source of truth: the faqs table.
  const { error: upsertError } = await (client as any)
    .from("faqs")
    .upsert(mapFaqToRow(savedItem), { onConflict: "id" });
  if (upsertError) {
    throw new Error(`Failed to save FAQ: ${upsertError.message}`);
  }

  await syncHomeSectionsFaqs(client, all);

  invalidateCmsCache(CACHE_KEY);
  invalidateCmsCache("cms:home-sections");
  return savedItem;
}

export async function deleteFaq(id: string): Promise<boolean> {
  const client = await getCmsClient();
  if (!client) {
    throw new Error("CMS backend is not configured: set NEXT_PUBLIC_SUPABASE_URL (and SUPABASE_SERVICE_ROLE_KEY for writes).");
  }

  const { error: deleteError } = await (client as any).from("faqs").delete().eq("id", id);
  if (deleteError) {
    throw new Error(`Failed to delete FAQ: ${deleteError.message}`);
  }

  const remaining = (await getAllFaqs()).filter((f) => f.id !== id);
  invalidateCmsCache(CACHE_KEY);
  await syncHomeSectionsFaqs(client, remaining);

  invalidateCmsCache("cms:home-sections");
  return true;
}

export async function reorderFaqs(orderedIds: string[]): Promise<void> {
  const all = await getAllFaqs();
  const idMap = new Map(all.map((f) => [f.id, f]));

  const reordered: CmsFaq[] = [];
  orderedIds.forEach((id, index) => {
    const item = idMap.get(id);
    if (item) {
      item.displayOrder = index + 1;
      reordered.push(item);
      idMap.delete(id);
    }
  });

  // Append any remainder
  idMap.forEach((item) => {
    item.displayOrder = reordered.length + 1;
    reordered.push(item);
  });

  const client = await getCmsClient();
  if (client && canWrite()) {
    const now = new Date().toISOString();
    for (const item of reordered) {
      const { error } = await (client as any)
        .from("faqs")
        .update({ display_order: item.displayOrder, updated_at: now })
        .eq("id", item.id);
      if (error) {
        throw new Error(`Failed to reorder FAQs: ${error.message}`);
      }
    }
    await syncHomeSectionsFaqs(client, reordered);
  }

  invalidateCmsCache(CACHE_KEY);
  invalidateCmsCache("cms:home-sections");
}
