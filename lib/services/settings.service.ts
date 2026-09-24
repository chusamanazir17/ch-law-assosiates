import { createClient } from "@/lib/supabase/server";

export async function getSiteSetting<T = unknown>(key: string): Promise<T | null> {
  try {
    const supabase = await createClient();
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
  const supabase = await createClient();
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
