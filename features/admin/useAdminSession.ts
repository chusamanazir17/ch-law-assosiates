"use client";

import { useEffect, useState } from "react";

export interface AdminSessionInfo {
  authenticated: boolean;
  role: string | null;
  name: string;
  email: string;
}

const FALLBACK: AdminSessionInfo = {
  authenticated: false,
  role: null,
  name: "Administrator",
  email: "",
};

// Module-level promise cache so every component using this hook shares one request.
let cached: Promise<AdminSessionInfo> | null = null;

function fetchSession(): Promise<AdminSessionInfo> {
  if (!cached) {
    cached = fetch("/api/admin/session", { credentials: "same-origin" })
      .then(async (res) => {
        const json = (await res.json().catch(() => ({}))) as {
          authenticated?: boolean;
          role?: string | null;
          user?: { name?: string; email?: string };
        };
        return {
          authenticated: !!json.authenticated,
          role: json.role ?? null,
          name: json.user?.name?.trim() || "Administrator",
          email: json.user?.email || "",
        };
      })
      .catch(() => ({ ...FALLBACK }));
  }
  return cached;
}

/** Real logged-in admin identity for shell chrome (greeting, profile). Never invented. */
export function useAdminSession(): AdminSessionInfo {
  const [session, setSession] = useState<AdminSessionInfo>(FALLBACK);

  useEffect(() => {
    let live = true;
    fetchSession().then((s) => {
      if (live) setSession(s);
    });
    return () => {
      live = false;
    };
  }, []);

  return session;
}
