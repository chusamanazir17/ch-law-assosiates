import { CSRF_COOKIE_NAME, CSRF_HEADER_NAME } from "@/lib/auth/csrf";

/**
 * Client-side fetch wrapper that attaches the double-submit CSRF token.
 *
 * The server sets a readable (non-HttpOnly) `ch_csrf_token` cookie on login /
 * session bootstrap (see `app/api/admin/session/route.ts`). This wrapper
 * reads that cookie and echoes it back in the `x-csrf-token` header on every
 * state-changing request (POST/PATCH/PUT/DELETE), which
 * `middleware.ts` requires for `/api/office/*` and `/api/admin/*` mutations.
 *
 * Safe methods (GET/HEAD/OPTIONS) are sent untouched. If no CSRF cookie is
 * present (e.g. before first login), the request goes out without the header
 * and the server responds 403 with a clear message — it never silently
 * forges a token.
 */
const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const parts = document.cookie ? document.cookie.split(";") : [];
  for (const part of parts) {
    const idx = part.indexOf("=");
    if (idx < 0) continue;
    const key = part.slice(0, idx).trim();
    if (key === name) {
      return decodeURIComponent(part.slice(idx + 1).trim());
    }
  }
  return null;
}

function resolveMethod(
  input: RequestInfo | URL,
  init?: RequestInit
): string {
  if (init?.method) return init.method.toUpperCase();
  if (typeof Request !== "undefined" && input instanceof Request) {
    return input.method.toUpperCase();
  }
  return "GET";
}

export function apiFetch(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  const method = resolveMethod(input, init);
  if (!SAFE_METHODS.has(method)) {
    const token = readCookie(CSRF_COOKIE_NAME);
    if (token) {
      const headers = new Headers(init?.headers);
      if (!headers.has(CSRF_HEADER_NAME)) {
        headers.set(CSRF_HEADER_NAME, token);
      }
      init = { ...init, headers };
    }
  }
  return fetch(input, init);
}
