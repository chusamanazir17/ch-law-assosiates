import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database.types";
import { getSupabasePublicConfig } from "@/config/env";

export function createClient() {
  const config = getSupabasePublicConfig();
  const url = config?.url || "https://placeholder-project.supabase.co";
  const anonKey = config?.anonKey || "placeholder-anon-key";
  return createBrowserClient<Database>(url, anonKey);
}
