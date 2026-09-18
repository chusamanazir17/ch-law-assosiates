import fs from "fs";
import path from "path";
import { getSupabasePublicConfig } from "@/config/env";
import { createServiceClient } from "@/lib/supabase/service";
import type { ConsultationInquiry } from "@/types/cms";

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "inquiries.json");

const SEED_INQUIRIES: ConsultationInquiry[] = [
  {
    id: "inq-seed-1",
    name: "Rana Zafar Iqbal",
    phone: "0300 9876543",
    email: null,
    service_needed: "Property Registry & E-Stamp",
    message: "Need urgent documentation assistance for registry transfer in Sahiwal district.",
    status: "new",
    created_at: "2026-09-15T11:00:00Z",
  },
  {
    id: "inq-seed-2",
    name: "Haji Abdul Rehman",
    phone: "0321 4567890",
    email: "abdulrehman@example.com",
    service_needed: "FBR Income Tax Filing",
    message: "Salaried employee tax return filing for current tax year.",
    status: "in_progress",
    created_at: "2026-09-14T09:30:00Z",
  },
];

function ensureDataFile(): ConsultationInquiry[] {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, JSON.stringify(SEED_INQUIRIES, null, 2), "utf8");
      return SEED_INQUIRIES;
    }
    const raw = fs.readFileSync(DATA_FILE, "utf8");
    return JSON.parse(raw) as ConsultationInquiry[];
  } catch (error) {
    console.error("[InquiriesStore] Read error:", error);
    return SEED_INQUIRIES;
  }
}

function writeDataFile(items: ConsultationInquiry[]): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(items, null, 2), "utf8");
  } catch (error) {
    console.error("[InquiriesStore] Write error:", error);
  }
}

export async function getAllInquiries(): Promise<ConsultationInquiry[]> {
  const localItems = ensureDataFile();

  const config = getSupabasePublicConfig();
  if (config) {
    try {
      const client = createServiceClient();
      const { data: dbItems, error } = await client
        .from("consultation_inquiries")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && dbItems && dbItems.length > 0) {
        const mergedMap = new Map<string, ConsultationInquiry>();
        localItems.forEach((item) => mergedMap.set(item.id, item));
        dbItems.forEach((item) => mergedMap.set(item.id, item));

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

  return localItems;
}

export async function addInquiry(payload: {
  name: string;
  phone: string;
  service: string;
  message?: string;
  email?: string;
}): Promise<ConsultationInquiry> {
  const all = ensureDataFile();
  const now = new Date().toISOString();

  const newInquiry: ConsultationInquiry = {
    id: `inq-${Date.now()}`,
    name: payload.name.trim(),
    phone: payload.phone.trim(),
    email: payload.email?.trim() || null,
    service_needed: payload.service.trim(),
    message: payload.message?.trim() || null,
    status: "new",
    created_at: now,
  };

  all.unshift(newInquiry);
  writeDataFile(all);

  const config = getSupabasePublicConfig();
  if (config) {
    try {
      const client = createServiceClient();
      await client.from("consultation_inquiries").insert({
        name: newInquiry.name,
        phone: newInquiry.phone,
        service_needed: newInquiry.service_needed,
        message: newInquiry.message,
        status: "new",
      });
    } catch {
      // Local persistence is complete
    }
  }

  return newInquiry;
}

export async function updateInquiryStatus(
  id: string,
  status: ConsultationInquiry["status"]
): Promise<boolean> {
  const all = ensureDataFile();
  const idx = all.findIndex((item) => item.id === id);

  if (idx >= 0) {
    all[idx].status = status;
    writeDataFile(all);
  }

  const config = getSupabasePublicConfig();
  if (config) {
    try {
      const client = createServiceClient();
      await client
        .from("consultation_inquiries")
        .update({ status })
        .eq("id", id);
    } catch {
      // Local persistence is complete
    }
  }

  return true;
}

export async function deleteInquiry(id: string): Promise<boolean> {
  const all = ensureDataFile();
  const filtered = all.filter((item) => item.id !== id);
  writeDataFile(filtered);

  const config = getSupabasePublicConfig();
  if (config) {
    try {
      const client = createServiceClient();
      await client.from("consultation_inquiries").delete().eq("id", id);
    } catch {}
  }

  return true;
}
