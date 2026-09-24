import "server-only";

/**
 * Server-side Supabase access for CMS content stores (services, pages,
 * site settings, home sections).
 *
 * - Prefers the service-role client so the env-credential admin session can
 *   manage content through the admin API routes and first-run seeding works.
 * - Falls back to the cookie-bound server client (anon key) which performs
 *   RLS-protected public reads when the service key is not configured.
 *
 * Never import this module from Client Components.
 */

const CACHE_TTL_MS = 10_000;

const cache = new Map<string, { value: unknown; expires: number }>();

export function cmsCacheGet<T>(key: string): T | null {
  const hit = cache.get(key);
  if (!hit) return null;
  if (Date.now() > hit.expires) {
    cache.delete(key);
    return null;
  }
  return hit.value as T;
}

export function cmsCacheSet(key: string, value: unknown): void {
  cache.set(key, { value, expires: Date.now() + CACHE_TTL_MS });
}

export function invalidateCmsCache(prefix?: string): void {
  if (!prefix) {
    cache.clear();
    return;
  }
  for (const key of cache.keys()) {
    if (key.startsWith(prefix)) cache.delete(key);
  }
}

export function hasServiceRoleKey(): boolean {
  return Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY?.trim());
}

/**
 * Returns true when Supabase public env vars are configured at all.
 * When false, stores serve built-in defaults and reject writes loudly.
 */
export function isCmsBackendConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
  return Boolean(url) && !url.includes("your-project-ref");
}

type AnyClient = import("@supabase/supabase-js").SupabaseClient;

export async function getCmsClient(): Promise<AnyClient | null> {
  if (!isCmsBackendConfigured()) return null;

  if (hasServiceRoleKey()) {
    const { createServiceClient } = await import("@/lib/supabase/service");
    return createServiceClient();
  }

  const { createClient } = await import("@/lib/supabase/server");
  return createClient();
}
