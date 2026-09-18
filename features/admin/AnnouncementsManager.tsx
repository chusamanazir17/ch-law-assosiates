"use client";

import React, { useEffect, useState } from "react";
import {
  Megaphone,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Info,
  ShieldAlert,
  Loader2,
  Eye,
  ExternalLink,
  type LucideIcon,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { SiteAnnouncement } from "@/types/cms";

type AnnouncementTone = "info" | "warning" | "danger" | "dark";

function normalizeTone(value: string): AnnouncementTone {
  return value === "info" || value === "danger" || value === "dark" ? value : "warning";
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export default function AnnouncementsManager() {
  const [announcements, setAnnouncements] = useState<SiteAnnouncement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Form fields
  const [title, setTitle] = useState("");
  const [msgText, setMsgText] = useState("");
  const [tone, setTone] = useState<AnnouncementTone>("warning");
  const [linkUrl, setLinkUrl] = useState("");
  const [linkText, setLinkText] = useState("");
  const [isActive, setIsActive] = useState(true);

  const loadAnnouncements = async () => {
    setIsLoading(true);
    const supabase = createClient();
    try {
      const { data, error } = await supabase
        .from("site_announcements")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setAnnouncements(data || []);
    } catch (error) {
      console.error("[Announcements Load Error]", error);
      setMessage({ type: "error", text: "Failed to load announcements." });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setTitle("");
    setMsgText("");
    setTone("warning");
    setLinkUrl("");
    setLinkText("");
    setIsActive(true);
  };

  const handleEditClick = (ann: SiteAnnouncement) => {
    setEditingId(ann.id);
    setTitle(ann.title);
    setMsgText(ann.message);
    setTone(normalizeTone(ann.tone));
    setLinkUrl(ann.link_url || "");
    setLinkText(ann.link_text || "");
    setIsActive(ann.is_active);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleToggleActive = async (ann: SiteAnnouncement) => {
    const supabase = createClient();
    const newStatus = !ann.is_active;

    try {
      const { error } = await supabase
        .from("site_announcements")
        .update({ is_active: newStatus, updated_at: new Date().toISOString() })
        .eq("id", ann.id);

      if (error) throw error;

      setAnnouncements((prev) =>
        prev.map((a) => (a.id === ann.id ? { ...a, is_active: newStatus } : a))
      );
      setMessage({
        type: "success",
        text: `Announcement "${ann.title}" is now ${newStatus ? "ACTIVE" : "INACTIVE"}.`,
      });
    } catch (error) {
      setMessage({ type: "error", text: getErrorMessage(error, "Failed to update status.") });
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;

    const supabase = createClient();
    try {
      const { error } = await supabase
        .from("site_announcements")
        .delete()
        .eq("id", id);

      if (error) throw error;
      setAnnouncements((prev) => prev.filter((a) => a.id !== id));
      setMessage({ type: "success", text: "Announcement deleted successfully." });
    } catch (error) {
      setMessage({ type: "error", text: getErrorMessage(error, "Failed to delete announcement.") });
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !msgText.trim()) {
      setMessage({ type: "error", text: "Title and message are required." });
      return;
    }

    setIsSaving(true);
    setMessage(null);
    const supabase = createClient();

    const payload = {
      title: title.trim(),
      message: msgText.trim(),
      tone,
      link_url: linkUrl.trim() || null,
      link_text: linkText.trim() || null,
      is_active: isActive,
      updated_at: new Date().toISOString(),
    };

    try {
      if (editingId) {
        // Update
        const { error } = await supabase
          .from("site_announcements")
          .update(payload)
          .eq("id", editingId);

        if (error) throw error;
        setMessage({ type: "success", text: "Announcement updated successfully!" });
      } else {
        // Insert
        const { error } = await supabase
          .from("site_announcements")
          .insert(payload);

        if (error) throw error;
        setMessage({ type: "success", text: "New announcement published!" });
      }

      resetForm();
      loadAnnouncements();
    } catch (error) {
      console.error("[Save Announcement Error]", error);
      setMessage({ type: "error", text: getErrorMessage(error, "Failed to save announcement.") });
    } finally {
      setIsSaving(false);
    }
  };

  // Tone banner styles mapping
  const toneClasses: Record<AnnouncementTone, { bg: string; border: string; text: string; icon: LucideIcon }> = {
    warning: {
      bg: "bg-amber-50",
      border: "border-amber-200",
      text: "text-amber-900",
      icon: AlertTriangle,
    },
    danger: {
      bg: "bg-rose-50",
      border: "border-rose-200",
      text: "text-rose-900",
      icon: ShieldAlert,
    },
    info: {
      bg: "bg-sky-50",
      border: "border-sky-200",
      text: "text-sky-900",
      icon: Info,
    },
    dark: {
      bg: "bg-slate-900",
      border: "border-slate-800",
      text: "text-white",
      icon: Megaphone,
    },
  };

  const currentTone = toneClasses[tone] || toneClasses.warning;
  const CurrentIcon = currentTone.icon;

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb */}
      <div className="text-[13px] text-slate-500 font-normal">
        <span>Website</span>
        <span className="mx-2 text-slate-400">/</span>
        <span className="text-slate-700">Announcements</span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-[32px] font-bold tracking-tight text-slate-900 leading-tight">
            Site Announcements & Tickers
          </h1>
          <p className="text-[14.5px] text-slate-500 mt-1">
            Publish critical FBR deadline extensions, holiday office schedules, or urgent compliance alerts across the website.
          </p>
        </div>
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
          <button onClick={() => setMessage(null)} className="text-slate-500 hover:text-slate-800 ml-2">
            Dismiss
          </button>
        </div>
      )}

      {/* Editor & Live Preview Grid */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Form Column (3 Cols) */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs space-y-4 lg:col-span-3">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Edit2 className="h-4 w-4 text-[#075e38]" />
            <span>{editingId ? "Edit Announcement" : "Create New Notice Banner"}</span>
          </h2>

          <form onSubmit={handleSave} className="space-y-4 text-xs">
            {/* Title */}
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Notice Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. FBR Extension: Annual Income Tax Returns"
                className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-slate-900 placeholder-slate-400 focus:border-[#075e38] focus:outline-none focus:ring-1 focus:ring-[#075e38]"
              />
            </div>

            {/* Message */}
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Notice Message *
              </label>
              <textarea
                required
                rows={3}
                value={msgText}
                onChange={(e) => setMsgText(e.target.value)}
                placeholder="Add a concise public notice, filing update, or office announcement here."
                className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-slate-900 placeholder-slate-400 focus:border-[#075e38] focus:outline-none focus:ring-1 focus:ring-[#075e38]"
              />
            </div>

            {/* Tone */}
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Color Theme / Tone
              </label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value as AnnouncementTone)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 focus:border-[#075e38] focus:outline-none"
              >
                <option value="warning">Warning (Amber)</option>
                <option value="danger">Urgent Alert (Red)</option>
                <option value="info">Informational (Blue)</option>
                <option value="dark">Executive (Dark Slate)</option>
              </select>
            </div>

            {/* Action Link & Text */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Action Link URL (Optional)
                </label>
                <input
                  type="text"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="/updates/... or https://..."
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-[#075e38] focus:outline-none focus:ring-1 focus:ring-[#075e38]"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Button Text
                </label>
                <input
                  type="text"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  placeholder="e.g. Read Circular &rarr;"
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-[#075e38] focus:outline-none focus:ring-1 focus:ring-[#075e38]"
                />
              </div>
            </div>

            {/* Active Toggle */}
            <label className="flex items-center gap-2 cursor-pointer pt-2 border-t border-slate-100">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-[#075e38] focus:ring-[#075e38]"
              />
              <span className="text-slate-800 font-medium">
                Make this banner active immediately on the website
              </span>
            </label>

            {/* Form Actions */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-lg border border-slate-200 px-3.5 py-2 text-slate-600 hover:bg-slate-50 transition"
                >
                  Cancel Edit
                </button>
              )}
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#075e38] hover:bg-[#064e2e] px-4 py-2 font-medium text-white shadow-2xs transition disabled:opacity-50"
              >
                {isSaving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                <span>{editingId ? "Update Notice" : "Publish Notice"}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Live Preview Column (2 Cols) */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs space-y-4 lg:col-span-2 flex flex-col justify-between">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2 mb-3">
              <Eye className="h-4 w-4 text-[#075e38]" />
              <span>Live Website Banner Preview</span>
            </h2>
            <p className="text-[12px] text-slate-500 mb-4">
              This preview reflects how visitors will see the notification at the top of the homepage and legal guides.
            </p>

            {/* Banner Simulation */}
            <div
              className={`rounded-xl border p-4 shadow-2xs transition-all ${currentTone.bg} ${currentTone.border}`}
            >
              <div className="flex items-start gap-3">
                <CurrentIcon className={`h-5 w-5 shrink-0 ${currentTone.text} mt-0.5`} />
                <div className="min-w-0 flex-1">
                  <span className={`font-bold text-xs block ${currentTone.text}`}>
                    {title || "Official Compliance Notice Title"}
                  </span>
                  <p className="text-[11.5px] text-slate-700 mt-1 leading-relaxed">
                    {msgText || "Detailed message content explaining the tax deadline extension or office schedule will appear here."}
                  </p>
                  {(linkUrl || linkText) && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#075e38] hover:underline mt-2">
                      <span>{linkText || "Learn More"}</span>
                      <ExternalLink className="h-3 w-3" />
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-slate-50 p-3 border border-slate-200 text-[11.5px] text-slate-500">
            <span className="text-slate-800 font-semibold">Tip:</span> Use "Urgent Alert" (Red) only for strict FBR penal deadlines, and "Warning" (Amber) for routine quarterly extension notices.
          </div>
        </div>
      </div>

      {/* Announcements Table */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
        <div className="p-4 border-b border-slate-200 bg-slate-50/75 flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            All Recorded Announcements
          </h3>
          <span className="text-xs text-slate-400 font-normal">{announcements.length} notices</span>
        </div>

        {isLoading ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            <Loader2 className="h-6 w-6 animate-spin mx-auto text-[#075e38] mb-2" />
            Loading announcements...
          </div>
        ) : announcements.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            No announcements created yet. Use the form above to post a site banner.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 text-xs">
            {announcements.map((ann) => (
              <div
                key={ann.id}
                className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 hover:bg-slate-50/75 transition"
              >
                <div className="space-y-1 max-w-xl">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-block rounded-full px-2.5 py-0.5 text-[10.5px] font-bold uppercase border ${
                        toneClasses[ann.tone]?.bg || "bg-slate-100"
                      } ${toneClasses[ann.tone]?.text || "text-slate-700"} ${
                        toneClasses[ann.tone]?.border || "border-slate-200"
                      }`}
                    >
                      {ann.tone}
                    </span>
                    <h4 className="font-bold text-slate-900 text-sm">{ann.title}</h4>
                  </div>
                  <p className="text-slate-600 text-[11.5px] leading-relaxed line-clamp-2">
                    {ann.message}
                  </p>
                  {ann.link_url && (
                    <span className="text-[11px] text-slate-400 font-mono block">
                      Link: {ann.link_url}
                    </span>
                  )}
                </div>

                {/* Right controls */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleToggleActive(ann)}
                    className={`rounded-full px-3 py-1 text-[11px] font-semibold transition ${
                      ann.is_active
                        ? "bg-[#eef7f2] text-[#075e38] border border-emerald-200/80"
                        : "bg-slate-100 text-slate-600 border border-slate-200"
                    }`}
                  >
                    {ann.is_active ? "Active" : "Inactive"}
                  </button>
                  <button
                    onClick={() => handleEditClick(ann)}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
                    title="Edit Announcement"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(ann.id, ann.title)}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition"
                    title="Delete Announcement"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
