import type { NextRequest } from "next/server";

/**
 * Double-submit-cookie CSRF protection (SEC-02 remediation).
 *
 * Flow: on login the server sets a readable (non-HttpOnly) `ch_csrf_token`
 * cookie. Browser JS reads it and echoes it back in the `x-csrf-token` header
 * on every state-changing API call. The server accepts the request only when
 * the header matches the cookie. A cross-site attacker cannot read the cookie
 * value, so they cannot forge the header.
 *
 * This module is edge-safe (no node builtins, no "server-only") because
 * middleware.ts imports it.
 */

export const CSRF_COOKIE_NAME = "ch_csrf_token";
export const CSRF_HEADER_NAME = "x-csrf-token";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

/** Cookie-session API routes whose mutations require a CSRF token. */
const CSRF_PROTECTED_PREFIXES = ["/api/office/", "/api/admin/"];

/**
 * Paths exempt from the token check:
 * - /api/admin/login  — no session (and no CSRF cookie) exists yet.
 * - /api/admin/logout — kept POST-only; SameSite=Lax already blocks
 *   cross-site subrequest POSTs, and exempting avoids bricking logout for
 *   clients that have not adopted the header yet.
 */
const CSRF_EXEMPT_PATHS = ["/api/admin/login", "/api/admin/logout"];

export function newCsrfToken(): string {
  // crypto.randomUUID is available in both edge and node runtimes.
  return `${crypto.randomUUID()}-${crypto.randomUUID()}`;
}

/** Constant-time string comparison (timing-oracle hygiene). */
export function csrfTokensEqual(
  a: string | null | undefined,
  b: string | null | undefined
): boolean {
  if (!a || !b || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

export function shouldVerifyCsrf(request: NextRequest): boolean {
  if (SAFE_METHODS.has(request.method)) return false;
  const path = request.nextUrl.pathname;
  const protectedRoute = CSRF_PROTECTED_PREFIXES.some((p) =>
    path.startsWith(p)
  );
  if (!protectedRoute) return false;
  return !CSRF_EXEMPT_PATHS.some(
    (p) => path === p || path.startsWith(p + "/")
  );
}

/** True when the request carries a header token matching the CSRF cookie. */
export function verifyCsrfRequest(request: NextRequest): boolean {
  const cookieToken = request.cookies.get(CSRF_COOKIE_NAME)?.value;
  const headerToken = request.headers.get(CSRF_HEADER_NAME);
  return csrfTokensEqual(cookieToken, headerToken);
}
