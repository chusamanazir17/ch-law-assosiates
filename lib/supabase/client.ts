import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database.types";
import { getSupabasePublicConfig } from "@/config/env";

export function isSupabaseConfigured(): boolean {
  return getSupabasePublicConfig() !== null;
}

/**
 * Browser Supabase client. Fails fast with an actionable error when Supabase
 * environment variables are missing — silent no-op mocks previously masked
 * failed writes in the admin panel.
 */
export function createClient() {
  const config = getSupabasePublicConfig();
  if (!config) {
    throw new Error(
      "Supabase is not configured: set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY in your environment."
    );
  }
  return createBrowserClient<Database>(config.url, config.anonKey);
}
