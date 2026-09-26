"use client";

import React, { useState, useEffect } from "react";
import {
  Star,
  Plus,
  Search,
  Edit3,
  Trash2,
  ArrowUp,
  ArrowDown,
  Save,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Quote,
  Sparkles,
} from "lucide-react";
import type { CmsTestimonial } from "@/lib/db/testimonialsStore";

export default function TestimonialsManager() {
  const [testimonials, setTestimonials] = useState<CmsTestimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterFeatured, setFilterFeatured] = useState<"all" | "featured">("all");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CmsTestimonial | null>(null);
  const [formData, setFormData] = useState<Partial<CmsTestimonial>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const showNotification = (type: "success" | "error", text: string) => {
    setNotification({ type, text });
    setTimeout(() => setNotification(null), 4000);
  };

  const fetchTestimonials = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/testimonials");
      const data = await res.json();
      if (res.ok && data.success) {
        setTestimonials(data.testimonials || []);
      } else {
        throw new Error(data.error || "Failed to load testimonials");
      }
    } catch (err) {
      showNotification("error", err instanceof Error ? err.message : "Error fetching testimonials");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const openCreateModal = () => {
    setEditingItem(null);
    setFormData({
      clientName: "",
      clientTitle: "",
      comment: "",
      rating: 5,
      isFeatured: true,
      sortOrder: testimonials.length + 1,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (item: CmsTestimonial) => {
    setEditingItem(item);
    setFormData({ ...item });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.clientName?.trim()) {
      showNotification("error", "Client name is required.");
      return;
    }
    if (!formData.comment?.trim()) {
      showNotification("error", "Review text is required.");
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch("/api/admin/testimonials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to save testimonial");
      }

      showNotification("success", `Testimonial from "${data.testimonial.clientName}" saved!`);
      setIsModalOpen(false);
      fetchTestimonials();
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("cms-updated"));
      }
    } catch (err) {
      showNotification("error", err instanceof Error ? err.message : "Failed to save");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/testimonials?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to delete testimonial");
      }
      showNotification("success", "Testimonial deleted.");
      setDeleteConfirmId(null);
      fetchTestimonials();
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("cms-updated"));
      }
    } catch (err) {
      showNotification("error", err instanceof Error ? err.message : "Failed to delete");
    }
  };

  const handleMove = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= testimonials.length) return;

    const reordered = [...testimonials];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);

    setTestimonials(reordered);

    try {
      const orderedIds = reordered.map((t) => t.id);
      await fetch("/api/admin/testimonials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reorder", orderedIds }),
      });
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("cms-updated"));
      }
    } catch {
      fetchTestimonials();
    }
  };

  const filtered = testimonials.filter((t) => {
    const matchesSearch =
      t.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.clientTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.comment.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFeatured = filterFeatured === "all" || (filterFeatured === "featured" && t.isFeatured);
    return matchesSearch && matchesFeatured;
  });

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#0b1329] p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold-400/10 text-gold-500 font-bold">
              <Quote className="h-5 w-5" />
            </span>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-navy-950 dark:text-white">
                Client Testimonials & Reviews
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Manage authenticated client reviews, star ratings, and featured testimonials displayed on the homepage.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={openCreateModal}
          className="btn-gold inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold shadow-sm"
        >
          <Plus className="h-4 w-4" />
          <span>Add Testimonial</span>
        </button>
      </div>

      {/* Notifications */}
      {notification && (
        <div
          className={`flex items-center gap-3 p-4 rounded-xl text-xs font-medium border ${
            notification.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
              : "bg-red-50 text-red-800 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800"
          }`}
        >
          {notification.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0 text-red-600 dark:text-red-400" />
          )}
          <span>{notification.text}</span>
        </div>
      )}

      {/* Filters and search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-[#0b1329] p-4 rounded-xl border border-slate-200/80 dark:border-slate-800">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search reviews by client or text..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-gold-400/30"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Filter:</span>
          {(["all", "featured"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setFilterFeatured(mode)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition ${
                filterFeatured === mode
                  ? "bg-navy-900 text-white dark:bg-gold-400 dark:text-navy-950"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
              }`}
            >
              {mode === "all" ? "All Reviews" : "Featured Only"}
            </button>
          ))}
        </div>
      </div>

      {/* Testimonials Grid */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-[#0b1329] rounded-2xl border border-slate-200/80 dark:border-slate-800">
          <Loader2 className="h-8 w-8 text-gold-500 animate-spin" />
          <p className="mt-3 text-xs text-slate-500">Loading client testimonials...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center p-12 bg-white dark:bg-[#0b1329] rounded-2xl border border-slate-200/80 dark:border-slate-800">
          <Quote className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-600" />
          <h3 className="mt-3 text-sm font-bold text-navy-950 dark:text-white">No testimonials found</h3>
          <p className="mt-1 text-xs text-slate-500">
            {searchQuery ? "Try refining your search query." : "Add client reviews to showcase your track record."}
          </p>
          <button
            onClick={openCreateModal}
            className="btn-gold mt-4 inline-flex items-center gap-2 px-4 py-2 text-xs font-bold"
          >
            <Plus className="h-3.5 w-3.5" /> Add Testimonial
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item, index) => (
            <div
              key={item.id}
              className="relative flex flex-col justify-between rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 bg-white dark:bg-[#0b1329] shadow-xs transition hover:shadow-md"
            >
              <div>
                {/* Rating & Reorder */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-4 w-4 ${
                          star <= item.rating
                            ? "fill-gold-400 text-gold-400"
                            : "fill-slate-200 text-slate-300 dark:fill-slate-800 dark:text-slate-700"
                        }`}
                      />
                    ))}
                    {item.isFeatured && (
                      <span className="ml-2 inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300/40">
                        <Sparkles className="h-2.5 w-2.5" /> Featured
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleMove(index, "up")}
                      disabled={index === 0}
                      title="Move Up"
                      className="p-1 rounded text-slate-400 hover:text-navy-950 dark:hover:text-white disabled:opacity-30 disabled:pointer-events-none"
                    >
                      <ArrowUp className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleMove(index, "down")}
                      disabled={index === testimonials.length - 1}
                      title="Move Down"
                      className="p-1 rounded text-slate-400 hover:text-navy-950 dark:hover:text-white disabled:opacity-30 disabled:pointer-events-none"
                    >
                      <ArrowDown className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Comment quote */}
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed italic line-clamp-4">
                  &ldquo;{item.comment}&rdquo;
                </p>

                {/* Client info */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                  <h4 className="font-bold text-xs text-navy-950 dark:text-white truncate">
                    {item.clientName}
                  </h4>
                  {item.clientTitle && (
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      {item.clientTitle}
                    </p>
                  )}
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                <span className="text-[10px] text-slate-400 font-mono">
                  Order #{item.sortOrder}
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => openEditModal(item)}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-navy-900 dark:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                  >
                    <Edit3 className="h-3 w-3 text-gold-500" />
                    <span>Edit</span>
                  </button>

                  {deleteConfirmId === item.id ? (
                    <div className="flex items-center gap-1 bg-red-50 dark:bg-red-950/60 p-1 rounded-lg border border-red-200 dark:border-red-800">
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="px-2 py-0.5 text-[11px] font-bold text-white bg-red-600 rounded hover:bg-red-700"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(null)}
                        className="px-1 text-[11px] text-slate-500 hover:text-slate-800"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirmId(item.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition"
                      title="Delete review"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-xs">
          <div className="w-full max-w-xl bg-white dark:bg-[#0b1329] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold-400/10 text-gold-500">
                  <Quote className="h-4 w-4" />
                </span>
                <h2 className="font-bold text-base text-navy-950 dark:text-white">
                  {editingItem ? "Edit Testimonial" : "Add New Testimonial"}
                </h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Client Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.clientName || ""}
                  onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                  placeholder="e.g. Chaudhry Tariq Mehmood"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gold-400/40"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Client Designation / Company / Location
                </label>
                <input
                  type="text"
                  value={formData.clientTitle || ""}
                  onChange={(e) => setFormData({ ...formData, clientTitle: e.target.value })}
                  placeholder="e.g. Agricultural Property Owner, Sahiwal"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gold-400/40"
                />
              </div>

              {/* Star Rating Selector */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Rating (Stars)
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFormData({ ...formData, rating: star })}
                      className="p-1 rounded hover:scale-110 transition"
                    >
                      <Star
                        className={`h-6 w-6 ${
                          star <= (formData.rating ?? 5)
                            ? "fill-gold-400 text-gold-400"
                            : "fill-slate-200 text-slate-300 dark:fill-slate-800 dark:text-slate-700"
                        }`}
                      />
                    </button>
                  ))}
                  <span className="ml-2 font-bold text-sm text-navy-950 dark:text-white">
                    {formData.rating ?? 5} / 5 Stars
                  </span>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Client Review / Feedback Comment *
                </label>
                <textarea
                  rows={4}
                  required
                  value={formData.comment || ""}
                  onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                  placeholder="Detailed feedback regarding legal consultation, e-stamping speed, or court tax advisory..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gold-400/40"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="isFeatured"
                    checked={formData.isFeatured ?? true}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    className="h-4 w-4 rounded border-slate-300 text-gold-500 focus:ring-gold-400"
                  />
                  <label htmlFor="isFeatured" className="font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                    Show as Featured on Homepage
                  </label>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Sort Order
                  </label>
                  <input
                    type="number"
                    value={formData.sortOrder ?? 0}
                    onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gold-400/40"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="btn-gold inline-flex items-center gap-2 px-5 py-2 text-xs font-bold shadow-sm"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-3.5 w-3.5" /> Save Testimonial
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
