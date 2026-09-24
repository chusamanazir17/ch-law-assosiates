// ==============================================================================
// features/office/lib/supabase/client.ts
// Supabase Client adapter for Next.js
// ==============================================================================

import { createClient } from "@/lib/supabase/client";

export const supabase = createClient();

export const isSupabaseConfigured = Boolean(
  typeof process !== "undefined" &&
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("your-project")
);
