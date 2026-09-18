import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/database.types";
import { getSupabasePublicConfig } from "@/config/env";

export async function createClient() {
  const cookieStore = await cookies();
  const config = getSupabasePublicConfig();
  const url = config?.url || "https://placeholder-project.supabase.co";
  const anonKey = config?.anonKey || "placeholder-anon-key";

  return createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server Components cannot always mutate cookies. Middleware refreshes sessions.
        }
      },
    },
  });
}
