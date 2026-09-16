"use client";

import React, { useEffect, useState } from "react";
import {
  Image as ImageIcon,
  Plus,
  Search,
  Copy,
  Check,
  Trash2,
  ExternalLink,
  UploadCloud,
  Link2,
  Loader2,
  X,
  AlertCircle,
  FileImage,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { MediaAsset } from "@/types/cms";

export default function MediaManager() {
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [previewAsset, setPreviewAsset] = useState<MediaAsset | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Add Asset Form States
  const [inputMode, setInputMode] = useState<"url" | "upload">("url");
  const [assetTitle, setAssetTitle] = useState("");
  const [assetAlt, setAssetAlt] = useState("");
  const [assetUrl, setAssetUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const loadAssets = async () => {
    setIsLoading(true);
    const supabase = createClient();
    try {
      const { data, error } = await supabase
        .from("media_assets")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setAssets(data || []);
    } catch (err: any) {
      console.error("[Media Load Error]", err);
      setMessage({ type: "error", text: "Failed to load media assets from Supabase." });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAssets();
  }, []);

  const handleCopyUrl = (id: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete image asset "${title}"?`)) return;

    const supabase = createClient();
    try {
      const { error } = await supabase.from("media_assets").delete().eq("id", id);
      if (error) throw error;
      setAssets((prev) => prev.filter((a) => a.id !== id));
      setMessage({ type: "success", text: "Image asset removed successfully." });
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to delete image asset." });
    }
  };

  const handleSaveAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assetTitle.trim()) {
      setMessage({ type: "error", text: "Please enter an asset title." });
      return;
    }

    setActionLoading(true);
    setMessage(null);
    const supabase = createClient();

    try {
      let finalUrl = assetUrl.trim();
      let mimeType = "image/jpeg";
      let fileSize: number | null = null;

      if (inputMode === "upload") {
        if (!selectedFile) {
          throw new Error("Please select an image file to upload.");
        }

        mimeType = selectedFile.type || "image/jpeg";
        fileSize = selectedFile.size;

        // Try uploading to Supabase storage bucket 'media'
        const fileExt = selectedFile.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
        const filePath = `uploads/${fileName}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("media")
          .upload(filePath, selectedFile, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) {
          // If storage bucket 'media' does not exist or fails, fallback gracefully to a data URL reader
          const base64Data = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(selectedFile);
          });
          finalUrl = base64Data;
        } else {
          const { data: publicUrlData } = supabase.storage
            .from("media")
            .getPublicUrl(filePath);
          finalUrl = publicUrlData.publicUrl;
        }
      } else {
        if (!finalUrl) {
          throw new Error("Please enter a valid image URL.");
        }
      }

      // Insert record into media_assets
      const { data, error } = await supabase
        .from("media_assets")
        .insert({
          name: assetTitle.trim(),
          alt_text: assetAlt.trim() || assetTitle.trim(),
          url: finalUrl,
          mime_type: mimeType,
          size_bytes: fileSize,
        })
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setAssets((prev) => [data, ...prev]);
      }

      setMessage({ type: "success", text: "Image asset saved successfully!" });
      setIsModalOpen(false);
      // Reset form
      setAssetTitle("");
      setAssetAlt("");
      setAssetUrl("");
      setSelectedFile(null);
    } catch (err: any) {
      console.error("[Save Media Error]", err);
      setMessage({ type: "error", text: err.message || "Failed to save image asset." });
    } finally {
      setActionLoading(false);
    }
  };

  const filteredAssets = assets.filter(
    (a) =>
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.alt_text && a.alt_text.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-sky-400/20 text-sky-400">
              <ImageIcon className="h-3.5 w-3.5" />
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-sky-400">
              Asset & Gallery Management
            </span>
          </div>
          <h1 className="mt-1 text-2xl font-bold font-serif text-white tracking-tight sm:text-3xl">
            Media & Image Assets
          </h1>
          <p className="mt-1 text-xs text-white/60">
            Store, preview, and copy image links in 1-click for embedding into articles, tax guides, and landing pages.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-gold-500 to-gold-600 px-4 py-2.5 text-xs font-bold text-navy-950 shadow-md shadow-gold-500/20 hover:from-gold-400 hover:to-gold-500 transition shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>Add New Image</span>
        </button>
      </div>

      {/* Alert / Notification */}
      {message && (
        <div
          className={`flex items-center justify-between rounded-xl p-4 text-xs font-medium border ${
            message.type === "success"
              ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
              : "bg-red-500/10 text-red-300 border-red-500/30"
          }`}
        >
          <span>{message.text}</span>
          <button
            onClick={() => setMessage(null)}
            className="text-white/60 hover:text-white ml-2"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Search & Info Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-white/10 bg-navy-900/60 p-4 backdrop-blur-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search images by title or alt description..."
            className="w-full rounded-lg border border-white/10 bg-navy-950/80 py-2 pl-9 pr-4 text-xs text-white placeholder-white/40 focus:border-gold-400 focus:outline-none"
          />
        </div>

        <div className="text-[11px] text-white/50 flex items-center gap-2">
          <span>Click <strong className="text-gold-400">Copy URL</strong> on any image to paste it directly into posts.</span>
        </div>
      </div>

      {/* Media Grid */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-white/50 text-xs">
          <Loader2 className="h-6 w-6 animate-spin text-gold-400 mb-2" />
          <span>Loading image gallery...</span>
        </div>
      ) : filteredAssets.length === 0 ? (
        <div className="rounded-xl border border-white/10 bg-navy-900/60 p-12 text-center text-xs text-white/60">
          <FileImage className="mx-auto h-10 w-10 text-white/30 mb-2" />
          <p className="font-semibold text-white">No images in your library yet.</p>
          <p className="text-white/40 mt-1 max-w-sm mx-auto">
            Upload pictures of Chamber 121, e-stamping certificates, official FBR circulars, or legal tax banners.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-gold-500 px-4 py-2 text-xs font-bold text-navy-950 hover:bg-gold-400 transition"
          >
            <Plus className="h-3.5 w-3.5" />
            Add First Image
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filteredAssets.map((asset) => (
            <div
              key={asset.id}
              className="group relative rounded-xl border border-white/10 bg-navy-900/80 overflow-hidden shadow-lg hover:border-gold-400/40 transition flex flex-col justify-between"
            >
              {/* Thumbnail Container */}
              <div
                className="relative aspect-video bg-black/40 overflow-hidden cursor-pointer"
                onClick={() => setPreviewAsset(asset)}
              >
                <img
                  src={asset.url}
                  alt={asset.alt_text || asset.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = "none";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition flex items-end p-2.5">
                  <span className="text-[10px] text-white/90 font-medium">Click to inspect full size</span>
                </div>
              </div>

              {/* Card Meta & Actions */}
              <div className="p-3.5 space-y-2.5">
                <div>
                  <h3 className="font-semibold text-xs text-white truncate" title={asset.name}>
                    {asset.name}
                  </h3>
                  {asset.alt_text && (
                    <p className="text-[11px] text-white/50 truncate mt-0.5" title={asset.alt_text}>
                      {asset.alt_text}
                    </p>
                  )}
                </div>

                {/* Bottom Action Buttons */}
                <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs">
                  {/* 1-Click Copy URL Button */}
                  <button
                    onClick={() => handleCopyUrl(asset.id, asset.url)}
                    className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-semibold transition ${
                      copiedId === asset.id
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : "bg-white/[0.05] text-gold-400 hover:bg-gold-400/15 border border-white/10"
                    }`}
                    title="Copy URL to clipboard"
                  >
                    {copiedId === asset.id ? (
                      <>
                        <Check className="h-3 w-3" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" />
                        <span>Copy Link</span>
                      </>
                    )}
                  </button>

                  {/* Delete Button */}
                  <button
                    onClick={() => handleDelete(asset.id, asset.name)}
                    className="rounded-lg p-1.5 text-white/40 hover:bg-red-500/10 hover:text-red-400 transition"
                    title="Delete Image Asset"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add New Image Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-white/15 bg-navy-950 p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5 text-gold-400" />
                <h2 className="text-base font-bold font-serif text-white">
                  Add Image to Library
                </h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1 text-white/50 hover:bg-white/10 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Input Mode Selector */}
            <div className="flex rounded-lg border border-white/10 bg-white/[0.04] p-1 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setInputMode("url")}
                className={`flex-1 flex items-center justify-center gap-1.5 rounded-md py-1.5 transition ${
                  inputMode === "url"
                    ? "bg-gold-500 text-navy-950 font-bold"
                    : "text-white/70 hover:text-white"
                }`}
              >
                <Link2 className="h-3.5 w-3.5" />
                <span>Image URL</span>
              </button>
              <button
                type="button"
                onClick={() => setInputMode("upload")}
                className={`flex-1 flex items-center justify-center gap-1.5 rounded-md py-1.5 transition ${
                  inputMode === "upload"
                    ? "bg-gold-500 text-navy-950 font-bold"
                    : "text-white/70 hover:text-white"
                }`}
              >
                <UploadCloud className="h-3.5 w-3.5" />
                <span>Upload File</span>
              </button>
            </div>

            <form onSubmit={handleSaveAsset} className="space-y-4 text-xs">
              {/* Asset Title */}
              <div>
                <label className="block text-white/70 font-semibold mb-1">
                  Image Title *
                </label>
                <input
                  type="text"
                  required
                  value={assetTitle}
                  onChange={(e) => setAssetTitle(e.target.value)}
                  placeholder="e.g. Chamber 121 Exterior Office Front"
                  className="w-full rounded-lg border border-white/10 bg-navy-900/80 px-3.5 py-2 text-white placeholder-white/30 focus:border-gold-400 focus:outline-none"
                />
              </div>

              {/* Alt Text */}
              <div>
                <label className="block text-white/70 font-semibold mb-1">
                  Alt Description (Accessibility & SEO)
                </label>
                <input
                  type="text"
                  value={assetAlt}
                  onChange={(e) => setAssetAlt(e.target.value)}
                  placeholder="e.g. Ch Composing legal office in Sahiwal"
                  className="w-full rounded-lg border border-white/10 bg-navy-900/80 px-3.5 py-2 text-white placeholder-white/30 focus:border-gold-400 focus:outline-none"
                />
              </div>

              {/* URL or File Picker */}
              {inputMode === "url" ? (
                <div>
                  <label className="block text-white/70 font-semibold mb-1">
                    Image URL *
                  </label>
                  <input
                    type="url"
                    required
                    value={assetUrl}
                    onChange={(e) => setAssetUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="w-full rounded-lg border border-white/10 bg-navy-900/80 px-3.5 py-2 text-white placeholder-white/30 focus:border-gold-400 focus:outline-none"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-white/70 font-semibold mb-1">
                    Select Image File *
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    required
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setSelectedFile(e.target.files[0]);
                        if (!assetTitle) {
                          setAssetTitle(e.target.files[0].name.replace(/\.[^/.]+$/, ""));
                        }
                      }
                    }}
                    className="w-full rounded-lg border border-white/10 bg-navy-900/80 p-2 text-white/80 file:mr-2 file:rounded-md file:border-0 file:bg-gold-500 file:px-2.5 file:py-1 file:text-xs file:font-semibold file:text-navy-950 cursor-pointer"
                  />
                </div>
              )}

              {/* Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg border border-white/15 px-3.5 py-2 text-white/70 hover:bg-white/10 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-gold-500 px-4 py-2 font-bold text-navy-950 hover:bg-gold-400 transition disabled:opacity-50"
                >
                  {actionLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  <span>Save Asset</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Full Image Preview Modal */}
      {previewAsset && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          onClick={() => setPreviewAsset(null)}
        >
          <div
            className="max-w-3xl w-full rounded-2xl border border-white/15 bg-navy-950 p-4 shadow-2xl space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <h3 className="font-bold text-sm text-white">{previewAsset.name}</h3>
              <button
                onClick={() => setPreviewAsset(null)}
                className="rounded-lg p-1 text-white/60 hover:bg-white/10 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="max-h-[70vh] overflow-hidden rounded-xl bg-black/60 flex items-center justify-center">
              <img
                src={previewAsset.url}
                alt={previewAsset.alt_text || previewAsset.name}
                className="max-h-[65vh] w-auto object-contain rounded-lg"
              />
            </div>
            <div className="flex items-center justify-between pt-2 text-xs">
              <span className="font-mono text-white/50 text-[11px] truncate max-w-md">
                {previewAsset.url}
              </span>
              <button
                onClick={() => handleCopyUrl(previewAsset.id, previewAsset.url)}
                className="rounded-md bg-gold-500 px-3 py-1 text-navy-950 font-bold hover:bg-gold-400 transition"
              >
                {copiedId === previewAsset.id ? "Copied!" : "Copy URL"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
