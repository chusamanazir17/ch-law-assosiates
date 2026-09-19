const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@chcomposing.pk";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin2026";

const DEFAULT_SECRET = "ch-law-admin-secret-key-2026-sahiwal-chamber121";
const SESSION_SECRET = process.env.ADMIN_SESSION_SECRET || DEFAULT_SECRET;

if (process.env.NODE_ENV === "production") {
  if (!process.env.ADMIN_PASSWORD || process.env.ADMIN_PASSWORD === "admin2026") {
    console.warn(
      "[Security Warning] ADMIN_PASSWORD is using the default value. Set a strong ADMIN_PASSWORD in your production environment variables."
    );
  }
  if (!process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_SESSION_SECRET === DEFAULT_SECRET) {
    console.warn(
      "[Security Warning] ADMIN_SESSION_SECRET is using the default fallback. Set a unique 32+ character ADMIN_SESSION_SECRET in your production environment variables."
    );
  }
}

export const ADMIN_COOKIE_NAME = "ch_admin_session";

function constantTimeEquals(a: string, b: string): boolean {
  if (a.length !== b.length) {
    let diff = 0;
    for (let i = 0; i < a.length; i++) {
      diff |= a.charCodeAt(i) ^ a.charCodeAt(i);
    }
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

  const isPassValid = constantTimeEquals(pass.trim(), ADMIN_PASSWORD);

  return isValidUser && isPassValid;
}

async function getCryptoKey(): Promise<CryptoKey> {
  const enc = new TextEncoder();
  return await crypto.subtle.importKey(
    "raw",
    enc.encode(SESSION_SECRET),
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
    timestamp: Date.now(),
  });

  const base64Payload = stringToBase64Url(payload);
  const enc = new TextEncoder();
  const key = await getCryptoKey();
  const signature = await crypto.subtle.sign("HMAC", key, enc.encode(base64Payload));
  const base64Signature = toBase64Url(signature);

  return `${base64Payload}.${base64Signature}`;
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

    if (base64Signature !== expectedSignature) return false;

    const raw = base64UrlToString(base64Payload);
    const data = JSON.parse(raw);
    if (data.role !== "admin") return false;

    // Valid for 30 days
    const age = Date.now() - (data.timestamp || 0);
    const thirtyDays = 30 * 24 * 60 * 60 * 1000;
    return age < thirtyDays;
  } catch {
    return false;
  }
}
