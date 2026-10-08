"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AlertCircle, Check, Image as ImageIcon, Link2, Loader2, Search, UploadCloud, X } from "lucide-react";
import type { MediaAsset } from "@/types/cms";
import { apiFetch } from "@/lib/client/apiFetch";

interface MediaPickerProps {
  open: boolean;
  onClose: () => void;
  onSelect: (url: string, asset?: MediaAsset) => void;
  title?: string;
}

type PickerTab = "library" | "upload" | "url";

/**
 * Reusable media-library picker for CMS editors (post cover image, service
 * hero image, page hero image). Reads and writes through the validated
 * /api/admin/media upload path (5 MB cap, image MIME allowlist, admin-gated).
 */
export default function MediaPicker({ open, onClose, onSelect, title = "Choose image" }: MediaPickerProps) {
  const [tab, setTab] = useState<PickerTab>("library");
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Upload tab state
  const [assetTitle, setAssetTitle] = useState("");
  const [assetAlt, setAssetAlt] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // URL tab state
  const [imageUrl, setImageUrl] = useState("");
  const [urlTitle, setUrlTitle] = useState("");

  const loadAssets = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await apiFetch("/api/admin/media", { cache: "no-store" });
      const json = (await res.json()) as { success?: boolean; assets?: MediaAsset[]; error?: string };
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to load media assets.");
      }
      setAssets(json.assets ?? []);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load media assets.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      setError(null);
      setSearchQuery("");
      void loadAssets();
    }
  }, [open, loadAssets]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const filteredAssets = assets.filter((asset) => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return true;
    return (
      asset.name.toLowerCase().includes(query) ||
      (asset.alt_text ?? "").toLowerCase().includes(query)
    );
  });

  const handleUpload = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    if (!selectedFile) {
      setError("Please select an image file to upload.");
      return;
    }
    if (!assetTitle.trim()) {
      setError("Please enter a title for the image.");
      return;
    }

    setIsUploading(true);
    try {
      const form = new FormData();
      form.set("file", selectedFile);
      form.set("name", assetTitle.trim());
      form.set("altText", assetAlt.trim());

      const res = await apiFetch("/api/admin/media", { method: "POST", body: form });
      const json = (await res.json()) as { success?: boolean; asset?: MediaAsset; error?: string };
      if (!res.ok || !json.success || !json.asset) {
        throw new Error(json.error || "Image upload failed.");
      }

      setAssets((prev) => [json.asset as MediaAsset, ...prev]);
      onSelect(json.asset.url, json.asset);
      setSelectedFile(null);
      setAssetTitle("");
      setAssetAlt("");
      onClose();
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Image upload failed.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleUrlAdd = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    const url = imageUrl.trim();
    if (!url) {
      setError("Please enter an image URL.");
      return;
    }
    if (!urlTitle.trim()) {
      setError("Please enter a title for the image.");
      return;
    }
    try {
      const parsed = new URL(url);
      if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
        throw new Error("Image URLs must use HTTP or HTTPS.");
      }
    } catch {
      setError("Please enter a valid HTTP or HTTPS image URL.");
      return;
    }

    setIsUploading(true);
    try {
      const res = await apiFetch("/api/admin/media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: urlTitle.trim(), altText: assetAlt.trim(), url }),
      });
      const json = (await res.json()) as { success?: boolean; asset?: MediaAsset; error?: string };
      if (!res.ok || !json.success || !json.asset) {
        throw new Error(json.error || "Failed to save image.");
      }
      setAssets((prev) => [json.asset as MediaAsset, ...prev]);
      onSelect(json.asset.url, json.asset);
      setImageUrl("");
      setUrlTitle("");
      onClose();
    } catch (urlError) {
      setError(urlError instanceof Error ? urlError.message : "Failed to save image.");
    } finally {
      setIsUploading(false);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 p-3 backdrop-blur-xs sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={onClose}
    >
      <div
        className="card flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h2 className="text-base font-bold text-slate-950">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close media picker"
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-900"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex gap-1 border-b border-slate-200 px-5 pt-3">
          {(
            [
              ["library", "Media library"],
              ["upload", "Upload"],
              ["url", "From URL"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`rounded-t-lg px-4 py-2.5 text-xs font-semibold transition ${
                tab === id
                  ? "bg-emerald-50 text-emerald-800"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-5">
          {error && (
            <div role="alert" className="mb-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-800">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {tab === "library" && (
            <>
              <div className="relative mb-4">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search images by title..."
                  className="input-field pl-9"
                />
              </div>

              {isLoading ? (
                <div className="flex min-h-48 items-center justify-center gap-2 text-sm text-slate-500">
                  <Loader2 className="h-5 w-5 animate-spin text-emerald-700" />
                  Loading images...
                </div>
              ) : filteredAssets.length === 0 ? (
                <div className="flex min-h-48 flex-col items-center justify-center text-center">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                    <ImageIcon className="h-5 w-5" />
                  </div>
                  <p className="mt-3 text-sm font-semibold text-slate-900">No images found</p>
                  <p className="mt-1 max-w-sm text-xs text-slate-500">
                    Upload a new image from the Upload tab or add one from a URL.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                  {filteredAssets.map((asset) => (
                    <button
                      key={asset.id}
                      type="button"
                      onClick={() => {
                        onSelect(asset.url, asset);
                        onClose();
                      }}
                      className="group overflow-hidden rounded-xl border border-slate-200 bg-white text-left shadow-sm transition hover:border-emerald-400 hover:shadow"
                      title={`Use "${asset.name}"`}
                    >
                      <div className="relative aspect-video bg-slate-100">
                        <img
                          src={asset.url}
                          alt={asset.alt_text || asset.name}
                          loading="lazy"
                          className="h-full w-full object-cover"
                        />
                        <span className="absolute inset-0 hidden items-center justify-center bg-emerald-900/60 text-xs font-bold text-white group-hover:flex">
                          <Check className="mr-1 h-4 w-4" /> Select
                        </span>
                      </div>
                      <div className="truncate px-2.5 py-2 text-[11px] font-medium text-slate-700">
                        {asset.name}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}

          {tab === "upload" && (
            <form onSubmit={handleUpload} className="mx-auto max-w-md space-y-4">
              <div>
                <label htmlFor="picker-upload-file" className="form-label">Image file</label>
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => fileInputRef.current?.click()}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") fileInputRef.current?.click();
                  }}
                  className="mt-1.5 flex min-h-36 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center transition hover:border-emerald-400 hover:bg-emerald-50/50"
                >
                  <UploadCloud className="h-8 w-8 text-slate-400" />
                  <p className="text-xs font-semibold text-slate-700">
                    {selectedFile ? selectedFile.name : "Click to choose an image"}
                  </p>
                  <p className="text-[11px] text-slate-500">JPG, PNG, WebP or GIF — up to 5 MB</p>
                </div>
                <input
                  ref={fileInputRef}
                  id="picker-upload-file"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="sr-only"
                  onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
                />
              </div>
              <div>
                <label htmlFor="picker-upload-title" className="form-label">Title</label>
                <input
                  id="picker-upload-title"
                  value={assetTitle}
                  onChange={(event) => setAssetTitle(event.target.value)}
                  placeholder="Descriptive title for the media library"
                  maxLength={120}
                  className="input-field"
                />
              </div>
              <div>
                <label htmlFor="picker-upload-alt" className="form-label">Alt text (optional)</label>
                <input
                  id="picker-upload-alt"
                  value={assetAlt}
                  onChange={(event) => setAssetAlt(event.target.value)}
                  placeholder="Accessibility description"
                  maxLength={200}
                  className="input-field"
                />
              </div>
              <button type="submit" disabled={isUploading} className="btn-primary w-full">
                {isUploading ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" /> Uploading...
                  </span>
                ) : (
                  "Upload & use image"
                )}
              </button>
            </form>
          )}

          {tab === "url" && (
            <form onSubmit={handleUrlAdd} className="mx-auto max-w-md space-y-4">
              <div>
                <label htmlFor="picker-url" className="form-label">Image URL</label>
                <div className="relative">
                  <Link2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    id="picker-url"
                    type="url"
                    value={imageUrl}
                    onChange={(event) => setImageUrl(event.target.value)}
                    placeholder="https://..."
                    className="input-field pl-9"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="picker-url-title" className="form-label">Title</label>
                <input
                  id="picker-url-title"
                  value={urlTitle}
                  onChange={(event) => setUrlTitle(event.target.value)}
                  placeholder="Descriptive title for the media library"
                  maxLength={120}
                  className="input-field"
                />
              </div>
              <button type="submit" disabled={isUploading} className="btn-primary w-full">
                {isUploading ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" /> Saving...
                  </span>
                ) : (
                  "Save & use image"
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
