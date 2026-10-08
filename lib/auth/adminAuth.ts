import "server-only";

// Non-secret identifiers may fall back to defaults, but the password and the
// session signing secret MUST come from the environment. There are no
// hardcoded fallbacks: missing values fail closed (throw) instead of shipping
// with publicly known credentials.
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@chcomposing.pk";

function requiredEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(
      `[adminAuth] ${name} is not set. Refusing to authenticate with a default ` +
        `value — set ${name} in your environment variables.`
    );
  }
  return value;
}

function getAdminPassword(): string {
  return requiredEnv("ADMIN_PASSWORD");
}

function getSessionSecret(): string {
  return requiredEnv("ADMIN_SESSION_SECRET");
}

export const ADMIN_COOKIE_NAME = "ch_admin_session";

/**
 * Admin session lifetime. Configurable via ADMIN_SESSION_TTL_HOURS and
 * deliberately short by default (12h, down from the previous hardcoded 30
 * days) so a leaked token has a bounded blast radius (AUTH-3).
 */
function getSessionTtlMs(): number {
  const raw = process.env.ADMIN_SESSION_TTL_HOURS?.trim();
  const hours = raw ? Number(raw) : NaN;
  const sane = Number.isFinite(hours) && hours > 0 && hours <= 24 * 30 ? hours : 12;
  return sane * 60 * 60 * 1000;
}

export function getAdminSessionTtlHours(): number {
  return getSessionTtlMs() / (60 * 60 * 1000);
}

function constantTimeEquals(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

export function validateAdminCredentials(
  userOrEmail: string,
  pass: string
): boolean {
  if (!userOrEmail || !pass) return false;

  const normalized = userOrEmail.trim().toLowerCase();
  const isValidUser =
    constantTimeEquals(normalized, ADMIN_USERNAME.toLowerCase()) ||
    constantTimeEquals(normalized, ADMIN_EMAIL.toLowerCase()) ||
    constantTimeEquals(normalized, "admin@ch-law.pk");

  const isPassValid = constantTimeEquals(pass.trim(), getAdminPassword());

  return isValidUser && isPassValid;
}

async function getCryptoKey(): Promise<CryptoKey> {
  const enc = new TextEncoder();
  return await crypto.subtle.importKey(
    "raw",
    enc.encode(getSessionSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

function toBase64Url(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function stringToBase64Url(str: string): string {
  const enc = new TextEncoder();
  return toBase64Url(enc.encode(str));
}

function base64UrlToString(base64url: string): string {
  let base64 = base64url.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4 !== 0) {
    base64 += "=";
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}

export async function createAdminToken(): Promise<string> {
  const payload = JSON.stringify({
    role: "admin",
    user: ADMIN_USERNAME,
    email: ADMIN_EMAIL,
    // Unique session id so individual sessions can be revoked server-side.
    jti: crypto.randomUUID(),
    timestamp: Date.now(),
  });

  const base64Payload = stringToBase64Url(payload);
  const enc = new TextEncoder();
  const key = await getCryptoKey();
  const signature = await crypto.subtle.sign("HMAC", key, enc.encode(base64Payload));
  const base64Signature = toBase64Url(signature);

  return `${base64Payload}.${base64Signature}`;
}

/** Extract the payload of a well-formed token without verifying it. */
function decodeTokenPayload(token: string): {
  role?: string;
  jti?: string;
  timestamp?: number;
} | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 2) return null;
    return JSON.parse(base64UrlToString(parts[0]));
  } catch {
    return null;
  }
}

/** The session id (jti) embedded in a token, if present. */
export function getTokenSessionId(token: string | undefined | null): string | null {
  if (!token) return null;
  const payload = decodeTokenPayload(token);
  return typeof payload?.jti === "string" && payload.jti ? payload.jti : null;
}

export async function verifyAdminToken(
  token: string | undefined | null
): Promise<boolean> {
  if (!token) return false;

  const parts = token.split(".");
  if (parts.length !== 2) return false;

  const [base64Payload, base64Signature] = parts;

  try {
    const enc = new TextEncoder();
    const key = await getCryptoKey();
    const signature = await crypto.subtle.sign("HMAC", key, enc.encode(base64Payload));
    const expectedSignature = toBase64Url(signature);

    // Constant-time comparison (SEC-13): plain `!==` short-circuits.
    if (!constantTimeEquals(base64Signature, expectedSignature)) return false;

    const raw = base64UrlToString(base64Payload);
    const data = JSON.parse(raw);
    if (data.role !== "admin") return false;

    // Session lifetime is configurable (default 12h — see getSessionTtlMs).
    const age = Date.now() - (data.timestamp || 0);
    return age < getSessionTtlMs();
  } catch {
    return false;
  }
}

/**
 * Server-side admin session registry (AUTH-3 revocation).
 * Tokens carry a `jti`; login registers it in `public.admin_sessions` and
 * logout revokes it. A token with no live registry row is treated as revoked
 * (fail closed) — sessions issued before this registry existed stop working
 * and their owners simply log in again.
 */

async function getRegistryClient() {
  const { getAdminDatabaseClient } = await import("@/lib/supabase/service");
  const client = await getAdminDatabaseClient();
  // admin_sessions is created by migration 20261008000002 and is intentionally
  // absent from the generated Database type; the untyped call is deliberate.
  return client as unknown as import("@supabase/supabase-js").SupabaseClient<any>;
}

export async function registerAdminSession(
  token: string,
  meta?: { ip?: string | null; userAgent?: string | null }
): Promise<void> {
  const jti = getTokenSessionId(token);
  if (!jti) throw new Error("[adminAuth] Cannot register a token without a session id.");
  const payload = decodeTokenPayload(token);
  const issuedAt = payload?.timestamp || Date.now();
  const supabase = await getRegistryClient();
  const { error } = await supabase.from("admin_sessions").insert({
    session_id: jti,
    expires_at: new Date(issuedAt + getSessionTtlMs()).toISOString(),
    ip_address: meta?.ip || null,
    user_agent: meta?.userAgent || null,
  });
  if (error) {
    throw new Error(`[adminAuth] Failed to register admin session: ${error.message}`);
  }
}

export async function revokeAdminSession(
  token: string | undefined | null
): Promise<boolean> {
  const jti = getTokenSessionId(token);
  if (!jti) return false;
  try {
    const supabase = await getRegistryClient();
    const { data, error } = await supabase
      .from("admin_sessions")
      .update({ revoked_at: new Date().toISOString() })
      .eq("session_id", jti)
      .is("revoked_at", null)
      .select("id");
    if (error) {
      console.error("[adminAuth] revokeAdminSession error:", error.message);
      return false;
    }
    return (data?.length ?? 0) > 0;
  } catch (err) {
    console.error("[adminAuth] revokeAdminSession error:", err);
    return false;
  }
}

/** Revoke every admin session (incident-response control). */
export async function revokeAllAdminSessions(): Promise<number> {
  const supabase = await getRegistryClient();
  const { data, error } = await supabase
    .from("admin_sessions")
    .update({ revoked_at: new Date().toISOString() })
    .is("revoked_at", null)
    .select("id");
  if (error) throw new Error(`[adminAuth] revokeAllAdminSessions failed: ${error.message}`);
  return data?.length ?? 0;
}

/**
 * Full session validity: cryptographic signature + TTL + a live,
 * non-revoked, non-expired registry row.
 */
export async function isAdminSessionActive(
  token: string | undefined | null
): Promise<boolean> {
  if (!(await verifyAdminToken(token))) return false;
  const jti = getTokenSessionId(token);
  if (!jti) return false;
  try {
    const supabase = await getRegistryClient();
    const { data, error } = await supabase
      .from("admin_sessions")
      .select("id, expires_at, revoked_at")
      .eq("session_id", jti)
      .maybeSingle();
    if (error || !data) return false;
    if (data.revoked_at) return false;
    if (new Date(data.expires_at).getTime() < Date.now()) return false;
    return true;
  } catch (err) {
    console.error("[adminAuth] isAdminSessionActive error:", err);
    return false;
  }
}
