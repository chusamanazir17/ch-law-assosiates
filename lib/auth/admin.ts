import "server-only";

import { cookies } from "next/headers";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { ADMIN_COOKIE_NAME, verifyAdminToken } from "@/lib/auth/adminAuth";

export interface AdminSession {
  user: User;
  isLocalAdmin?: boolean;
  supabase: Awaited<ReturnType<typeof createClient>>;
}

const LOCAL_ADMIN_USER: User = {
  id: "admin-local",
  app_metadata: { provider: "credentials", role: "admin" },
  user_metadata: { name: "Administrator", role: "admin" },
  aud: "authenticated",
  confirmation_sent_at: undefined,
  recovery_sent_at: undefined,
  email_change_sent_at: undefined,
  new_email: undefined,
  invited_at: undefined,
  action_link: undefined,
  email: "admin@chcomposing.pk",
  phone: "",
  created_at: "2026-01-01T00:00:00Z",
  confirmed_at: "2026-01-01T00:00:00Z",
  email_confirmed_at: "2026-01-01T00:00:00Z",
  phone_confirmed_at: undefined,
  last_sign_in_at: new Date().toISOString(),
  role: "admin",
  updated_at: new Date().toISOString(),
  identities: [],
  factors: [],
};

/**
 * Resolve and verify the current administrator from either the credential session cookie
 * or Supabase auth session.
 * Returns null rather than throwing for unauthenticated/unauthorized requests.
 */
export async function getAdminSession(): Promise<AdminSession | null> {
  try {
    const supabase = await createClient();

    // 1. Check local admin session cookie
    const cookieStore = await cookies();
    const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;

    if (token && (await verifyAdminToken(token))) {
      return {
        user: LOCAL_ADMIN_USER,
        isLocalAdmin: true,
        supabase,
      };
    }

    // 2. Check Supabase auth session
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) return null;

    const { data: isAdmin, error: adminError } = await supabase.rpc("is_admin", {
      p_user_id: user.id,
    });

    if (adminError || !isAdmin) return null;
    return { user, supabase };
  } catch {
    return null;
  }
}
