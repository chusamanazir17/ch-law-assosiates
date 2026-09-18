"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  FileText,
  ExternalLink,
  Edit3,
  CheckCircle2,
  Clock,
  Sparkles,
  Save,
  X,
  Eye,
  Loader2,
  Image as ImageIcon,
  Check,
  AlertCircle,
  RefreshCw,
  Search,
  Globe,
  Sliders,
  ArrowUpRight,
} from "lucide-react";
import type { PageContentItem } from "@/lib/db/pagesContentStore";

export default function PagesContentManager() {
  const [pages, setPages] = useState<PageContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPage, setSelectedPage] = useState<PageContentItem | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"hero" | "cta" | "content" | "seo">("hero");

  // Form state
  const [formData, setFormData] = useState<Partial<PageContentItem>>({});

  const fetchPages = async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const res = await fetch("/api/admin/pages");
      const data = await res.json();
      if (res.ok && data.success) {
        setPages(data.pages);
      } else {
        throw new Error(data.error || "Failed to load pages");
      }
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Failed to load page content.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPages();
  }, []);

  const openEditor = (page: PageContentItem) => {
    setSelectedPage(page);
    setFormData({ ...page });
    setIsEditing(true);
    setSaveSuccess(null);
    setSaveError(null);
    setActiveTab("hero");
  };

  const closeEditor = () => {
    setIsEditing(false);
    setSelectedPage(null);
    setFormData({});
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.id) return;

    setIsSaving(true);
    setSaveSuccess(null);
    setSaveError(null);

    try {
      const res = await fetch("/api/admin/pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setSaveSuccess(data.message || "Page updated successfully!");
        // Update local state
        setPages((prev) => prev.map((p) => (p.id === data.page.id ? data.page : p)));
        setSelectedPage(data.page);
      } else {
        throw new Error(data.error || "Failed to save changes");
      }
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to save changes");
    } finally {
      setIsSaving(false);
    }
  };

  const filteredPages = pages.filter(
    (p) =>
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.route.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.heroHeadline.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center text-[13px] text-slate-500">
        <Link href="/admin" className="hover:text-slate-800 transition">
          Office CMS
        </Link>
        <span className="mx-2 text-slate-400">/</span>
        <span className="text-slate-900 font-medium">Page Content Management</span>
      </div>

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-[30px] font-bold tracking-tight text-slate-900 leading-tight">
            Page Content & Visuals
          </h1>
          <p className="text-[14.5px] text-slate-500 mt-1">
            Access and edit live headlines, hero banners, media images, and action buttons for all public pages.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-[13.5px] font-medium text-slate-700 shadow-2xs hover:bg-slate-50 transition"
          >
            <ExternalLink className="h-4 w-4 text-slate-500" />
            <span>Open Website</span>
          </Link>
          <button
            type="button"
            onClick={fetchPages}
            disabled={isLoading}
            className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50 shadow-2xs transition"
            title="Refresh list"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin text-emerald-700" : ""}`} />
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search pages by title or route..."
            className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-4 text-sm text-slate-800 placeholder-slate-400 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/10 shadow-2xs"
          />
        </div>
        <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          {filteredPages.length} Public Pages Configured
        </div>
      </div>

      {/* Error Alert if Load Fails */}
      {loadError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <span>{loadError}</span>
          </div>
          <button onClick={fetchPages} className="font-semibold underline underline-offset-2">
            Retry
          </button>
        </div>
      )}

      {/* Pages Grid */}
      {isLoading ? (
        <div className="flex min-h-64 items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-500">
          <Loader2 className="h-5 w-5 animate-spin text-emerald-700" />
          <span>Loading page content catalog...</span>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredPages.map((page) => (
            <div
              key={page.id}
              className="group flex flex-col justify-between rounded-xl border border-slate-200 bg-white overflow-hidden shadow-2xs transition hover:border-slate-300 hover:shadow-xs"
            >
              {/* Thumbnail Image with Route Overlay */}
              <div className="relative h-36 w-full bg-slate-100 overflow-hidden border-b border-slate-100">
                <img
                  src={page.heroImage}
                  alt={page.title}
                  className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                  onError={(e) => {
                    // Fallback to placeholder if broken image
                    (e.target as HTMLImageElement).src =
                      "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=640&q=70";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent" />
                <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white">
                  <span className="font-mono text-[11px] font-semibold bg-slate-900/70 px-2 py-0.5 rounded backdrop-blur-xs">
                    {page.route}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                    <CheckCircle2 className="h-2.5 w-2.5" />
                    {page.status}
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-semibold text-slate-900 text-base group-hover:text-emerald-800 transition leading-snug">
                    {page.title}
                  </h3>
                  <p className="text-xs text-emerald-800 font-medium uppercase tracking-wider mt-1">
                    {page.heroBadge}
                  </p>
                  <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
                    {page.heroHeadline}
                  </p>
                </div>

                {/* Footer Buttons */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => openEditor(page)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#075e38] px-3.5 py-1.5 text-xs font-semibold text-white shadow-2xs transition hover:bg-[#064e2e] cursor-pointer"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                    <span>Edit Content</span>
                  </button>

                  <Link
                    href={page.route}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
                  >
                    <span>Live Page</span>
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Interactive Edit Modal / Slide-over */}
      {isEditing && selectedPage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
          <div className="relative w-full max-w-3xl max-h-[92vh] flex flex-col rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-slate-50/80">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-slate-900 leading-tight">
                      Edit {selectedPage.title}
                    </h2>
                    <span className="font-mono text-xs text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded">
                      {selectedPage.route}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Modifications will be reflected live on the public site route.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href={selectedPage.route}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-800 hover:underline px-2 py-1"
                >
                  <Eye className="h-3.5 w-3.5" />
                  <span>Preview Page</span>
                </Link>
                <button
                  type="button"
                  onClick={closeEditor}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Modal Navigation Tabs */}
            <div className="flex border-b border-slate-200 bg-white px-6">
              {[
                { id: "hero", label: "Hero & Banner", icon: ImageIcon },
                { id: "cta", label: "Calls-to-Action", icon: Sliders },
                { id: "content", label: "Lead Narrative", icon: FileText },
                { id: "seo", label: "SEO Metadata", icon: Globe },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-semibold transition ${
                      isActive
                        ? "border-[#075e38] text-[#075e38]"
                        : "border-transparent text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Feedback Notifications inside Modal */}
            {saveSuccess && (
              <div className="mx-6 mt-4 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-xs text-emerald-800">
                <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>{saveSuccess}</span>
              </div>
            )}
            {saveError && (
              <div className="mx-6 mt-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-xs text-red-800">
                <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
                <span>{saveError}</span>
              </div>
            )}

            {/* Form Fields Body */}
            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-5">
              {activeTab === "hero" && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Hero Badge / Pill Text
                    </label>
                    <input
                      type="text"
                      value={formData.heroBadge || ""}
                      onChange={(e) => setFormData({ ...formData, heroBadge: e.target.value })}
                      placeholder="e.g. AUTHORIZED DOCUMENTATION EXPERTS"
                      className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3.5 py-2 text-sm text-slate-800 focus:bg-white focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/10"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Main Page Headline (H1)
                    </label>
                    <input
                      type="text"
                      value={formData.heroHeadline || ""}
                      onChange={(e) => setFormData({ ...formData, heroHeadline: e.target.value })}
                      placeholder="e.g. Premium Legal Documentation Services in Pakistan"
                      className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3.5 py-2 text-sm text-slate-800 focus:bg-white focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/10 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Hero Subtitle / Description
                    </label>
                    <textarea
                      rows={3}
                      value={formData.heroSubtitle || ""}
                      onChange={(e) => setFormData({ ...formData, heroSubtitle: e.target.value })}
                      placeholder="Concise 1-2 sentence description appearing under the main headline"
                      className="w-full rounded-lg border border-slate-200 bg-slate-50/50 p-3 text-sm text-slate-800 focus:bg-white focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/10"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Hero Banner Image URL
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={formData.heroImage || ""}
                        onChange={(e) => setFormData({ ...formData, heroImage: e.target.value })}
                        placeholder="https://images.unsplash.com/..."
                        className="flex-1 rounded-lg border border-slate-200 bg-slate-50/50 px-3.5 py-2 text-sm text-slate-800 focus:bg-white focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/10 font-mono text-xs"
                      />
                    </div>
                    {/* Live Image Preview */}
                    {formData.heroImage && (
                      <div className="mt-2.5 rounded-lg border border-slate-200 overflow-hidden h-32 bg-slate-100 flex items-center justify-center">
                        <img
                          src={formData.heroImage}
                          alt="Banner Preview"
                          className="h-full w-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === "cta" && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                        Primary CTA Button Text
                      </label>
                      <input
                        type="text"
                        value={formData.primaryCtaText || ""}
                        onChange={(e) =>
                          setFormData({ ...formData, primaryCtaText: e.target.value })
                        }
                        placeholder="e.g. VISIT OUR OFFICE"
                        className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3.5 py-2 text-sm text-slate-800 focus:bg-white focus:border-emerald-600 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                        Primary CTA Destination Link
                      </label>
                      <input
                        type="text"
                        value={formData.primaryCtaHref || ""}
                        onChange={(e) =>
                          setFormData({ ...formData, primaryCtaHref: e.target.value })
                        }
                        placeholder="e.g. #contact or /services/e-stamping"
                        className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3.5 py-2 text-sm text-slate-800 focus:bg-white focus:border-emerald-600 focus:outline-none font-mono text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                        Secondary CTA Button Text
                      </label>
                      <input
                        type="text"
                        value={formData.secondaryCtaText || ""}
                        onChange={(e) =>
                          setFormData({ ...formData, secondaryCtaText: e.target.value })
                        }
                        placeholder="e.g. WhatsApp Us"
                        className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3.5 py-2 text-sm text-slate-800 focus:bg-white focus:border-emerald-600 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                        Secondary CTA Destination Link
                      </label>
                      <input
                        type="text"
                        value={formData.secondaryCtaHref || ""}
                        onChange={(e) =>
                          setFormData({ ...formData, secondaryCtaHref: e.target.value })
                        }
                        placeholder="e.g. https://wa.me/923057902744"
                        className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3.5 py-2 text-sm text-slate-800 focus:bg-white focus:border-emerald-600 focus:outline-none font-mono text-xs"
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "content" && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Lead Paragraph & Office Highlights
                    </label>
                    <textarea
                      rows={6}
                      value={formData.leadContent || ""}
                      onChange={(e) => setFormData({ ...formData, leadContent: e.target.value })}
                      placeholder="Detailed introduction text explaining legal credentials and office practice..."
                      className="w-full rounded-lg border border-slate-200 bg-slate-50/50 p-3 text-sm text-slate-800 focus:bg-white focus:border-emerald-600 focus:outline-none leading-relaxed"
                    />
                  </div>
                </div>
              )}

              {activeTab === "seo" && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Meta Title (Browser Tab & Search Results)
                    </label>
                    <input
                      type="text"
                      value={formData.metaTitle || ""}
                      onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                      placeholder="e.g. Ch Composing | E-Stamping & Tax Advisor Sahiwal"
                      className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3.5 py-2 text-sm text-slate-800 focus:bg-white focus:border-emerald-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Meta Description (Search Engine Snippet)
                    </label>
                    <textarea
                      rows={3}
                      value={formData.metaDescription || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, metaDescription: e.target.value })
                      }
                      placeholder="Summary snippet displayed on Google search results (150-160 characters)"
                      className="w-full rounded-lg border border-slate-200 bg-slate-50/50 p-3 text-sm text-slate-800 focus:bg-white focus:border-emerald-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Publish Status
                    </label>
                    <select
                      value={formData.status || "published"}
                      onChange={(e) =>
                        setFormData({ ...formData, status: e.target.value as any })
                      }
                      className="rounded-lg border border-slate-200 bg-slate-50/50 px-3.5 py-2 text-sm text-slate-800 focus:bg-white focus:border-emerald-600 focus:outline-none"
                    >
                      <option value="published">Published (Live on Website)</option>
                      <option value="draft">Draft (Under Review)</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Modal Footer Bar */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
                <button
                  type="button"
                  onClick={closeEditor}
                  className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>

                <div className="flex items-center gap-2">
                  <Link
                    href={formData.route || "/"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-slate-900 border border-slate-200 bg-white px-3 py-2 rounded-lg"
                  >
                    <ArrowUpRight className="h-3.5 w-3.5" />
                    <span>View Route</span>
                  </Link>

                  <button
                    type="submit"
                    disabled={isSaving}
                    className="inline-flex items-center gap-2 rounded-lg bg-[#075e38] px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-[#064e2e] transition disabled:opacity-50 cursor-pointer"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Saving Changes...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        Save & Publish
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
