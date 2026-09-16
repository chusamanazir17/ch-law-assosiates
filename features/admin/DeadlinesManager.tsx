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
      const { data } = await supabase
        .from("tax_categories")
        .select("*")
        .order("sort_order", { ascending: true });
      if (data) setCategories(data);
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

      const mapped: DeadlineWithCategory[] = (data || []).map((d: any) => ({
        ...d,
        category: d.tax_categories,
      }));

      setDeadlines(mapped);
    } catch (err) {
      console.error("[Deadlines Fetch Error]", err);
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
    } catch (err: any) {
      setFeedback({
        type: "error",
        message: err.message || "Failed to save deadline.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Explicit Verification Toggle Action
  const handleVerifyDeadline = async (dl: DeadlineWithCategory) => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const isCurrentlyVerified = dl.verified_at !== null;
    const nextVerifiedAt = isCurrentlyVerified ? null : new Date().toISOString();
    const nextVerifiedBy = isCurrentlyVerified ? null : user?.id || null;

    try {
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
    } catch (err: any) {
      alert("Failed to update verification status: " + err.message);
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
    } catch (err: any) {
      alert("Failed to toggle status: " + err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-1">
            <span>Reminders</span>
            <span>/</span>
            <span className="text-slate-900 font-semibold">Tax Deadlines</span>
          </div>
          <h1 className="text-[32px] font-bold tracking-tight text-slate-900 leading-tight">
            Official Tax Deadlines
          </h1>
          <p className="text-[14.5px] text-slate-500 mt-1">
            Define statutory filing cutoff dates. Reminders are dispatched 30 days and 7 days prior to verified deadlines.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchDeadlines}
            disabled={isLoading}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-[13.5px] font-medium text-slate-700 shadow-2xs hover:bg-slate-50 transition"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 rounded-lg bg-[#075e38] hover:bg-[#064e2e] px-4 py-2 text-[13.5px] font-medium text-white shadow-2xs transition"
          >
            <Plus className="h-4 w-4" /> Add Tax Deadline
          </button>
        </div>
      </div>

      {/* Verification Notice Banner */}
      <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-4 text-xs text-amber-900 flex items-start gap-3 shadow-2xs">
        <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="text-amber-950 font-semibold">Statutory Verification Required:</strong> Only deadlines explicitly marked as <strong>Verified</strong> will trigger automated reminder emails. Whenever an administrator changes a deadline date, its verification status is automatically reset to unverified until checked again against official tax authority announcements (FBR / PRA).
        </div>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`rounded-lg border p-3 text-xs flex items-center gap-2 shadow-2xs ${
            feedback.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-rose-200 bg-rose-50 text-rose-800"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0" />
          )}
          {feedback.message}
        </div>
      )}

      {/* Deadlines Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-800">
            <thead className="border-b border-slate-200 bg-slate-50 text-[11.5px] font-semibold text-slate-600">
              <tr>
                <th className="py-3.5 px-4 font-semibold">Title & Tax Period</th>
                <th className="py-3.5 px-4 font-semibold">Category</th>
                <th className="py-3.5 px-4 font-semibold">Filing Deadline</th>
                <th className="py-3.5 px-4 font-semibold">Verification Status</th>
                <th className="py-3.5 px-4 font-semibold">Revision</th>
                <th className="py-3.5 px-4 font-semibold">Active</th>
                <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <Loader2 className="mx-auto h-5 w-5 animate-spin text-[#075e38] mb-2" />
                    Loading deadlines...
                  </td>
                </tr>
              ) : deadlines.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    No tax deadlines created yet. Click <strong>Add Tax Deadline</strong> to create your first statutory filing date.
                  </td>
                </tr>
              ) : (
                deadlines.map((dl) => {
                  const isVerified = dl.verified_at !== null;
                  const isPast = new Date(dl.filing_deadline) < new Date();
                  return (
                    <tr key={dl.id} className="hover:bg-slate-50/75 transition">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900 text-sm">{dl.title}</div>
                        <div className="text-slate-500 text-[11.5px] mt-0.5 flex items-center gap-2">
                          <span>Period: {dl.tax_year_or_period}</span>
                          {dl.official_source_url && (
                            <a
                              href={dl.official_source_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[#075e38] hover:underline font-medium"
                            >
                              Official Source <ExternalLink className="h-2.5 w-2.5" />
                            </a>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 font-medium">
                        {dl.category?.name || "General"}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`font-mono text-xs font-semibold ${isPast ? "text-slate-400 line-through" : "text-[#075e38]"}`}>
                          {dl.filing_deadline}
                        </span>
                        {isPast && <span className="block text-[10.5px] text-rose-600 mt-0.5 font-medium">Past deadline</span>}
                      </td>
                      <td className="py-3.5 px-4">
                        {isVerified ? (
                          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-[#eef7f2] px-2.5 py-0.5 text-[11px] font-semibold text-[#075e38]">
                            <ShieldCheck className="h-3 w-3" /> Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[11px] font-semibold text-amber-800">
                            <ShieldAlert className="h-3 w-3" /> Unverified
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                        rev #{dl.revision}
                      </td>
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => handleToggleActive(dl)}
                          className={`rounded-full px-2.5 py-0.5 text-[10.5px] font-semibold uppercase tracking-wider transition ${
                            dl.is_active
                              ? "bg-[#eef7f2] text-[#075e38] hover:bg-emerald-100 border border-emerald-200"
                              : "bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200"
                          }`}
                        >
                          {dl.is_active ? "Enabled" : "Disabled"}
                        </button>
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-2">
                        <button
                          onClick={() => handleVerifyDeadline(dl)}
                          className={`rounded-lg border px-2.5 py-1 text-[11.5px] font-medium transition shadow-2xs ${
                            isVerified
                              ? "border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100"
                              : "border-emerald-200 bg-[#eef7f2] text-[#075e38] hover:bg-emerald-100"
                          }`}
                          title={isVerified ? "Revoke verification" : "Mark verified with tax authority"}
                        >
                          {isVerified ? "Unverify" : "Verify"}
                        </button>
                        <button
                          onClick={() => openEditModal(dl)}
                          className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11.5px] font-medium text-slate-700 hover:bg-slate-50 transition shadow-2xs"
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
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 text-slate-900 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900">
                {editingId ? "Edit Tax Deadline" : "Add Statutory Tax Deadline"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDeadline} className="space-y-4">
              {/* Category */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tax Category <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 bg-white py-2 px-3 text-xs text-slate-900 focus:border-[#075e38] focus:outline-none focus:ring-1 focus:ring-[#075e38] shadow-2xs"
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
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Deadline Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Annual Income Tax Return Filing for Individuals"
                  className="w-full rounded-lg border border-slate-200 bg-white py-2 px-3 text-xs text-slate-900 placeholder-slate-400 focus:border-[#075e38] focus:outline-none focus:ring-1 focus:ring-[#075e38] shadow-2xs"
                  required
                />
                {formErrors.title && (
                  <p className="mt-1 text-xs text-rose-600 font-medium">{formErrors.title}</p>
                )}
              </div>

              {/* Tax Year or Period */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tax Period / Year <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.tax_year_or_period}
                  onChange={(e) => setFormData({ ...formData, tax_year_or_period: e.target.value })}
                  placeholder="e.g. Tax Year 2024 or Q3 2024"
                  className="w-full rounded-lg border border-slate-200 bg-white py-2 px-3 text-xs text-slate-900 placeholder-slate-400 focus:border-[#075e38] focus:outline-none focus:ring-1 focus:ring-[#075e38] shadow-2xs"
                  required
                />
                {formErrors.tax_year_or_period && (
                  <p className="mt-1 text-xs text-rose-600 font-medium">{formErrors.tax_year_or_period}</p>
                )}
              </div>

              {/* Filing Deadline Date */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Filing Deadline Date <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.filing_deadline}
                  onChange={(e) => setFormData({ ...formData, filing_deadline: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 bg-white py-2 px-3 text-xs text-slate-900 placeholder-slate-400 focus:border-[#075e38] focus:outline-none focus:ring-1 focus:ring-[#075e38] shadow-2xs"
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
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Official Notification URL (Optional)
                </label>
                <input
                  type="url"
                  value={formData.official_source_url}
                  onChange={(e) => setFormData({ ...formData, official_source_url: e.target.value })}
                  placeholder="https://fbr.gov.pk/gazette-notifications/..."
                  className="w-full rounded-lg border border-slate-200 bg-white py-2 px-3 text-xs text-slate-900 placeholder-slate-400 focus:border-[#075e38] focus:outline-none focus:ring-1 focus:ring-[#075e38] shadow-2xs"
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
                  className="h-4 w-4 rounded border-slate-300 text-[#075e38] focus:ring-[#075e38]"
                />
                <label htmlFor="dl_active" className="text-xs text-slate-700 font-medium cursor-pointer">
                  Activate this deadline for automated reminder generation
                </label>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSaving}
                  className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition shadow-2xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="rounded-lg bg-[#075e38] hover:bg-[#064e2e] px-5 py-2 text-xs font-medium text-white shadow-2xs inline-flex items-center gap-1.5 transition disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving...
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
