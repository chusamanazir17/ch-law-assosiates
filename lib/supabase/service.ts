import "server-only";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";
import { requireSupabasePublicConfig } from "@/config/env";

/**
 * Service-role client for narrowly scoped server-only operations.
 * Never import this module from Client Components.
 */
export function createServiceClient() {
  const { url } = requireSupabasePublicConfig();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!serviceRoleKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not configured.");
  }

  return createSupabaseClient<Database>(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

/**
 * Returns a service-role client if SUPABASE_SERVICE_ROLE_KEY is configured,
 * otherwise safely falls back to the standard server client.
 */
export async function getAdminDatabaseClient() {
  if (process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()) {
    return createServiceClient();
  }
  const { createClient } = await import("@/lib/supabase/server");
  return await createClient();
}

