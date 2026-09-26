"use client";

import React, { useState, useEffect } from "react";
import {
  HelpCircle,
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
  ChevronDown,
  ChevronUp,
  Tag,
  Eye,
  EyeOff,
} from "lucide-react";
import type { CmsFaq } from "@/lib/db/faqsStore";

const CATEGORIES = [
  "General",
  "E-Stamping",
  "Property & Land",
  "Taxation & FBR",
  "Corporate Compliance",
  "Family & Civil Law",
];

export default function FaqsManager() {
  const [faqs, setFaqs] = useState<CmsFaq[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [openAccordionId, setOpenAccordionId] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<CmsFaq | null>(null);
  const [formData, setFormData] = useState<Partial<CmsFaq>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const showNotification = (type: "success" | "error", text: string) => {
    setNotification({ type, text });
    setTimeout(() => setNotification(null), 4000);
  };

  const fetchFaqs = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/faqs");
      const data = await res.json();
      if (res.ok && data.success) {
        setFaqs(data.faqs || []);
      } else {
        throw new Error(data.error || "Failed to load FAQs");
      }
    } catch (err) {
      showNotification("error", err instanceof Error ? err.message : "Error fetching FAQs");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFaqs();
  }, []);

  const openCreateModal = () => {
    setEditingFaq(null);
    setFormData({
      question: "",
      answer: "",
      category: "General",
      page: "home",
      displayOrder: faqs.length + 1,
      isPublished: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (item: CmsFaq) => {
    setEditingFaq(item);
    setFormData({ ...item });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.question?.trim()) {
      showNotification("error", "Question is required.");
      return;
    }
    if (!formData.answer?.trim()) {
      showNotification("error", "Answer text is required.");
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch("/api/admin/faqs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to save FAQ");
      }

      showNotification("success", "FAQ item saved successfully!");
      setIsModalOpen(false);
      fetchFaqs();
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("cms-updated"));
      }
    } catch (err) {
      showNotification("error", err instanceof Error ? err.message : "Failed to save FAQ");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/faqs?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to delete FAQ");
      }
      showNotification("success", "FAQ deleted.");
      setDeleteConfirmId(null);
      fetchFaqs();
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("cms-updated"));
      }
    } catch (err) {
      showNotification("error", err instanceof Error ? err.message : "Failed to delete");
    }
  };

  const handleTogglePublish = async (item: CmsFaq) => {
    try {
      await fetch("/api/admin/faqs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...item, isPublished: !item.isPublished }),
      });
      showNotification("success", item.isPublished ? "FAQ hidden from public view." : "FAQ published live.");
      fetchFaqs();
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("cms-updated"));
      }
    } catch {
      showNotification("error", "Failed to update visibility");
    }
  };

  const handleMove = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= faqs.length) return;

    const reordered = [...faqs];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);

    setFaqs(reordered);

    try {
      const orderedIds = reordered.map((f) => f.id);
      await fetch("/api/admin/faqs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reorder", orderedIds }),
      });
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("cms-updated"));
      }
    } catch {
      fetchFaqs();
    }
  };

  const categories = ["All", ...Array.from(new Set(faqs.map((f) => f.category || "General")))];

  const filtered = faqs.filter((f) => {
    const matchesSearch =
      f.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === "All" || f.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#0b1329] p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold-400/10 text-gold-500 font-bold">
              <HelpCircle className="h-5 w-5" />
            </span>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-navy-950 dark:text-white">
                FAQ Knowledgebase
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Manage frequently asked questions, answers, categorization, and ordering across the website.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={openCreateModal}
          className="btn-gold inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold shadow-sm"
        >
          <Plus className="h-4 w-4" />
          <span>Add New FAQ</span>
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
            placeholder="Search questions or keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-gold-400/30"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mr-1">Category:</span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                selectedCategory === cat
                  ? "bg-navy-900 text-white dark:bg-gold-400 dark:text-navy-950"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* FAQs List */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-[#0b1329] rounded-2xl border border-slate-200/80 dark:border-slate-800">
          <Loader2 className="h-8 w-8 text-gold-500 animate-spin" />
          <p className="mt-3 text-xs text-slate-500">Loading FAQs directory...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center p-12 bg-white dark:bg-[#0b1329] rounded-2xl border border-slate-200/80 dark:border-slate-800">
          <HelpCircle className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-600" />
          <h3 className="mt-3 text-sm font-bold text-navy-950 dark:text-white">No FAQ items found</h3>
          <p className="mt-1 text-xs text-slate-500">
            {searchQuery ? "Try refining your search query." : "Add frequently asked questions to assist your clients."}
          </p>
          <button
            onClick={openCreateModal}
            className="btn-gold mt-4 inline-flex items-center gap-2 px-4 py-2 text-xs font-bold"
          >
            <Plus className="h-3.5 w-3.5" /> Add First FAQ
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((item, index) => {
            const isOpen = openAccordionId === item.id;
            return (
              <div
                key={item.id}
                className={`rounded-2xl border transition bg-white dark:bg-[#0b1329] overflow-hidden ${
                  !item.isPublished
                    ? "opacity-60 border-slate-200 dark:border-slate-800/60"
                    : "border-slate-200/90 dark:border-slate-800 shadow-xs hover:border-gold-400/40"
                }`}
              >
                {/* Header row */}
                <div className="flex items-center justify-between p-4 sm:p-5 gap-3">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {/* Reorder Arrows */}
                    <div className="flex flex-col items-center shrink-0">
                      <button
                        onClick={() => handleMove(index, "up")}
                        disabled={index === 0}
                        title="Move Up"
                        className="p-0.5 rounded text-slate-400 hover:text-navy-950 dark:hover:text-white disabled:opacity-20 disabled:pointer-events-none"
                      >
                        <ArrowUp className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleMove(index, "down")}
                        disabled={index === faqs.length - 1}
                        title="Move Down"
                        className="p-0.5 rounded text-slate-400 hover:text-navy-950 dark:hover:text-white disabled:opacity-20 disabled:pointer-events-none"
                      >
                        <ArrowDown className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <div className="min-w-0 flex-1 cursor-pointer" onClick={() => setOpenAccordionId(isOpen ? null : item.id)}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          <Tag className="h-2.5 w-2.5 text-gold-500" />
                          {item.category || "General"}
                        </span>
                        {!item.isPublished && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] font-bold text-amber-700 bg-amber-100 dark:bg-amber-950/60 dark:text-amber-400">
                            Hidden
                          </span>
                        )}
                        <span className="text-[10px] text-slate-400 font-mono">
                          Order #{item.displayOrder}
                        </span>
                      </div>

                      <h3 className="font-bold text-sm text-navy-950 dark:text-white pr-2 leading-snug">
                        {item.question}
                      </h3>
                    </div>
                  </div>

                  {/* Right side buttons */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => handleTogglePublish(item)}
                      className={`p-1.5 rounded-lg text-xs font-semibold transition ${
                        item.isPublished
                          ? "text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                          : "text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                      }`}
                      title={item.isPublished ? "Published (click to hide)" : "Hidden (click to publish)"}
                    >
                      {item.isPublished ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </button>

                    <button
                      onClick={() => openEditModal(item)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-navy-900 dark:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                    >
                      <Edit3 className="h-3 w-3 text-gold-500" />
                      <span className="hidden sm:inline">Edit</span>
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
                        title="Delete FAQ"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}

                    <button
                      onClick={() => setOpenAccordionId(isOpen ? null : item.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-navy-950 dark:hover:text-white"
                      title="Toggle preview"
                    >
                      {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Answer Accordion */}
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs text-slate-700 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
                    <p className="font-semibold text-slate-500 dark:text-slate-400 text-[10px] uppercase tracking-wider mb-1">
                      Answer Preview:
                    </p>
                    {item.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-xs">
          <div className="w-full max-w-xl bg-white dark:bg-[#0b1329] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold-400/10 text-gold-500">
                  <HelpCircle className="h-4 w-4" />
                </span>
                <h2 className="font-bold text-base text-navy-950 dark:text-white">
                  {editingFaq ? "Edit FAQ" : "Add New FAQ"}
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
                  Question *
                </label>
                <input
                  type="text"
                  required
                  value={formData.question || ""}
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                  placeholder="e.g. What documents are required for E-Stamping?"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gold-400/40"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Category
                  </label>
                  <select
                    value={formData.category || "General"}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gold-400/40"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Page Association
                  </label>
                  <select
                    value={formData.page || "home"}
                    onChange={(e) => setFormData({ ...formData, page: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gold-400/40"
                  >
                    <option value="home">Homepage</option>
                    <option value="services">Services Catalog</option>
                    <option value="all">Global / All Pages</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Answer *
                </label>
                <textarea
                  rows={5}
                  required
                  value={formData.answer || ""}
                  onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                  placeholder="Detailed, clear answer explaining documents, procedure, or chamber fees..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gold-400/40"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="isPublished"
                    checked={formData.isPublished !== false}
                    onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                    className="h-4 w-4 rounded border-slate-300 text-gold-500 focus:ring-gold-400"
                  />
                  <label htmlFor="isPublished" className="font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                    Visible / Published Live
                  </label>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={formData.displayOrder ?? 0}
                    onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })}
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
                      <Save className="h-3.5 w-3.5" /> Save FAQ
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
