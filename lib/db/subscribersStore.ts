import fs from "fs";
import path from "path";
import { getSupabasePublicConfig } from "@/config/env";
import { createServiceClient } from "@/lib/supabase/service";
import type { SubscriberWithCategories, TaxCategory } from "@/types/reminders";

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "subscribers.json");

export const TAX_CATEGORY_MAP: Record<string, TaxCategory> = {
  "income-tax-individuals": {
    id: "income-tax-individuals",
    name: "Income Tax - Individuals & Salaried",
    slug: "income-tax-individuals",
    description: "Annual FBR returns",
    is_active: true,
    sort_order: 1,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  },
  "business-corporate-tax": {
    id: "business-corporate-tax",
    name: "Business & Corporate Tax",
    slug: "business-corporate-tax",
    description: "AOP, Sole Proprietor, Private Ltd",
    is_active: true,
    sort_order: 2,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  },
  "sales-tax-pra": {
    id: "sales-tax-pra",
    name: "Sales Tax (Federal & PRA)",
    slug: "sales-tax-pra",
    description: "Monthly sales tax returns",
    is_active: true,
    sort_order: 3,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  },
  "withholding-tax": {
    id: "withholding-tax",
    name: "Withholding Tax Statements",
    slug: "withholding-tax",
    description: "Periodic withholding statements",
    is_active: true,
    sort_order: 4,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  },
  "property-tax-stamp-duty": {
    id: "property-tax-stamp-duty",
    name: "Property & Capital Value Tax",
    slug: "property-tax-stamp-duty",
    description: "E-Stamp duty and transfer deadlines",
    is_active: true,
    sort_order: 5,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  },
};

const SEED_SUBSCRIBERS: SubscriberWithCategories[] = [
  {
    id: "sub-seed-1",
    name: "Muhammad Tariq",
    email: "tariq.sahiwal@gmail.com",
    status: "active",
    consent_at: "2026-09-10T10:15:00Z",
    consent_text_version: "v1.0",
    confirmed_at: "2026-09-10T10:20:00Z",
    created_at: "2026-09-10T10:15:00Z",
    updated_at: "2026-09-10T10:20:00Z",
    categories: [
      TAX_CATEGORY_MAP["income-tax-individuals"],
      TAX_CATEGORY_MAP["business-corporate-tax"],
    ],
  },
  {
    id: "sub-seed-2",
    name: "Chaudhry Farooq",
    email: "farooq.enterprises@yahoo.com",
    status: "active",
    consent_at: "2026-09-12T14:30:00Z",
    consent_text_version: "v1.0",
    confirmed_at: "2026-09-12T14:32:00Z",
    created_at: "2026-09-12T14:30:00Z",
    updated_at: "2026-09-12T14:32:00Z",
    categories: [
      TAX_CATEGORY_MAP["sales-tax-pra"],
      TAX_CATEGORY_MAP["property-tax-stamp-duty"],
    ],
  },
];

function ensureDataFile(): SubscriberWithCategories[] {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(
        DATA_FILE,
        JSON.stringify(SEED_SUBSCRIBERS, null, 2),
        "utf8"
      );
      return SEED_SUBSCRIBERS;
    }
    const raw = fs.readFileSync(DATA_FILE, "utf8");
    return JSON.parse(raw) as SubscriberWithCategories[];
  } catch (error) {
    console.error("[SubscribersStore] Error reading file:", error);
    return SEED_SUBSCRIBERS;
  }
}

function writeDataFile(subs: SubscriberWithCategories[]): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(subs, null, 2), "utf8");
  } catch (error) {
    console.error("[SubscribersStore] Error writing file:", error);
  }
}

export async function getAllSubscribers(): Promise<SubscriberWithCategories[]> {
  const localSubs = ensureDataFile();

  // If Supabase is configured, attempt to merge with Supabase records
  const config = getSupabasePublicConfig();
  if (config) {
    try {
      const client = createServiceClient();
      const { data: dbSubs, error } = await client
        .from("subscribers")
        .select(`
          id,
          name,
          email,
          status,
          consent_at,
          consent_text_version,
          confirmed_at,
          created_at,
          updated_at,
          subscriber_categories (
            category_id,
            tax_categories ( id, name, slug, description, is_active, sort_order, created_at, updated_at )
          )
        `)
        .order("created_at", { ascending: false });

      if (!error && dbSubs && dbSubs.length > 0) {
        const dbMapped: SubscriberWithCategories[] = dbSubs.map((sub: any) => ({
          id: sub.id,
          name: sub.name,
          email: sub.email,
          status: sub.status,
          consent_at: sub.consent_at,
          consent_text_version: sub.consent_text_version,
          confirmed_at: sub.confirmed_at,
          created_at: sub.created_at,
          updated_at: sub.updated_at,
          categories: (sub.subscriber_categories || [])
            .map((sc: any) => sc.tax_categories)
            .filter(Boolean),
        }));

        const mergedMap = new Map<string, SubscriberWithCategories>();
        localSubs.forEach((s) => mergedMap.set(s.email.toLowerCase(), s));
        dbMapped.forEach((s) => mergedMap.set(s.email.toLowerCase(), s));

        const merged = Array.from(mergedMap.values()).sort(
          (a, b) =>
            new Date(b.created_at || "").getTime() -
            new Date(a.created_at || "").getTime()
        );

        writeDataFile(merged);
        return merged;
      }
    } catch {
      // Non-fatal, fallback to local store
    }
  }

  return localSubs;
}

export async function addOrUpdateSubscriber(payload: {
  name: string;
  email: string;
  categoryIds: string[];
  consent?: boolean;
}): Promise<SubscriberWithCategories> {
  const all = ensureDataFile();
  const normalizedEmail = payload.email.trim().toLowerCase();
  const now = new Date().toISOString();

  // Resolve category objects
  const categories: TaxCategory[] = (
    payload.categoryIds.length > 0
      ? payload.categoryIds
      : ["income-tax-individuals", "business-corporate-tax"]
  ).map(
    (id) =>
      TAX_CATEGORY_MAP[id] || {
        id,
        name: id.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
        slug: id,
        description: "Tax & Compliance Reminders",
        is_active: true,
        sort_order: 99,
        created_at: now,
        updated_at: now,
      }
  );

  const existingIdx = all.findIndex(
    (s) => s.email.toLowerCase() === normalizedEmail
  );

  let subscriber: SubscriberWithCategories;

  if (existingIdx >= 0) {
    subscriber = {
      ...all[existingIdx],
      name: payload.name.trim() || all[existingIdx].name,
      status: "active",
      categories,
      updated_at: now,
      confirmed_at: all[existingIdx].confirmed_at || now,
    };
    all[existingIdx] = subscriber;
  } else {
    subscriber = {
      id: `sub-${Date.now()}`,
      name: payload.name.trim() || normalizedEmail.split("@")[0],
      email: normalizedEmail,
      status: "active",
      consent_at: now,
      consent_text_version: "v1.0",
      confirmed_at: now,
      created_at: now,
      updated_at: now,
      categories,
    };
    all.unshift(subscriber);
  }

  // Persist to local database
  writeDataFile(all);

  // If Supabase is configured, sync to Supabase database
  const config = getSupabasePublicConfig();
  if (config) {
    try {
      const client = createServiceClient();
      const { data: dbSub } = await client
        .from("subscribers")
        .upsert(
          {
            name: subscriber.name,
            email: subscriber.email,
            status: "active",
            consent_at: subscriber.consent_at,
            confirmed_at: subscriber.confirmed_at,
            updated_at: now,
          },
          { onConflict: "email" }
        )
        .select("id")
        .single();

      if (dbSub?.id && payload.categoryIds.length > 0) {
        const rows = payload.categoryIds.map((catId) => ({
          subscriber_id: dbSub.id,
          category_id: catId,
        }));
        await client
          .from("subscriber_categories")
          .upsert(rows, { onConflict: "subscriber_id,category_id" });
      }
    } catch (err) {
      console.warn("[SubscribersStore] Supabase sync skipped (local store saved).");
    }
  }

  return subscriber;
}

export async function updateSubscriberStatus(
  id: string,
  status: "active" | "pending" | "unsubscribed" | "suppressed"
): Promise<boolean> {
  const all = ensureDataFile();
  const idx = all.findIndex((s) => s.id === id || s.email.toLowerCase() === id.toLowerCase());

  if (idx >= 0) {
    all[idx].status = status;
    all[idx].updated_at = new Date().toISOString();
    writeDataFile(all);
  }

  const config = getSupabasePublicConfig();
  if (config) {
    try {
      const client = createServiceClient();
      await client
        .from("subscribers")
        .update({ status, updated_at: new Date().toISOString() })
        .or(`id.eq.${id},email.eq.${id}`);
    } catch {
      // Local persistence is primary
    }
  }

  return true;
}
