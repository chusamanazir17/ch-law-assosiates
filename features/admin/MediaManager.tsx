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
    try {
      const res = await fetch("/api/admin/media");
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "Failed to load media assets.");
      setAssets(json.assets || []);
    } catch (err: unknown) {
      console.error("[Media Load Error]", err);
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Failed to load media assets from Supabase." });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAssets();
  }, []);

  const handleCopyUrl = async (id: string, url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      setMessage({ type: "error", text: "The image URL could not be copied to the clipboard." });
    }
  };

  const handleDelete = async (asset: MediaAsset) => {
    if (!confirm(`Delete image asset "${asset.name}"?`)) return;

    try {
      const params = new URLSearchParams({ id: asset.id });
      if (asset.storage_path) params.set("storagePath", asset.storage_path);
      const res = await fetch(`/api/admin/media?${params.toString()}`, { method: "DELETE" });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.success) throw new Error(json.error || "Failed to delete image asset.");

      setAssets((prev) => prev.filter((item) => item.id !== asset.id));
      setMessage(
        json.storageWarning
          ? { type: "error", text: "The media record was removed, but the stored file could not be deleted. Check Supabase Storage permissions." }
          : { type: "success", text: "Image asset removed successfully." }
      );
    } catch (err: unknown) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Failed to delete image asset." });
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
    try {
      let savedAsset: MediaAsset | null = null;

      if (inputMode === "upload") {
        if (!selectedFile) {
          throw new Error("Please select an image file to upload.");
        }

        const formData = new FormData();
        formData.set("file", selectedFile);
        formData.set("name", assetTitle.trim());
        formData.set("altText", assetAlt.trim());

        const res = await fetch("/api/admin/media", { method: "POST", body: formData });
        const json = await res.json().catch(() => ({}));
        if (!res.ok || !json.success) throw new Error(json.error || "Image upload failed.");
        savedAsset = json.asset as MediaAsset;
      } else {
        const finalUrl = assetUrl.trim();
        if (!finalUrl) {
          throw new Error("Please enter a valid image URL.");
        }

        const res = await fetch("/api/admin/media", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: assetTitle.trim(), altText: assetAlt.trim(), url: finalUrl }),
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok || !json.success) throw new Error(json.error || "Failed to save media asset.");
        savedAsset = json.asset as MediaAsset;
      }

      if (savedAsset) {
        setAssets((prev) => [savedAsset as MediaAsset, ...prev]);
      }

      setMessage({ type: "success", text: "Image asset saved successfully!" });
      setIsModalOpen(false);
      // Reset form
      setAssetTitle("");
      setAssetAlt("");
      setAssetUrl("");
      setSelectedFile(null);
    } catch (err: unknown) {
      console.error("[Save Media Error]", err);
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Failed to save image asset." });
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
      <div className="text-xs text-[#52627A] font-medium">
        <span>Website</span>
        <span className="mx-2 text-[#94A3B8]">/</span>
        <span className="text-[#0B1F36]">Media</span>
      </div>

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0B1F36]">
            Media & Image Assets
          </h1>
          <p className="mt-0.5 text-xs text-[#52627A] leading-relaxed">
            Store, preview, and copy image links in 1-click for embedding into articles, tax guides, and landing pages.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-[#0B1F36] hover:bg-[#102943] px-3.5 py-2 text-xs font-semibold text-white shadow-xs transition shrink-0"
        >
          <Plus className="h-3.5 w-3.5 text-[#C8973D]" />
          <span>Add new image</span>
        </button>
      </div>

      {/* Alert / Notification */}
      {message && (
        <div
          className={`flex items-center justify-between rounded-xl p-3.5 text-xs font-medium border shadow-xs ${
            message.type === "success"
              ? "bg-[#FDF8EE] text-[#96641E] border-[#C8973D]/40"
              : "bg-rose-50 text-rose-800 border-rose-200"
          }`}
        >
          <span>{message.text}</span>
          <button
            onClick={() => setMessage(null)}
            className="text-[#52627A] hover:text-[#0B1F36] ml-2 text-xs font-semibold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Search & Info Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94A3B8]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search images by title or alt description..."
            className="w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] py-2 pl-10 pr-4 text-xs text-[#0B1F36] placeholder:text-[#94A3B8] focus:border-[#C8973D] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C8973D]/20 shadow-xs transition"
          />
        </div>

        <div className="text-xs text-[#52627A] flex items-center gap-1.5">
          <span>Click <strong className="text-[#0B1F36] font-semibold">Copy Link</strong> on any image to paste it directly into posts.</span>
        </div>
      </div>

      {/* Media Grid */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-[#52627A] text-xs">
          <Loader2 className="h-6 w-6 animate-spin text-[#C8973D] mb-2" />
          <span>Loading image gallery...</span>
        </div>
      ) : filteredAssets.length === 0 ? (
        <div className="rounded-xl border border-[#E2E8F0] bg-white p-12 text-center text-xs text-[#52627A] shadow-xs">
          <FileImage className="mx-auto h-10 w-10 text-[#C8973D]/60 mb-2" />
          <p className="font-semibold text-[#0B1F36] text-sm">No images in your library yet.</p>
          <p className="text-[#52627A] mt-1 max-w-sm mx-auto text-xs leading-relaxed">
            Upload pictures of Chamber 121, e-stamping certificates, official FBR circulars, or legal tax banners.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-[#0B1F36] hover:bg-[#102943] px-3.5 py-2 text-xs font-semibold text-white shadow-xs transition"
          >
            <Plus className="h-3.5 w-3.5 text-[#C8973D]" />
            Add First Image
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filteredAssets.map((asset) => (
            <div
              key={asset.id}
              className="group relative rounded-xl border border-[#E2E8F0] bg-white overflow-hidden shadow-xs hover:border-[#CBD5E1] hover:shadow-sm transition flex flex-col justify-between"
            >
              {/* Thumbnail Container */}
              <div
                className="relative aspect-video bg-[#F8FAFC] overflow-hidden cursor-pointer"
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
                  <h3 className="font-semibold text-xs text-[#0B1F36] truncate" title={asset.name}>
                    {asset.name}
                  </h3>
                  {asset.alt_text && (
                    <p className="text-[11px] text-[#52627A] truncate mt-0.5" title={asset.alt_text}>
                      {asset.alt_text}
                    </p>
                  )}
                </div>

                {/* Bottom Action Buttons */}
                <div className="flex items-center justify-between pt-2 border-t border-[#F1F5F9] text-xs">
                  {/* 1-Click Copy URL Button */}
                  <button
                    onClick={() => handleCopyUrl(asset.id, asset.url)}
                    className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-semibold transition ${
                      copiedId === asset.id
                        ? "bg-[#FDF8EE] text-[#96641E] border border-[#C8973D]/40"
                        : "bg-white text-[#52627A] hover:bg-[#F8FAFC] hover:text-[#0B1F36] border border-[#E2E8F0] shadow-xs"
                    }`}
                    title="Copy URL to clipboard"
                  >
                    {copiedId === asset.id ? (
                      <>
                        <Check className="h-3 w-3 text-[#C8973D]" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3 text-[#94A3B8]" />
                        <span>Copy Link</span>
                      </>
                    )}
                  </button>

                  {/* Delete Button */}
                  <button
                    onClick={() => handleDelete(asset)}
                    className="rounded-lg p-1.5 text-[#94A3B8] hover:bg-rose-50 hover:text-rose-600 transition"
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
          <div className="w-full max-w-md rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FDF8EE] text-[#C8973D]">
                  <ImageIcon className="h-4 w-4" />
                </div>
                <h2 className="text-sm font-bold text-[#0B1F36]">
                  Add Image to Library
                </h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1 text-[#94A3B8] hover:bg-[#F8FAFC] hover:text-[#0B1F36] transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Input Mode Selector */}
            <div className="flex rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-1 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setInputMode("url")}
                className={`flex-1 flex items-center justify-center gap-1.5 rounded-md py-1.5 transition ${
                  inputMode === "url"
                    ? "bg-[#0B1F36] text-white shadow-xs font-bold"
                    : "text-[#52627A] hover:text-[#0B1F36]"
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
                    ? "bg-[#0B1F36] text-white shadow-xs font-bold"
                    : "text-[#52627A] hover:text-[#0B1F36]"
                }`}
              >
                <UploadCloud className="h-3.5 w-3.5" />
                <span>Upload File</span>
              </button>
            </div>

            <form onSubmit={handleSaveAsset} className="space-y-4 text-xs">
              {/* Asset Title */}
              <div>
                <label className="block text-xs font-semibold text-[#0B1F36] mb-1">
                  Image Title *
                </label>
                <input
                  type="text"
                  required
                  value={assetTitle}
                  onChange={(e) => setAssetTitle(e.target.value)}
                  placeholder="e.g. Chamber 121 Exterior Office Front"
                  className="w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2 text-xs text-[#0B1F36] placeholder:text-[#94A3B8] focus:border-[#C8973D] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C8973D]/20 transition"
                />
              </div>

              {/* Alt Text */}
              <div>
                <label className="block text-xs font-semibold text-[#0B1F36] mb-1">
                  Alt Description (Accessibility & SEO)
                </label>
                <input
                  type="text"
                  value={assetAlt}
                  onChange={(e) => setAssetAlt(e.target.value)}
                  placeholder="e.g. Ch Composing legal office in Sahiwal"
                  className="w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2 text-xs text-[#0B1F36] placeholder:text-[#94A3B8] focus:border-[#C8973D] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C8973D]/20 transition"
                />
              </div>

              {/* URL or File Picker */}
              {inputMode === "url" ? (
                <div>
                  <label className="block text-xs font-semibold text-[#0B1F36] mb-1">
                    Image URL *
                  </label>
                  <input
                    type="url"
                    required
                    value={assetUrl}
                    onChange={(e) => setAssetUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2 text-xs text-[#0B1F36] placeholder:text-[#94A3B8] focus:border-[#C8973D] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C8973D]/20 transition"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-[#0B1F36] mb-1">
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
                    className="w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-2 text-xs text-[#0B1F36] file:mr-2 file:rounded-md file:border-0 file:bg-[#0B1F36] file:px-2.5 file:py-1 file:text-xs file:font-semibold file:text-white cursor-pointer"
                  />
                </div>
              )}

              {/* Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E2E8F0]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg border border-[#E2E8F0] bg-white px-3.5 py-2 text-xs font-semibold text-[#52627A] hover:bg-[#F8FAFC] hover:text-[#0B1F36] transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#0B1F36] hover:bg-[#102943] px-3.5 py-2 text-xs font-semibold text-white shadow-xs transition disabled:opacity-50"
                >
                  {actionLoading && <Loader2 className="h-3.5 w-3.5 animate-spin text-[#C8973D]" />}
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
            className="max-w-3xl w-full rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-2xl space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0]">
              <h3 className="font-semibold text-sm text-[#0B1F36]">{previewAsset.name}</h3>
              <button
                onClick={() => setPreviewAsset(null)}
                className="rounded-lg p-1 text-[#94A3B8] hover:bg-[#F8FAFC] hover:text-[#0B1F36] transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="max-h-[70vh] overflow-hidden rounded-xl bg-[#F8FAFC] flex items-center justify-center border border-[#E2E8F0]">
              <img
                src={previewAsset.url}
                alt={previewAsset.alt_text || previewAsset.name}
                className="max-h-[65vh] w-auto object-contain rounded-lg"
              />
            </div>
            <div className="flex items-center justify-between pt-2 text-xs">
              <span className="font-mono text-[#52627A] text-[11px] truncate max-w-md">
                {previewAsset.url}
              </span>
              <button
                onClick={() => handleCopyUrl(previewAsset.id, previewAsset.url)}
                className="rounded-lg bg-[#0B1F36] hover:bg-[#102943] px-3.5 py-1.5 text-white font-semibold text-xs shadow-xs transition"
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
