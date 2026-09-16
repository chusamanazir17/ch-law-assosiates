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
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { SiteAnnouncement } from "@/types/cms";

export default function AnnouncementsManager() {
  const [announcements, setAnnouncements] = useState<SiteAnnouncement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Form fields
  const [title, setTitle] = useState("");
  const [msgText, setMsgText] = useState("");
  const [tone, setTone] = useState<"info" | "warning" | "danger" | "dark">("warning");
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
    } catch (err: any) {
      console.error("[Announcements Load Error]", err);
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
    setTone(ann.tone as any);
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
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to update status." });
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
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to delete announcement." });
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
    } catch (err: any) {
      console.error("[Save Announcement Error]", err);
      setMessage({ type: "error", text: err.message || "Failed to save announcement." });
    } finally {
      setIsSaving(false);
    }
  };

  // Tone banner styles mapping
  const toneClasses: Record<string, { bg: string; border: string; text: string; icon: any }> = {
    warning: {
      bg: "bg-amber-500/15",
      border: "border-amber-500/30",
      text: "text-amber-300",
      icon: AlertTriangle,
    },
    danger: {
      bg: "bg-red-500/15",
      border: "border-red-500/30",
      text: "text-red-300",
      icon: ShieldAlert,
    },
    info: {
      bg: "bg-sky-500/15",
      border: "border-sky-500/30",
      text: "text-sky-300",
      icon: Info,
    },
    dark: {
      bg: "bg-navy-950",
      border: "border-white/20",
      text: "text-white",
      icon: Megaphone,
    },
  };

  const currentTone = toneClasses[tone] || toneClasses.warning;
  const CurrentIcon = currentTone.icon;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-amber-400/20 text-amber-400">
              <Megaphone className="h-3.5 w-3.5" />
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">
              Emergency Notices & Tickers
            </span>
          </div>
          <h1 className="mt-1 text-2xl font-bold font-serif text-white tracking-tight sm:text-3xl">
            Site Announcements & Tickers
          </h1>
          <p className="mt-1 text-xs text-white/60">
            Publish critical FBR deadline extensions, holiday office schedules, or urgent compliance alerts across the website.
          </p>
        </div>
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
          <button onClick={() => setMessage(null)} className="text-white/60 hover:text-white ml-2">
            Dismiss
          </button>
        </div>
      )}

      {/* Editor & Live Preview Grid */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Form Column (3 Cols) */}
        <div className="rounded-xl border border-white/10 bg-navy-900/60 p-5 backdrop-blur-sm space-y-4 lg:col-span-3">
          <h2 className="text-sm font-bold font-serif text-white flex items-center gap-2">
            <Edit2 className="h-4 w-4 text-gold-400" />
            <span>{editingId ? "Edit Announcement" : "Create New Notice Banner"}</span>
          </h2>

          <form onSubmit={handleSave} className="space-y-4 text-xs">
            {/* Title */}
            <div>
              <label className="block text-white/70 font-semibold mb-1">
                Notice Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. FBR Extension: Annual Income Tax Returns"
                className="w-full rounded-lg border border-white/10 bg-navy-950/80 px-3.5 py-2 text-white placeholder-white/30 focus:border-gold-400 focus:outline-none"
              />
            </div>

            {/* Message */}
            <div>
              <label className="block text-white/70 font-semibold mb-1">
                Notice Message *
              </label>
              <textarea
                required
                rows={3}
                value={msgText}
                onChange={(e) => setMsgText(e.target.value)}
                placeholder="FBR has extended the statutory filing deadline to October 31, 2024. Visit Chamber 121 for fast-track processing."
                className="w-full rounded-lg border border-white/10 bg-navy-950/80 px-3.5 py-2 text-white placeholder-white/30 focus:border-gold-400 focus:outline-none"
              />
            </div>

            {/* Tone */}
            <div>
              <label className="block text-white/70 font-semibold mb-1">
                Color Theme / Tone
              </label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value as any)}
                className="w-full rounded-lg border border-white/10 bg-navy-950/80 px-3 py-2 text-white focus:border-gold-400 focus:outline-none"
              >
                <option value="warning">Warning (Gold / Amber)</option>
                <option value="danger">Urgent Alert (Red)</option>
                <option value="info">Informational (Blue)</option>
                <option value="dark">Executive (Navy / Black)</option>
              </select>
            </div>

            {/* Action Link & Text */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-white/70 font-semibold mb-1">
                  Action Link URL (Optional)
                </label>
                <input
                  type="text"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="/updates/... or https://..."
                  className="w-full rounded-lg border border-white/10 bg-navy-950/80 px-3 py-2 text-white placeholder-white/30 focus:border-gold-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-white/70 font-semibold mb-1">
                  Button Text
                </label>
                <input
                  type="text"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  placeholder="e.g. Read Circular &rarr;"
                  className="w-full rounded-lg border border-white/10 bg-navy-950/80 px-3 py-2 text-white placeholder-white/30 focus:border-gold-400 focus:outline-none"
                />
              </div>
            </div>

            {/* Active Toggle */}
            <label className="flex items-center gap-2 cursor-pointer pt-2 border-t border-white/10">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="h-4 w-4 rounded border-white/20 bg-navy-950 text-gold-500 focus:ring-gold-400"
              />
              <span className="text-white/80 font-medium">
                Make this banner active immediately on the website
              </span>
            </label>

            {/* Form Actions */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-lg border border-white/15 px-3.5 py-2 text-white/70 hover:bg-white/10 transition"
                >
                  Cancel Edit
                </button>
              )}
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center gap-1.5 rounded-lg bg-gold-500 px-4 py-2 font-bold text-navy-950 hover:bg-gold-400 transition disabled:opacity-50"
              >
                {isSaving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                <span>{editingId ? "Update Notice" : "Publish Notice"}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Live Preview Column (2 Cols) */}
        <div className="rounded-xl border border-white/10 bg-navy-900/60 p-5 backdrop-blur-sm space-y-4 lg:col-span-2 flex flex-col justify-between">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-white/80 flex items-center gap-2 mb-3">
              <Eye className="h-4 w-4 text-sky-400" />
              <span>Live Website Banner Preview</span>
            </h2>
            <p className="text-[11px] text-white/50 mb-4">
              This preview reflects how visitors will see the notification at the top of the homepage and legal guides.
            </p>

            {/* Banner Simulation */}
            <div
              className={`rounded-xl border p-4 shadow-lg transition-all ${currentTone.bg} ${currentTone.border}`}
            >
              <div className="flex items-start gap-3">
                <CurrentIcon className={`h-5 w-5 shrink-0 ${currentTone.text} mt-0.5`} />
                <div className="min-w-0 flex-1">
                  <span className={`font-bold text-xs block ${currentTone.text}`}>
                    {title || "Official Compliance Notice Title"}
                  </span>
                  <p className="text-[11px] text-white/80 mt-1 leading-relaxed">
                    {msgText || "Detailed message content explaining the tax deadline extension or office schedule will appear here."}
                  </p>
                  {(linkUrl || linkText) && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-gold-400 hover:underline mt-2">
                      <span>{linkText || "Learn More"}</span>
                      <ExternalLink className="h-3 w-3" />
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-navy-950/80 p-3 border border-white/5 text-[11px] text-white/50">
            <span className="text-gold-400 font-semibold">Tip:</span> Use "Urgent Alert" (Red) only for strict FBR penal deadlines, and "Warning" (Gold) for routine quarterly extension notices.
          </div>
        </div>
      </div>

      {/* Announcements Table */}
      <div className="rounded-xl border border-white/10 bg-navy-900/60 backdrop-blur-sm overflow-hidden shadow-xl">
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-white">
            All Recorded Announcements
          </h3>
          <span className="text-xs text-white/50">{announcements.length} notices</span>
        </div>

        {isLoading ? (
          <div className="py-12 text-center text-white/40 text-xs">
            <Loader2 className="h-6 w-6 animate-spin mx-auto text-gold-400 mb-2" />
            Loading announcements...
          </div>
        ) : announcements.length === 0 ? (
          <div className="p-8 text-center text-xs text-white/60">
            No announcements created yet. Use the form above to post a site banner.
          </div>
        ) : (
          <div className="divide-y divide-white/5 text-xs">
            {announcements.map((ann) => (
              <div
                key={ann.id}
                className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 hover:bg-white/[0.02] transition"
              >
                <div className="space-y-1 max-w-xl">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase border ${
                        toneClasses[ann.tone]?.bg || "bg-white/10"
                      } ${toneClasses[ann.tone]?.text || "text-white"} ${
                        toneClasses[ann.tone]?.border || "border-white/20"
                      }`}
                    >
                      {ann.tone}
                    </span>
                    <h4 className="font-bold text-white text-sm">{ann.title}</h4>
                  </div>
                  <p className="text-white/70 text-[11px] leading-relaxed line-clamp-2">
                    {ann.message}
                  </p>
                  {ann.link_url && (
                    <span className="text-[10px] text-gold-400 font-mono block">
                      Link: {ann.link_url}
                    </span>
                  )}
                </div>

                {/* Right controls */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleToggleActive(ann)}
                    className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase transition ${
                      ann.is_active
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30"
                        : "bg-slate-500/20 text-slate-400 border border-slate-500/30 hover:bg-slate-500/30"
                    }`}
                  >
                    {ann.is_active ? "Active" : "Inactive"}
                  </button>
                  <button
                    onClick={() => handleEditClick(ann)}
                    className="rounded-lg p-1.5 text-white/60 hover:bg-white/10 hover:text-gold-400 transition"
                    title="Edit Announcement"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(ann.id, ann.title)}
                    className="rounded-lg p-1.5 text-white/40 hover:bg-red-500/10 hover:text-red-400 transition"
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
