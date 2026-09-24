import "server-only";

import { cookies } from "next/headers";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { ADMIN_COOKIE_NAME, verifyAdminToken, validateAdminCredentials, createAdminToken } from "@/lib/auth/adminAuth";
import type { AppRole, Profile } from "@/types/office";

export interface UnifiedSession {
  user: User;
  role: AppRole;
  profile?: Profile | null;
  isLocalAdmin?: boolean;
}

const SUPER_ADMIN_FALLBACK: Profile = {
  id: "00000000-0000-0000-0000-000000000001",
  full_name: "Super Administrator",
  email: "admin@chcomposing.pk",
  phone: "0305-7902744",
  role: "super_admin",
  designation: "Managing Principal",
  status: "active",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

/**
 * Resolves current user and their active role across Supabase Auth and local admin token.
 */
export async function getUnifiedSession(): Promise<UnifiedSession | null> {
  try {
    const supabase = await createClient();
    const cookieStore = await cookies();
    const localToken = cookieStore.get(ADMIN_COOKIE_NAME)?.value;

    // 1. Check local admin session cookie
    if (localToken && (await verifyAdminToken(localToken))) {
      return {
        user: {
          id: SUPER_ADMIN_FALLBACK.id,
          email: SUPER_ADMIN_FALLBACK.email || "admin@chcomposing.pk",
          role: "authenticated",
          aud: "authenticated",
          app_metadata: { role: "super_admin" },
          user_metadata: { name: SUPER_ADMIN_FALLBACK.full_name, role: "super_admin" },
          created_at: SUPER_ADMIN_FALLBACK.created_at,
        } as unknown as User,
        role: "super_admin",
        profile: SUPER_ADMIN_FALLBACK,
        isLocalAdmin: true,
      };
    }

    // 2. Check Supabase Auth user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) return null;

    // Fetch profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    let resolvedRole: AppRole = "staff";

    if (profile?.role) {
      resolvedRole = profile.role as AppRole;
    } else {
      // Check legacy admin_memberships
      const { data: isLegacyAdmin } = await supabase.rpc("is_admin", { p_user_id: user.id });
      if (isLegacyAdmin) {
        resolvedRole = "super_admin";
      }
    }

    return {
      user,
      role: resolvedRole,
      profile: profile as Profile | null,
      isLocalAdmin: false,
    };
  } catch (err) {
    console.error("[AuthService] getUnifiedSession error:", err);
    return null;
  }
}

/** Check if user can access Website Admin CMS */
export function canAccessWebsiteCMS(role: AppRole): boolean {
  return role === "super_admin" || role === "website_admin" || role === "office_admin";
}

/** Check if user can access Office Management System */
export function canAccessOfficeSystem(role: AppRole): boolean {
  return (
    role === "super_admin" ||
    role === "office_admin" ||
    role === "lawyer" ||
    role === "accountant" ||
    role === "staff" ||
    role === "receptionist"
  );
}

/** Check if user has specific permissions */
export function isLawyer(role: AppRole): boolean {
  return role === "lawyer";
}

export function isAccountant(role: AppRole): boolean {
  return role === "accountant";
}

export function isSuperOrOfficeAdmin(role: AppRole): boolean {
  return role === "super_admin" || role === "office_admin";
}
