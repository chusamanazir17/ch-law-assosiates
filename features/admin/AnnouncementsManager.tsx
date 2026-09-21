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
    try {
      const res = await fetch("/api/admin/announcements");
      const data = await res.json();
      if (data.success && Array.isArray(data.announcements)) {
        setAnnouncements(data.announcements);
      } else {
        const supabase = createClient();
        const { data: sData } = await supabase
          .from("site_announcements")
          .select("*")
          .order("created_at", { ascending: false });
        setAnnouncements(sData || []);
      }
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
    try {
      const res = await fetch("/api/admin/announcements", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: ann.id }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Failed to update status");

      setAnnouncements((prev) =>
        prev.map((a) => (a.id === ann.id ? { ...a, is_active: !a.is_active } : { ...a, is_active: false }))
      );
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("cms-updated"));
      }
      setMessage({
        type: "success",
        text: `Announcement "${ann.title}" is now ${!ann.is_active ? "ACTIVE" : "INACTIVE"}.`,
      });
    } catch (error) {
      setMessage({ type: "error", text: getErrorMessage(error, "Failed to update status.") });
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;

    try {
      const res = await fetch(`/api/admin/announcements?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Failed to delete announcement");

      setAnnouncements((prev) => prev.filter((a) => a.id !== id));
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("cms-updated"));
      }
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

    const payload = {
      id: editingId || undefined,
      title: title.trim(),
      message: msgText.trim(),
      tone,
      link_url: linkUrl.trim() || null,
      link_text: linkText.trim() || null,
      is_active: isActive,
    };

    try {
      const res = await fetch("/api/admin/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Failed to save announcement");

      setMessage({
        type: "success",
        text: editingId ? "Announcement updated successfully!" : "New announcement published!",
      });
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("cms-updated"));
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
  const toneClasses: Record<
    AnnouncementTone,
    {
      gradient: string;
      border: string;
      badgeBg: string;
      badgeText: string;
      badgeLabel: string;
      titleColor: string;
      textColor: string;
      dotColor: string;
      btnBg: string;
      icon: LucideIcon;
    }
  > = {
    warning: {
      gradient: "bg-gradient-to-r from-[#180f02] via-[#2a1a05] to-[#180f02]",
      border: "border-amber-500/30",
      badgeBg: "bg-amber-500/15 border-amber-500/30",
      badgeText: "text-amber-300",
      badgeLabel: "STATUTORY NOTICE",
      titleColor: "text-amber-200",
      textColor: "text-amber-100/90",
      dotColor: "bg-amber-400",
      btnBg: "bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold",
      icon: AlertTriangle,
    },
    danger: {
      gradient: "bg-gradient-to-r from-[#1c0505] via-[#2e0909] to-[#1c0505]",
      border: "border-rose-500/30",
      badgeBg: "bg-rose-500/15 border-rose-500/30",
      badgeText: "text-rose-300",
      badgeLabel: "URGENT ALERT",
      titleColor: "text-rose-200",
      textColor: "text-rose-100/90",
      dotColor: "bg-rose-400",
      btnBg: "bg-gradient-to-r from-rose-600 to-rose-700 text-white font-bold",
      icon: ShieldAlert,
    },
    info: {
      gradient: "bg-gradient-to-r from-[#031424] via-[#062038] to-[#031424]",
      border: "border-sky-500/30",
      badgeBg: "bg-sky-500/15 border-sky-500/30",
      badgeText: "text-sky-300",
      badgeLabel: "PUBLIC ADVISORY",
      titleColor: "text-sky-200",
      textColor: "text-sky-100/90",
      dotColor: "bg-sky-400",
      btnBg: "bg-gradient-to-r from-sky-500 to-sky-600 text-slate-950 font-bold",
      icon: Info,
    },
    dark: {
      gradient: "bg-gradient-to-r from-[#050e1c] via-[#0a1b33] to-[#050e1c]",
      border: "border-gold-400/30",
      badgeBg: "bg-gold-400/15 border-gold-400/30",
      badgeText: "text-gold-300",
      badgeLabel: "CHAMBER DISPATCH",
      titleColor: "text-gold-200",
      textColor: "text-slate-100/90",
      dotColor: "bg-gold-400",
      btnBg: "bg-gradient-to-r from-gold-400 to-gold-500 text-navy-950 font-bold",
      icon: Megaphone,
    },
  };

  const currentTone = toneClasses[tone] || toneClasses.warning;
  const CurrentIcon = currentTone.icon;

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-admin pb-10">
      {/* Top Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs font-medium text-[#64748B]">
        <span>Chamber 121</span>
        <span className="text-slate-300">›</span>
        <span>Website</span>
        <span className="text-slate-300">›</span>
        <span className="text-[#0B1F36] font-semibold">Announcements & Tickers</span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0B1F36]">
            Site Announcements & Tickers
          </h1>
          <p className="text-xs text-[#52627A] mt-0.5 leading-relaxed">
            Publish critical FBR deadline extensions, holiday office schedules, or urgent compliance alerts across the website.
          </p>
        </div>
      </div>

      {/* Alert / Notification */}
      {message && (
        <div
          className={`flex items-center justify-between rounded-xl p-3.5 text-xs font-medium border shadow-2xs ${
            message.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200/80"
              : "bg-rose-50 text-rose-800 border-rose-200"
          }`}
        >
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)} className="text-[#64748B] hover:text-[#0B1F36] ml-2 font-medium">
            Dismiss
          </button>
        </div>
      )}

      {/* Editor & Live Preview Grid */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Form Column (3 Cols) */}
        <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-[0_1px_3px_rgba(11,29,56,0.04)] space-y-4 lg:col-span-3">
          <h2 className="text-sm font-semibold text-[#0B1F36] flex items-center gap-2">
            <Edit2 className="h-4 w-4 text-[#C8973D]" />
            <span>{editingId ? "Edit Announcement" : "Create New Notice Banner"}</span>
          </h2>

          <form onSubmit={handleSave} className="space-y-4 text-xs">
            {/* Title */}
            <div>
              <label className="block text-[#334155] font-semibold mb-1">
                Notice Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. FBR Extension: Annual Income Tax Returns"
                className="w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3.5 py-2 text-[#0B1F36] placeholder:text-[#94A3B8] focus:border-[#C8973D] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C8973D]/20 transition"
              />
            </div>

            {/* Message */}
            <div>
              <label className="block text-[#334155] font-semibold mb-1">
                Notice Message *
              </label>
              <textarea
                required
                rows={3}
                value={msgText}
                onChange={(e) => setMsgText(e.target.value)}
                placeholder="Add a concise public notice, filing update, or office announcement here."
                className="w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3.5 py-2 text-[#0B1F36] placeholder:text-[#94A3B8] focus:border-[#C8973D] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C8973D]/20 transition"
              />
            </div>

            {/* Tone */}
            <div>
              <label className="block text-[#334155] font-semibold mb-1">
                Color Theme / Tone
              </label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value as AnnouncementTone)}
                className="w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2 text-[#0B1F36] focus:border-[#C8973D] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C8973D]/20"
              >
                <option value="warning">Warning (Amber)</option>
                <option value="danger">Urgent Alert (Red)</option>
                <option value="info">Informational (Blue)</option>
                <option value="dark">Executive (Chamber Navy)</option>
              </select>
            </div>

            {/* Action Link & Text */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[#334155] font-semibold mb-1">
                  Action Link URL (Optional)
                </label>
                <input
                  type="text"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="/updates/... or https://..."
                  className="w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2 text-[#0B1F36] placeholder:text-[#94A3B8] focus:border-[#C8973D] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C8973D]/20 transition"
                />
              </div>

              <div>
                <label className="block text-[#334155] font-semibold mb-1">
                  Button Text
                </label>
                <input
                  type="text"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  placeholder="e.g. Read Circular &rarr;"
                  className="w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2 text-[#0B1F36] placeholder:text-[#94A3B8] focus:border-[#C8973D] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C8973D]/20 transition"
                />
              </div>
            </div>

            {/* Active Toggle */}
            <label className="flex items-center gap-2 cursor-pointer pt-2 border-t border-[#F1F5F9]">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="h-4 w-4 rounded border-[#CBD5E1] text-[#0B1F36] focus:ring-[#C8973D]"
              />
              <span className="text-[#334155] font-medium">
                Make this banner active immediately on the website
              </span>
            </label>

            {/* Form Actions */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#F1F5F9]">
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-lg border border-[#E2E8F0] px-3.5 py-2 text-[#64748B] hover:bg-slate-50 hover:text-[#0B1F36] transition font-medium"
                >
                  Cancel Edit
                </button>
              )}
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#0B1F36] hover:bg-[#102943] px-4 py-2 font-semibold text-white shadow-xs hover:shadow-sm transition disabled:opacity-50"
              >
                {isSaving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                <span>{editingId ? "Update Notice" : "Publish Notice"}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Live Preview Column (2 Cols) */}
        <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-[0_1px_3px_rgba(11,29,56,0.04)] space-y-4 lg:col-span-2 flex flex-col justify-between">
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-[0.08em] text-[#64748B] flex items-center gap-2 mb-3">
              <Eye className="h-4 w-4 text-[#C8973D]" />
              <span>Live Website Banner Preview</span>
            </h2>
            <p className="text-xs text-[#52627A] mb-4">
              This preview reflects how visitors will see the notification at the top of the homepage and legal guides.
            </p>

            {/* Banner Simulation */}
            <div
              className={`rounded-xl border p-4 shadow-md transition-all ${currentTone.gradient} ${currentTone.border} text-white`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div className="relative flex h-2.5 w-2.5 shrink-0">
                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${currentTone.dotColor} opacity-75`} />
                    <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${currentTone.dotColor}`} />
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[9.5px] font-bold tracking-wider uppercase border ${currentTone.badgeBg} ${currentTone.badgeText}`}
                  >
                    <CurrentIcon className="h-2.5 w-2.5" />
                    <span>{currentTone.badgeLabel}</span>
                  </span>
                  <div className="min-w-0 flex-1">
                    <span className={`font-semibold text-xs block truncate ${currentTone.titleColor}`}>
                      {title || "Official Compliance Notice Title"}
                    </span>
                    <p className={`text-[11px] truncate ${currentTone.textColor}`}>
                      {msgText || "Detailed message content explaining the tax deadline extension or office schedule."}
                    </p>
                  </div>
                </div>

                {(linkUrl || linkText) && (
                  <span className={`inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded shadow-sm shrink-0 font-semibold ${currentTone.btnBg}`}>
                    <span>{linkText || "View Details"}</span>
                    <ExternalLink className="h-3 w-3" />
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-[#F8FAFC] p-3 border border-[#E2E8F0] text-xs text-[#52627A]">
            <span className="text-[#0B1F36] font-semibold">Tip:</span> Use "Urgent Alert" (Red) only for strict FBR penal deadlines, and "Warning" (Amber) for routine quarterly extension notices.
          </div>
        </div>
      </div>

      {/* Announcements Table */}
      <div className="rounded-xl border border-[#E2E8F0] bg-white overflow-hidden shadow-[0_1px_3px_rgba(11,29,56,0.04)]">
        <div className="p-4 border-b border-[#E2E8F0] bg-[#F8FAFC] flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-[0.06em] text-[#64748B]">
            All Recorded Announcements
          </h3>
          <span className="text-xs text-[#64748B] font-normal">{announcements.length} notices</span>
        </div>

        {isLoading ? (
          <div className="py-12 text-center text-[#64748B] text-xs">
            <Loader2 className="h-6 w-6 animate-spin mx-auto text-[#0B1F36] mb-2" />
            Loading announcements...
          </div>
        ) : announcements.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#64748B]">
            No announcements created yet. Use the form above to post a site banner.
          </div>
        ) : (
          <div className="divide-y divide-[#F1F5F9] text-xs">
            {announcements.map((ann) => (
              <div
                key={ann.id}
                className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 hover:bg-[#F8FAFC] transition"
              >
                <div className="space-y-1 max-w-xl">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-block rounded-md px-2.5 py-0.5 text-[10.5px] font-semibold uppercase border ${
                        toneClasses[ann.tone]?.badgeBg || "bg-slate-100"
                      } ${toneClasses[ann.tone]?.badgeText || "text-slate-700"}`}
                    >
                      {ann.tone}
                    </span>
                    <h4 className="font-semibold text-[#0B1F36] text-sm">{ann.title}</h4>
                  </div>
                  <p className="text-[#334155] text-xs leading-relaxed line-clamp-2">
                    {ann.message}
                  </p>
                  {ann.link_url && (
                    <span className="text-[11px] text-[#64748B] font-mono block">
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
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200/80"
                        : "bg-slate-100 text-[#64748B] border border-slate-200"
                    }`}
                  >
                    {ann.is_active ? "Active" : "Inactive"}
                  </button>
                  <button
                    onClick={() => handleEditClick(ann)}
                    className="rounded-lg p-1.5 text-[#94A3B8] hover:bg-slate-100 hover:text-[#0B1F36] transition"
                    title="Edit Announcement"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(ann.id, ann.title)}
                    className="rounded-lg p-1.5 text-[#94A3B8] hover:bg-rose-50 hover:text-rose-600 transition"
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
