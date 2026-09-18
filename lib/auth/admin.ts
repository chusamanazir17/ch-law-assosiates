import "server-only";

import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

export interface AdminSession {
  user: User;
  supabase: Awaited<ReturnType<typeof createClient>>;
}

/**
 * Resolve and verify the current administrator from the server-side session.
 * Returns null rather than throwing for unauthenticated/unauthorized requests.
 */
export async function getAdminSession(): Promise<AdminSession | null> {
  try {
    const supabase = await createClient();
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
