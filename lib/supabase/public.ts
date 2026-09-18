import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";
import { requireSupabasePublicConfig } from "@/config/env";

/**
 * Stateless public Supabase client for server-side reads protected by RLS.
 * It never receives a service-role key or user cookies.
 */
export function createPublicClient() {
  const { url, anonKey } = requireSupabasePublicConfig();

  return createSupabaseClient<Database>(url, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}
