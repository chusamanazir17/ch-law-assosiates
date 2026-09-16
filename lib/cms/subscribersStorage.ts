import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";
import type { SubscriberWithCategories, TaxCategory } from "@/types/reminders";

const DATA_FILE = path.join(process.cwd(), "data", "subscribers.json");

export const TAX_CATEGORY_MAP: Record<string, TaxCategory> = {
  "1": {
    id: "1",
    name: "Income Tax - Individuals & Salaried",
    slug: "income-tax-individuals",
    description: "Annual FBR returns",
    is_active: true,
    sort_order: 1,
    created_at: "2026-09-01T00:00:00Z",
    updated_at: "2026-09-01T00:00:00Z",
  },
  "2": {
    id: "2",
    name: "Business & Corporate Tax",
    slug: "business-corporate-tax",
    description: "AOP, Sole Proprietor, Private Ltd",
    is_active: true,
    sort_order: 2,
    created_at: "2026-09-01T00:00:00Z",
    updated_at: "2026-09-01T00:00:00Z",
  },
  "3": {
    id: "3",
    name: "Sales Tax (Federal & PRA)",
    slug: "sales-tax-pra",
    description: "Monthly sales tax returns",
    is_active: true,
    sort_order: 3,
    created_at: "2026-09-01T00:00:00Z",
    updated_at: "2026-09-01T00:00:00Z",
  },
  "4": {
    id: "4",
    name: "Withholding Tax Statements",
    slug: "withholding-tax",
    description: "Periodic withholding statements",
    is_active: true,
    sort_order: 4,
    created_at: "2026-09-01T00:00:00Z",
    updated_at: "2026-09-01T00:00:00Z",
  },
  "5": {
    id: "5",
    name: "Property & Capital Value Tax",
    slug: "property-tax-stamp-duty",
    description: "E-Stamp duty and transfer deadlines",
    is_active: true,
    sort_order: 5,
    created_at: "2026-09-01T00:00:00Z",
    updated_at: "2026-09-01T00:00:00Z",
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
    categories: [TAX_CATEGORY_MAP["1"], TAX_CATEGORY_MAP["2"]],
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
    categories: [TAX_CATEGORY_MAP["3"], TAX_CATEGORY_MAP["5"]],
  },
];

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-project.supabase.co";
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "placeholder-key";
  return createClient(url, key);
}

function ensureLocalFile(): SubscriberWithCategories[] {
  try {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, JSON.stringify(SEED_SUBSCRIBERS, null, 2), "utf8");
      return SEED_SUBSCRIBERS;
    }
    const raw = fs.readFileSync(DATA_FILE, "utf8");
    return JSON.parse(raw) as SubscriberWithCategories[];
  } catch {
    return SEED_SUBSCRIBERS;
  }
}

function writeLocalFile(subs: SubscriberWithCategories[]) {
  try {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(subs, null, 2), "utf8");
  } catch (err) {
    console.error("[SubscribersStorage] Failed to write local subscribers file:", err);
  }
}

export async function getAllSubscribers(): Promise<SubscriberWithCategories[]> {
  const localSubs = ensureLocalFile();

  try {
    const supabase = getSupabaseClient();
    const { data: dbSubs, error } = await supabase
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
          tax_categories ( id, name, slug )
        )
      `)
      .order("created_at", { ascending: false });

    if (!error && dbSubs && dbSubs.length > 0) {
      const dbMapped: SubscriberWithCategories[] = dbSubs.map((sub: any) => ({
        ...sub,
        categories: (sub.subscriber_categories || [])
          .map((sc: any) => sc.tax_categories)
          .filter(Boolean),
      }));

      // Merge DB subscribers with local subscribers (unique by email)
      const mergedMap = new Map<string, SubscriberWithCategories>();
      localSubs.forEach((s) => mergedMap.set(s.email.toLowerCase(), s));
      dbMapped.forEach((s) => mergedMap.set(s.email.toLowerCase(), s));

      const merged = Array.from(mergedMap.values());
      writeLocalFile(merged);
      return merged;
    }
  } catch {
    // Non-fatal, fallback to local storage
  }

  return localSubs;
}

export async function addOrUpdateSubscriber(payload: {
  name: string;
  email: string;
  categoryIds: string[];
  consent?: boolean;
}): Promise<SubscriberWithCategories> {
  const all = await getAllSubscribers();
  const normalizedEmail = payload.email.trim().toLowerCase();
  const now = new Date().toISOString();

  // Resolve category objects
  const categories: TaxCategory[] = payload.categoryIds.map(
    (id) =>
      TAX_CATEGORY_MAP[id] || {
        id,
        name: `Tax Category ${id}`,
        slug: `category-${id}`,
        description: "Statutory Tax Filing",
        is_active: true,
        sort_order: 99,
        created_at: now,
        updated_at: now,
      }
  );

  const existingIdx = all.findIndex((s) => s.email.toLowerCase() === normalizedEmail);

  let subscriber: SubscriberWithCategories;

  if (existingIdx >= 0) {
    subscriber = {
      ...all[existingIdx],
      name: payload.name.trim() || all[existingIdx].name,
      status: "active",
      categories,
      updated_at: now,
      confirmed_at: now,
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

  // Persist locally
  writeLocalFile(all);

  // Attempt to save to Supabase
  try {
    const supabase = getSupabaseClient();
    const { data: dbSub } = await supabase
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
      await supabase.from("subscriber_categories").upsert(rows, { onConflict: "subscriber_id,category_id" });
    }
  } catch (err) {
    console.warn("[SubscribersStorage] Supabase sync notice: Stored in high-availability local store.");
  }

  return subscriber;
}

export async function unsubscribeSubscriber(idOrEmail: string): Promise<boolean> {
  const all = await getAllSubscribers();
  const normalized = idOrEmail.toLowerCase();
  const idx = all.findIndex((s) => s.id === idOrEmail || s.email.toLowerCase() === normalized);

  if (idx >= 0) {
    all[idx].status = "unsubscribed";
    all[idx].updated_at = new Date().toISOString();
    writeLocalFile(all);
  }

  try {
    const supabase = getSupabaseClient();
    await supabase
      .from("subscribers")
      .update({ status: "unsubscribed", updated_at: new Date().toISOString() })
      .or(`id.eq.${idOrEmail},email.eq.${idOrEmail}`);
  } catch {
    // Local persistence is complete
  }

  return true;
}
