"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Calendar,
  Plus,
  Edit2,
  CheckCircle,
  AlertTriangle,
  ExternalLink,
  ShieldCheck,
  ShieldAlert,
  Loader2,
  RefreshCw,
  Info,
  X,
  History,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { validateDeadlineForm, type DeadlineFormData } from "@/lib/validation/deadline";
import type { DeadlineWithCategory, TaxCategory } from "@/types/reminders";

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export default function DeadlinesManager() {
  const [deadlines, setDeadlines] = useState<DeadlineWithCategory[]>([]);
  const [categories, setCategories] = useState<TaxCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal / Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<DeadlineFormData>({
    category_id: "",
    tax_year_or_period: "",
    title: "",
    filing_deadline: "",
    official_source_url: "",
    is_active: true,
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Fetch categories
  useEffect(() => {
    async function loadCategories() {
      const supabase = createClient();
      try {
        const { data, error } = await supabase
          .from("tax_categories")
          .select("*")
          .order("sort_order", { ascending: true });
        if (error) throw error;
        setCategories(data || []);
      } catch (error) {
        setFeedback({ type: "error", message: getErrorMessage(error, "Failed to load tax categories.") });
      }
    }
    loadCategories();
  }, []);

  // Fetch deadlines
  const fetchDeadlines = useCallback(async () => {
    setIsLoading(true);
    const supabase = createClient();
    try {
      const { data, error } = await supabase
        .from("tax_deadlines")
        .select(
          `
          id,
          category_id,
          tax_year_or_period,
          title,
          filing_deadline,
          official_source_url,
          verified_at,
          verified_by,
          is_active,
          revision,
          created_at,
          updated_at,
          tax_categories ( id, name, slug )
        `
        )
        .order("filing_deadline", { ascending: true });

      if (error) throw error;

      const mapped: DeadlineWithCategory[] = (data || []).map((deadline: any) => ({
        ...deadline,
        category: deadline.tax_categories ?? undefined,
      }));

      setDeadlines(mapped);
    } catch (err) {
      console.error("[Deadlines Fetch Error]", err);
      setFeedback({ type: "error", message: getErrorMessage(err, "Failed to load tax deadlines.") });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDeadlines();
  }, [fetchDeadlines]);

  const openCreateModal = () => {
    setEditingId(null);
    setFormData({
      category_id: categories[0]?.id || "",
      tax_year_or_period: "",
      title: "",
      filing_deadline: "",
      official_source_url: "",
      is_active: true,
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (dl: DeadlineWithCategory) => {
    setEditingId(dl.id);
    setFormData({
      category_id: dl.category_id,
      tax_year_or_period: dl.tax_year_or_period,
      title: dl.title,
      filing_deadline: dl.filing_deadline,
      official_source_url: dl.official_source_url || "",
      is_active: dl.is_active,
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleSaveDeadline = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateDeadlineForm(formData);
    if (!validation.isValid) {
      setFormErrors(validation.errors);
      return;
    }

    setFormErrors({});
    setIsSaving(true);
    setFeedback(null);

    const supabase = createClient();
    try {
      if (editingId) {
        // Update existing deadline
        const { error } = await supabase
          .from("tax_deadlines")
          .update({
            category_id: formData.category_id,
            tax_year_or_period: formData.tax_year_or_period.trim(),
            title: formData.title.trim(),
            filing_deadline: formData.filing_deadline,
            official_source_url: formData.official_source_url?.trim() || null,
            is_active: formData.is_active,
          })
          .eq("id", editingId);

        if (error) throw error;
        setFeedback({
          type: "success",
          message: "Tax deadline updated. If the filing date changed, verification has been reset for safety.",
        });
      } else {
        // Create new deadline
        const { error } = await supabase.from("tax_deadlines").insert({
          category_id: formData.category_id,
          tax_year_or_period: formData.tax_year_or_period.trim(),
          title: formData.title.trim(),
          filing_deadline: formData.filing_deadline,
          official_source_url: formData.official_source_url?.trim() || null,
          is_active: formData.is_active,
          revision: 1,
        });

        if (error) throw error;
        setFeedback({
          type: "success",
          message: "New tax deadline created. Please verify it against official tax authority announcements before reminders are dispatched.",
        });
      }

      setIsModalOpen(false);
      fetchDeadlines();
    } catch (error) {
      setFeedback({
        type: "error",
        message: getErrorMessage(error, "Failed to save deadline."),
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Explicit Verification Toggle Action
  const handleVerifyDeadline = async (dl: DeadlineWithCategory) => {
    const supabase = createClient();
    const isCurrentlyVerified = dl.verified_at !== null;

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!isCurrentlyVerified && !user) throw new Error("Your administrator session has expired. Please sign in again.");

      const nextVerifiedAt = isCurrentlyVerified ? null : new Date().toISOString();
      const nextVerifiedBy = isCurrentlyVerified ? null : user?.id || null;
      const { error } = await supabase
        .from("tax_deadlines")
        .update({
          verified_at: nextVerifiedAt,
          verified_by: nextVerifiedBy,
          updated_at: new Date().toISOString(),
        })
        .eq("id", dl.id);

      if (error) throw error;
      setFeedback({
        type: "success",
        message: isCurrentlyVerified
          ? `Verification revoked for: ${dl.title}`
          : `Deadline verified: ${dl.title}. Eligible for automated reminders.`,
      });
      fetchDeadlines();
    } catch (error) {
      setFeedback({ type: "error", message: getErrorMessage(error, "Failed to update verification status.") });
    }
  };

  // Toggle Active
  const handleToggleActive = async (dl: DeadlineWithCategory) => {
    const supabase = createClient();
    try {
      const { error } = await supabase
        .from("tax_deadlines")
        .update({
          is_active: !dl.is_active,
          updated_at: new Date().toISOString(),
        })
        .eq("id", dl.id);

      if (error) throw error;
      fetchDeadlines();
    } catch (error) {
      setFeedback({ type: "error", message: getErrorMessage(error, "Failed to toggle status.") });
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-[#52627A] mb-1">
            <span>Reminders</span>
            <span className="text-[#94A3B8]">/</span>
            <span className="text-[#0B1F36] font-semibold">Tax Deadlines</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0B1F36]">
            Official Tax Deadlines
          </h1>
          <p className="mt-0.5 text-xs text-[#52627A] leading-relaxed">
            Define statutory filing cutoff dates. Reminders are dispatched 30 days and 7 days prior to verified deadlines.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchDeadlines}
            disabled={isLoading}
            className="inline-flex items-center gap-2 rounded-lg border border-[#E2E8F0] bg-white px-3.5 py-2 text-xs font-semibold text-[#52627A] shadow-xs hover:bg-[#F8FAFC] hover:text-[#0B1F36] transition"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-[#C8973D] ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 rounded-lg bg-[#0B1F36] hover:bg-[#102943] px-3.5 py-2 text-xs font-semibold text-white shadow-xs transition"
          >
            <Plus className="h-3.5 w-3.5 text-[#C8973D]" /> Add Tax Deadline
          </button>
        </div>
      </div>

      {/* Verification Notice Banner */}
      <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-4 text-xs text-amber-900 flex items-start gap-3 shadow-xs">
        <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="text-amber-950 font-semibold">Statutory Verification Required:</strong> Only deadlines explicitly marked as <strong>Verified</strong> will trigger automated reminder emails. Whenever an administrator changes a deadline date, its verification status is automatically reset to unverified until checked again against official tax authority announcements (FBR / PRA).
        </div>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`rounded-xl border p-3 text-xs flex items-center gap-2 shadow-xs ${
            feedback.type === "success"
              ? "border-[#C8973D]/40 bg-[#FDF8EE] text-[#96641E]"
              : "border-rose-200 bg-rose-50 text-rose-800"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle className="h-4 w-4 text-[#C8973D] shrink-0" />
          ) : (
            <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0" />
          )}
          {feedback.message}
        </div>
      )}

      {/* Deadlines Table */}
      <div className="overflow-hidden rounded-xl border border-[#E2E8F0] bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#334155]">
            <thead className="border-b border-[#E2E8F0] bg-[#F8FAFC] text-[11px] font-semibold uppercase tracking-[0.06em] text-[#64748B]">
              <tr>
                <th className="py-3 px-4 font-semibold">Title & Tax Period</th>
                <th className="py-3 px-4 font-semibold">Category</th>
                <th className="py-3 px-4 font-semibold">Filing Deadline</th>
                <th className="py-3 px-4 font-semibold">Verification Status</th>
                <th className="py-3 px-4 font-semibold">Revision</th>
                <th className="py-3 px-4 font-semibold">Active</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#52627A]">
                    <Loader2 className="mx-auto h-5 w-5 animate-spin text-[#C8973D] mb-2" />
                    Loading deadlines...
                  </td>
                </tr>
              ) : deadlines.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#52627A]">
                    No tax deadlines created yet. Click <strong>Add Tax Deadline</strong> to create your first statutory filing date.
                  </td>
                </tr>
              ) : (
                deadlines.map((dl) => {
                  const isVerified = dl.verified_at !== null;
                  const isPast = new Date(dl.filing_deadline) < new Date();
                  return (
                    <tr key={dl.id} className="hover:bg-[#F8FAFC] transition">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-[#0B1F36] text-xs">{dl.title}</div>
                        <div className="text-[#52627A] text-[11px] mt-0.5 flex items-center gap-2">
                          <span>Period: {dl.tax_year_or_period}</span>
                          {dl.official_source_url && (
                            <a
                              href={dl.official_source_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[#96641E] hover:underline font-medium"
                            >
                              Official Source <ExternalLink className="h-2.5 w-2.5" />
                            </a>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-[#334155] font-medium text-xs">
                        {dl.category?.name || "General"}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`font-mono text-xs font-semibold ${isPast ? "text-[#94A3B8] line-through" : "text-[#0B1F36]"}`}>
                          {dl.filing_deadline}
                        </span>
                        {isPast && <span className="block text-[10.5px] text-rose-600 mt-0.5 font-medium">Past deadline</span>}
                      </td>
                      <td className="py-3.5 px-4">
                        {isVerified ? (
                          <span className="inline-flex items-center gap-1 rounded-full border border-[#C8973D]/40 bg-[#FDF8EE] px-2.5 py-0.5 text-[11px] font-semibold text-[#96641E]">
                            <ShieldCheck className="h-3 w-3 text-[#C8973D]" /> Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[11px] font-semibold text-amber-800">
                            <ShieldAlert className="h-3 w-3" /> Unverified
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-[#52627A] font-mono text-[11px]">
                        rev #{dl.revision}
                      </td>
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => handleToggleActive(dl)}
                          className={`rounded-full px-2.5 py-0.5 text-[10.5px] font-semibold uppercase tracking-wider transition ${
                            dl.is_active
                              ? "bg-[#FDF8EE] text-[#96641E] hover:bg-[#FDF8EE]/80 border border-[#C8973D]/40"
                              : "bg-slate-100 text-[#64748B] hover:bg-slate-200 border border-[#E2E8F0]"
                          }`}
                        >
                          {dl.is_active ? "Enabled" : "Disabled"}
                        </button>
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-2">
                        <button
                          onClick={() => handleVerifyDeadline(dl)}
                          className={`rounded-lg border px-2.5 py-1 text-[11px] font-semibold transition shadow-xs ${
                            isVerified
                              ? "border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100"
                              : "border-[#C8973D]/40 bg-[#FDF8EE] text-[#96641E] hover:bg-[#FDF8EE]/80"
                          }`}
                          title={isVerified ? "Revoke verification" : "Mark verified with tax authority"}
                        >
                          {isVerified ? "Unverify" : "Verify"}
                        </button>
                        <button
                          onClick={() => openEditModal(dl)}
                          className="rounded-lg border border-[#E2E8F0] bg-white px-2.5 py-1 text-[11px] font-semibold text-[#52627A] hover:bg-[#F8FAFC] hover:text-[#0B1F36] transition shadow-xs"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border border-[#E2E8F0] bg-white p-6 text-[#0B1F36] shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
              <h3 className="text-sm font-bold text-[#0B1F36]">
                {editingId ? "Edit Tax Deadline" : "Add Statutory Tax Deadline"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-[#94A3B8] hover:bg-[#F8FAFC] hover:text-[#0B1F36] p-1 rounded-lg transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDeadline} className="space-y-4">
              {/* Category */}
              <div>
                <label className="block text-xs font-semibold text-[#0B1F36] mb-1">
                  Tax Category <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                  className="w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] py-2 px-3 text-xs text-[#0B1F36] focus:border-[#C8973D] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C8973D]/20 shadow-xs transition"
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                {formErrors.category_id && (
                  <p className="mt-1 text-xs text-rose-600 font-medium">{formErrors.category_id}</p>
                )}
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-semibold text-[#0B1F36] mb-1">
                  Deadline Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Annual Income Tax Return Filing for Individuals"
                  className="w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] py-2 px-3 text-xs text-[#0B1F36] placeholder:text-[#94A3B8] focus:border-[#C8973D] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C8973D]/20 shadow-xs transition"
                  required
                />
                {formErrors.title && (
                  <p className="mt-1 text-xs text-rose-600 font-medium">{formErrors.title}</p>
                )}
              </div>

              {/* Tax Year or Period */}
              <div>
                <label className="block text-xs font-semibold text-[#0B1F36] mb-1">
                  Tax Period / Year <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.tax_year_or_period}
                  onChange={(e) => setFormData({ ...formData, tax_year_or_period: e.target.value })}
                  placeholder="e.g. Tax Year 2026 or Q3 2026"
                  className="w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] py-2 px-3 text-xs text-[#0B1F36] placeholder:text-[#94A3B8] focus:border-[#C8973D] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C8973D]/20 shadow-xs transition"
                  required
                />
                {formErrors.tax_year_or_period && (
                  <p className="mt-1 text-xs text-rose-600 font-medium">{formErrors.tax_year_or_period}</p>
                )}
              </div>

              {/* Filing Deadline Date */}
              <div>
                <label className="block text-xs font-semibold text-[#0B1F36] mb-1">
                  Filing Deadline Date <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.filing_deadline}
                  onChange={(e) => setFormData({ ...formData, filing_deadline: e.target.value })}
                  className="w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] py-2 px-3 text-xs text-[#0B1F36] placeholder:text-[#94A3B8] focus:border-[#C8973D] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C8973D]/20 shadow-xs transition"
                  required
                />
                {formErrors.filing_deadline && (
                  <p className="mt-1 text-xs text-rose-600 font-medium">{formErrors.filing_deadline}</p>
                )}
                {editingId && (
                  <p className="mt-1 text-[11px] text-amber-700">
                    Changing the filing date will invalidate existing verification and increment the deadline revision.
                  </p>
                )}
              </div>

              {/* Official Source URL */}
              <div>
                <label className="block text-xs font-semibold text-[#0B1F36] mb-1">
                  Official Notification URL (Optional)
                </label>
                <input
                  type="url"
                  value={formData.official_source_url}
                  onChange={(e) => setFormData({ ...formData, official_source_url: e.target.value })}
                  placeholder="https://fbr.gov.pk/gazette-notifications/..."
                  className="w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] py-2 px-3 text-xs text-[#0B1F36] placeholder:text-[#94A3B8] focus:border-[#C8973D] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C8973D]/20 shadow-xs transition"
                />
                {formErrors.official_source_url && (
                  <p className="mt-1 text-xs text-rose-600 font-medium">{formErrors.official_source_url}</p>
                )}
              </div>

              {/* Active Toggle */}
              <div className="flex items-center gap-2 pt-2">
                <input
                  id="dl_active"
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="h-4 w-4 rounded border-[#E2E8F0] text-[#0B1F36] focus:ring-[#C8973D]"
                />
                <label htmlFor="dl_active" className="text-xs text-[#52627A] font-medium cursor-pointer">
                  Activate this deadline for automated reminder generation
                </label>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-[#E2E8F0]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSaving}
                  className="rounded-lg border border-[#E2E8F0] bg-white px-3.5 py-2 text-xs font-semibold text-[#52627A] hover:bg-[#F8FAFC] hover:text-[#0B1F36] transition shadow-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="rounded-lg bg-[#0B1F36] hover:bg-[#102943] px-4 py-2 text-xs font-semibold text-white shadow-xs inline-flex items-center gap-1.5 transition disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-[#C8973D]" /> Saving...
                    </>
                  ) : (
                    "Save Deadline"
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
