import { getAdminDatabaseClient } from "@/lib/supabase/service";
import type { MediaAsset } from "@/types/cms";

const MEDIA_BUCKET = "media";
const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

/**
 * Server-side media library management (storage bucket `media` + `media_assets`).
 * Runs with the service-role client so admin API routes can upload and delete
 * regardless of the admin session type.
 */
export async function listMediaAssets(): Promise<MediaAsset[]> {
  const supabase = await getAdminDatabaseClient();
  const { data, error } = await supabase
    .from("media_assets")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as MediaAsset[];
}

export async function deleteMediaAsset(asset: { id: string; storage_path?: string | null }): Promise<{
  storageWarning: string | null;
}> {
  const supabase = await getAdminDatabaseClient();

  const { error } = await supabase.from("media_assets").delete().eq("id", asset.id);
  if (error) throw new Error(error.message);

  if (asset.storage_path) {
    const { error: storageError } = await supabase.storage
      .from(MEDIA_BUCKET)
      .remove([asset.storage_path]);
    if (storageError) {
      return { storageWarning: storageError.message };
    }
  }
  return { storageWarning: null };
}

export interface AddAssetByUrlInput {
  name: string;
  altText: string;
  url: string;
}

export async function addMediaAssetByUrl(input: AddAssetByUrlInput): Promise<MediaAsset> {
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(input.url);
  } catch {
    throw new Error("Please provide a valid image URL.");
  }
  if (!["http:", "https:"].includes(parsedUrl.protocol)) {
    throw new Error("Image URLs must use HTTP or HTTPS.");
  }

  const supabase = await getAdminDatabaseClient();
  const { data, error } = await supabase
    .from("media_assets")
    .insert({
      name: input.name.trim(),
      alt_text: input.altText.trim() || input.name.trim(),
      url: parsedUrl.toString(),
      mime_type: null,
      size_bytes: null,
      storage_path: null,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as MediaAsset;
}

export async function uploadMediaAsset(file: File, name: string, altText: string): Promise<MediaAsset> {
  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    throw new Error("Only JPG, PNG, WebP, or GIF images can be uploaded.");
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error("Image files must be 5 MB or smaller.");
  }

  const supabase = await getAdminDatabaseClient();

  const extensionByType: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
  };
  const fileName = `${crypto.randomUUID()}.${extensionByType[file.type]}`;
  const storagePath = `uploads/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from(MEDIA_BUCKET)
    .upload(storagePath, file, { cacheControl: "3600", upsert: false });

  if (uploadError) {
    throw new Error(`Image upload failed: ${uploadError.message}`);
  }

  const { data: publicUrlData } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(storagePath);

  // If persistence fails after an upload, remove the object so Storage does
  // not accumulate orphaned files.
  const { data, error } = await supabase
    .from("media_assets")
    .insert({
      name: name.trim(),
      alt_text: altText.trim() || name.trim(),
      url: publicUrlData.publicUrl,
      mime_type: file.type,
      size_bytes: file.size,
      storage_path: storagePath,
    })
    .select()
    .single();

  if (error) {
    await supabase.storage.from(MEDIA_BUCKET).remove([storagePath]);
    throw new Error(error.message);
  }

  return data as MediaAsset;
}
