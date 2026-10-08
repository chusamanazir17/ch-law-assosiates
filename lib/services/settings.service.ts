import { getAdminDatabaseClient } from "@/lib/supabase/service";

export async function getSiteSetting<T = unknown>(key: string): Promise<T | null> {
  try {
    const supabase = await getAdminDatabaseClient();
    const { data, error } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", key)
      .maybeSingle();

    if (error || !data) return null;
    return data.value as T;
  } catch (err) {
    console.error(`[SettingsService] getSiteSetting for ${key} failed:`, err);
    return null;
  }
}

export async function updateSiteSetting(key: string, value: unknown): Promise<void> {
  // SEC-07: the office settings endpoint must not be an arbitrary site_settings
  // upsert (public-site defacement vector). Only office-namespaced keys are
  // writable through this path; CMS keys stay behind the admin panel.
  if (!key || !key.startsWith("office_")) {
    throw new Error(
      "Invalid setting key. Only keys starting with 'office_' may be changed here."
    );
  }

  const supabase = await getAdminDatabaseClient();
  const { error } = await supabase
    .from("site_settings")
    .upsert({
      key,
      value: value as any,
      updated_at: new Date().toISOString(),
    }, { onConflict: "key" });

  if (error) {
    console.error(`[SettingsService] updateSiteSetting for ${key} error:`, error);
    throw new Error(`Failed to update setting ${key}: ${error.message}`);
  }
}
