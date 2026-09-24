import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/database.types";
import { getSupabasePublicConfig } from "@/config/env";

import { ADMIN_COOKIE_NAME, verifyAdminToken } from "@/lib/auth/adminAuth";
import { createServiceClient } from "@/lib/supabase/service";

export async function createClient() {
  const cookieStore = await cookies();
  const config = getSupabasePublicConfig();
  const url = config?.url || "https://placeholder-project.supabase.co";
  const anonKey = config?.anonKey || "placeholder-anon-key";

  // If request has verified admin session cookie and service role key is configured,
  // use the service-role client so operations on the server bypass RLS safely.
  const adminCookie = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  if (adminCookie && process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()) {
    try {
      const isValid = await verifyAdminToken(adminCookie);
      if (isValid) {
        return createServiceClient();
      }
    } catch {
      // Fallback to standard client
    }
  }

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

