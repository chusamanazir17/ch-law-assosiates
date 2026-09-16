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
      {/* Top Breadcrumb */}
      <div className="text-[13px] text-slate-500 font-normal">
        <span>Website</span>
        <span className="mx-2 text-slate-400">/</span>
        <span className="text-slate-700">Media</span>
      </div>

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-[32px] font-bold tracking-tight text-slate-900 leading-tight">
            Media & Image Assets
          </h1>
          <p className="text-[14.5px] text-slate-500 mt-1">
            Store, preview, and copy image links in 1-click for embedding into articles, tax guides, and landing pages.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-[#075e38] hover:bg-[#064e2e] px-4 py-2 text-[13.5px] font-medium text-white shadow-2xs transition shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>Add new image</span>
        </button>
      </div>

      {/* Alert / Notification */}
      {message && (
        <div
          className={`flex items-center justify-between rounded-xl p-3.5 text-xs font-medium border shadow-2xs ${
            message.type === "success"
              ? "bg-[#eef7f2] text-[#075e38] border-emerald-200/80"
              : "bg-rose-50 text-rose-800 border-rose-200"
          }`}
        >
          <span>{message.text}</span>
          <button
            onClick={() => setMessage(null)}
            className="text-slate-500 hover:text-slate-800 ml-2"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Search & Info Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search images by title or alt description..."
            className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-10 pr-4 text-[13.5px] text-slate-800 placeholder-slate-400 focus:border-[#075e38] focus:outline-none focus:ring-1 focus:ring-[#075e38] shadow-2xs"
          />
        </div>

        <div className="text-[12px] text-slate-500 flex items-center gap-1.5">
          <span>Click <strong className="text-slate-800 font-semibold">Copy Link</strong> on any image to paste it directly into posts.</span>
        </div>
      </div>

      {/* Media Grid */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400 text-xs">
          <Loader2 className="h-6 w-6 animate-spin text-[#075e38] mb-2" />
          <span>Loading image gallery...</span>
        </div>
      ) : filteredAssets.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center text-xs text-slate-500 shadow-2xs">
          <FileImage className="mx-auto h-10 w-10 text-slate-300 mb-2" />
          <p className="font-semibold text-slate-800 text-sm">No images in your library yet.</p>
          <p className="text-slate-400 mt-1 max-w-sm mx-auto">
            Upload pictures of Chamber 121, e-stamping certificates, official FBR circulars, or legal tax banners.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-[#075e38] hover:bg-[#064e2e] px-4 py-2 text-xs font-medium text-white shadow-2xs transition"
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
              className="group relative rounded-xl border border-slate-200 bg-white overflow-hidden shadow-2xs hover:border-slate-300 hover:shadow-xs transition flex flex-col justify-between"
            >
              {/* Thumbnail Container */}
              <div
                className="relative aspect-video bg-slate-100 overflow-hidden cursor-pointer"
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
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition flex items-end p-2.5">
                  <span className="text-[11px] text-white font-medium">Click to inspect full size</span>
                </div>
              </div>

              {/* Card Meta & Actions */}
              <div className="p-3.5 space-y-2.5">
                <div>
                  <h3 className="font-semibold text-xs text-slate-900 truncate" title={asset.name}>
                    {asset.name}
                  </h3>
                  {asset.alt_text && (
                    <p className="text-[11.5px] text-slate-500 truncate mt-0.5" title={asset.alt_text}>
                      {asset.alt_text}
                    </p>
                  )}
                </div>

                {/* Bottom Action Buttons */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                  {/* 1-Click Copy URL Button */}
                  <button
                    onClick={() => handleCopyUrl(asset.id, asset.url)}
                    className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-semibold transition ${
                      copiedId === asset.id
                        ? "bg-[#eef7f2] text-[#075e38] border border-emerald-200/80"
                        : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 shadow-2xs"
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
                        <Copy className="h-3 w-3 text-slate-400" />
                        <span>Copy Link</span>
                      </>
                    )}
                  </button>

                  {/* Delete Button */}
                  <button
                    onClick={() => handleDelete(asset.id, asset.name)}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#eef7f2] text-[#075e38]">
                  <ImageIcon className="h-4 w-4" />
                </div>
                <h2 className="text-base font-bold text-slate-900">
                  Add Image to Library
                </h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Input Mode Selector */}
            <div className="flex rounded-lg border border-slate-200 bg-slate-50 p-1 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setInputMode("url")}
                className={`flex-1 flex items-center justify-center gap-1.5 rounded-md py-1.5 transition ${
                  inputMode === "url"
                    ? "bg-[#075e38] text-white shadow-xs font-bold"
                    : "text-slate-600 hover:text-slate-900"
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
                    ? "bg-[#075e38] text-white shadow-xs font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <UploadCloud className="h-3.5 w-3.5" />
                <span>Upload File</span>
              </button>
            </div>

            <form onSubmit={handleSaveAsset} className="space-y-4 text-xs">
              {/* Asset Title */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Image Title *
                </label>
                <input
                  type="text"
                  required
                  value={assetTitle}
                  onChange={(e) => setAssetTitle(e.target.value)}
                  placeholder="e.g. Chamber 121 Exterior Office Front"
                  className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-slate-900 placeholder-slate-400 focus:border-[#075e38] focus:outline-none focus:ring-1 focus:ring-[#075e38]"
                />
              </div>

              {/* Alt Text */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Alt Description (Accessibility & SEO)
                </label>
                <input
                  type="text"
                  value={assetAlt}
                  onChange={(e) => setAssetAlt(e.target.value)}
                  placeholder="e.g. Ch Composing legal office in Sahiwal"
                  className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-slate-900 placeholder-slate-400 focus:border-[#075e38] focus:outline-none focus:ring-1 focus:ring-[#075e38]"
                />
              </div>

              {/* URL or File Picker */}
              {inputMode === "url" ? (
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Image URL *
                  </label>
                  <input
                    type="url"
                    required
                    value={assetUrl}
                    onChange={(e) => setAssetUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-slate-900 placeholder-slate-400 focus:border-[#075e38] focus:outline-none focus:ring-1 focus:ring-[#075e38]"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
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
                    className="w-full rounded-lg border border-slate-200 bg-white p-2 text-slate-800 file:mr-2 file:rounded-md file:border-0 file:bg-[#075e38] file:px-2.5 file:py-1 file:text-xs file:font-semibold file:text-white cursor-pointer"
                  />
                </div>
              )}

              {/* Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg border border-slate-200 px-3.5 py-2 text-slate-600 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#075e38] hover:bg-[#064e2e] px-4 py-2 font-medium text-white shadow-2xs transition disabled:opacity-50"
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
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
          onClick={() => setPreviewAsset(null)}
        >
          <div
            className="max-w-3xl w-full rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900">{previewAsset.name}</h3>
              <button
                onClick={() => setPreviewAsset(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="max-h-[70vh] overflow-hidden rounded-xl bg-slate-100 flex items-center justify-center">
              <img
                src={previewAsset.url}
                alt={previewAsset.alt_text || previewAsset.name}
                className="max-h-[65vh] w-auto object-contain rounded-lg"
              />
            </div>
            <div className="flex items-center justify-between pt-2 text-xs">
              <span className="font-mono text-slate-500 text-[11px] truncate max-w-md">
                {previewAsset.url}
              </span>
              <button
                onClick={() => handleCopyUrl(previewAsset.id, previewAsset.url)}
                className="rounded-lg bg-[#075e38] hover:bg-[#064e2e] px-3.5 py-1.5 text-white font-medium shadow-2xs transition"
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
