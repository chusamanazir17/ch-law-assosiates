"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  Users,
  Plus,
  Search,
  Edit3,
  Trash2,
  ArrowUp,
  ArrowDown,
  Phone,
  MessageCircle,
  Shield,
  Save,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Award,
  Globe,
  Upload,
} from "lucide-react";
import type { CmsTeamMember } from "@/lib/db/teamMembersStore";

const PRESET_AVATARS = [
  { label: "Late Founder HFM", url: "/images/owners/haji-faqir-muhammad.jpg" },
  { label: "Senior Consultant HNA", url: "/images/owners/haji-nazir-ahmad.jpg" },
  { label: "Lead Advocate UNC", url: "/images/owners/usama-nazir-ch.jpg" },
  { label: "Executive Advocate", url: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80" },
  { label: "Corporate Lawyer", url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80" },
  { label: "Legal Consultant", url: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80" },
];

export default function TeamManager() {
  const [members, setMembers] = useState<CmsTeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "current" | "late">("all");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<CmsTeamMember | null>(null);
  const [formData, setFormData] = useState<Partial<CmsTeamMember>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const showNotification = (type: "success" | "error", text: string) => {
    setNotification({ type, text });
    setTimeout(() => setNotification(null), 4000);
  };

  const fetchMembers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/team");
      const data = await res.json();
      if (res.ok && data.success) {
        setMembers(data.members || []);
      } else {
        throw new Error(data.error || "Failed to load team members");
      }
    } catch (err) {
      showNotification("error", err instanceof Error ? err.message : "Error fetching team members");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const openCreateModal = () => {
    setEditingMember(null);
    setFormData({
      name: "",
      nameUrdu: "",
      role: "",
      roleUrdu: "",
      status: "current",
      badge: "Legal Consultant",
      imageUrl: "/images/owners/usama-nazir-ch.jpg",
      bio: "",
      bioUrdu: "",
      phone: "",
      whatsapp: "",
      sortOrder: members.length + 1,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (member: CmsTeamMember) => {
    setEditingMember(member);
    setFormData({ ...member });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) {
      showNotification("error", "Full name is required.");
      return;
    }
    if (!formData.role?.trim()) {
      showNotification("error", "Job title / role is required.");
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch("/api/admin/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to save team member");
      }

      showNotification("success", `Team member "${data.member.name}" saved successfully!`);
      setIsModalOpen(false);
      fetchMembers();
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
      const res = await fetch(`/api/admin/team?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to delete team member");
      }
      showNotification("success", "Team member removed.");
      setDeleteConfirmId(null);
      fetchMembers();
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("cms-updated"));
      }
    } catch (err) {
      showNotification("error", err instanceof Error ? err.message : "Failed to delete");
    }
  };

  const handleMove = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= members.length) return;

    const reordered = [...members];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);

    setMembers(reordered);

    try {
      const orderedIds = reordered.map((m) => m.id);
      await fetch("/api/admin/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reorder", orderedIds }),
      });
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("cms-updated"));
      }
    } catch (err) {
      fetchMembers();
    }
  };

  const filteredMembers = members.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.nameUrdu && m.nameUrdu.includes(searchQuery));
    const matchesStatus = statusFilter === "all" || m.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#0b1329] p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold-400/10 text-gold-500 font-bold">
              <Users className="h-5 w-5" />
            </span>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-navy-950 dark:text-white">
                Team & Chamber Lawyers
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Manage firm leadership, advocates, stamp vendors, and legal consultants displayed on the website.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={openCreateModal}
          className="btn-gold inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold shadow-sm"
        >
          <Plus className="h-4 w-4" />
          <span>Add Team Member</span>
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
            placeholder="Search lawyers, advocates, roles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-gold-400/30"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Status:</span>
          {(["all", "current", "late"] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition ${
                statusFilter === st
                  ? "bg-navy-900 text-white dark:bg-gold-400 dark:text-navy-950"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
              }`}
            >
              {st === "all" ? "All Members" : st === "late" ? "Late Founder" : "Active / Current"}
            </button>
          ))}
        </div>
      </div>

      {/* Team Members List */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-[#0b1329] rounded-2xl border border-slate-200/80 dark:border-slate-800">
          <Loader2 className="h-8 w-8 text-gold-500 animate-spin" />
          <p className="mt-3 text-xs text-slate-500">Loading team & lawyers directory...</p>
        </div>
      ) : filteredMembers.length === 0 ? (
        <div className="text-center p-12 bg-white dark:bg-[#0b1329] rounded-2xl border border-slate-200/80 dark:border-slate-800">
          <Users className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-600" />
          <h3 className="mt-3 text-sm font-bold text-navy-950 dark:text-white">No team members found</h3>
          <p className="mt-1 text-xs text-slate-500">
            {searchQuery ? "Try refining your search query." : "Add your first lawyer or consultant to display them on the website."}
          </p>
          <button
            onClick={openCreateModal}
            className="btn-gold mt-4 inline-flex items-center gap-2 px-4 py-2 text-xs font-bold"
          >
            <Plus className="h-3.5 w-3.5" /> Add Lawyer
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredMembers.map((member, index) => {
            const isLate = member.status === "late";
            return (
              <div
                key={member.id}
                className={`relative flex flex-col justify-between rounded-2xl border p-5 transition bg-white dark:bg-[#0b1329] shadow-xs ${
                  isLate
                    ? "border-amber-300/60 dark:border-amber-500/30 bg-amber-50/20"
                    : "border-slate-200/80 dark:border-slate-800"
                }`}
              >
                <div>
                  {/* Top Bar: Reordering & Badge */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        isLate
                          ? "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300/40"
                          : "bg-gold-400/15 text-gold-600 dark:text-gold-400 border border-gold-400/20"
                      }`}
                    >
                      <Award className="h-3 w-3" />
                      {member.badge || (isLate ? "Late Founder" : "Consultant")}
                    </span>

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
                        disabled={index === members.length - 1}
                        title="Move Down"
                        className="p-1 rounded text-slate-400 hover:text-navy-950 dark:hover:text-white disabled:opacity-30 disabled:pointer-events-none"
                      >
                        <ArrowDown className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Profile Header */}
                  <div className="flex items-start gap-3.5">
                    <div className="relative h-14 w-14 shrink-0 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      {member.imageUrl ? (
                        <Image
                          src={member.imageUrl}
                          alt={member.name}
                          fill
                          className="object-cover"
                          sizes="56px"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center font-bold text-slate-400 text-base">
                          {member.name.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-sm text-navy-950 dark:text-white truncate">
                        {member.name}
                      </h3>
                      {member.nameUrdu && (
                        <p className="text-xs text-gold-600 dark:text-gold-400 font-medium truncate mt-0.5">
                          {member.nameUrdu}
                        </p>
                      )}
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 font-medium line-clamp-2 mt-1 leading-tight">
                        {member.role}
                      </p>
                    </div>
                  </div>

                  {/* Bio */}
                  {member.bio && (
                    <p className="mt-3.5 text-xs text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed border-t border-slate-100 dark:border-slate-800/80 pt-3">
                      {member.bio}
                    </p>
                  )}

                  {/* Contact details */}
                  {(member.phone || member.whatsapp) && (
                    <div className="mt-3 flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-[11px] text-slate-500">
                      {member.phone && (
                        <span className="flex items-center gap-1 font-mono font-medium">
                          <Phone className="h-3 w-3 text-gold-500" />
                          {member.phone}
                        </span>
                      )}
                      {member.whatsapp && (
                        <span className="flex items-center gap-1 font-mono font-medium text-emerald-600 dark:text-emerald-400">
                          <MessageCircle className="h-3 w-3" />
                          WhatsApp
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Actions bottom bar */}
                <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  <span className="text-[10px] text-slate-400 font-mono">
                    Order #{member.sortOrder}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => openEditModal(member)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-navy-900 dark:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                    >
                      <Edit3 className="h-3 w-3 text-gold-500" />
                      <span>Edit</span>
                    </button>

                    {deleteConfirmId === member.id ? (
                      <div className="flex items-center gap-1 bg-red-50 dark:bg-red-950/60 p-1 rounded-lg border border-red-200 dark:border-red-800">
                        <button
                          onClick={() => handleDelete(member.id)}
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
                        onClick={() => setDeleteConfirmId(member.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition"
                        title="Delete member"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-xs">
          <div className="w-full max-w-2xl bg-white dark:bg-[#0b1329] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-h-[90vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold-400/10 text-gold-500">
                  <Users className="h-4 w-4" />
                </span>
                <h2 className="font-bold text-base text-navy-950 dark:text-white">
                  {editingMember ? "Edit Team Member" : "Add New Team Member"}
                </h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Full Name (English) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name || ""}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Usama Nazir Ch"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gold-400/40"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Full Name (Urdu)
                  </label>
                  <input
                    type="text"
                    dir="rtl"
                    value={formData.nameUrdu || ""}
                    onChange={(e) => setFormData({ ...formData, nameUrdu: e.target.value })}
                    placeholder="مثلاً: اسامہ نذیر چوہدری"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gold-400/40"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Job Title / Role (English) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.role || ""}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    placeholder="e.g. Advocate / Tax & E-Stamp Advisor"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gold-400/40"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Job Title / Role (Urdu)
                  </label>
                  <input
                    type="text"
                    dir="rtl"
                    value={formData.roleUrdu || ""}
                    onChange={(e) => setFormData({ ...formData, roleUrdu: e.target.value })}
                    placeholder="مثلاً: ایڈووکیٹ / ٹیکس و ای سٹامپ ایڈوائزر"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gold-400/40"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status || "current"}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as "current" | "late" })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gold-400/40"
                  >
                    <option value="current">Current / Active Member</option>
                    <option value="late">Late Founder / Memorial</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Badge / Tag
                  </label>
                  <input
                    type="text"
                    value={formData.badge || ""}
                    onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                    placeholder="e.g. Lead Consultant, Senior Owner"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gold-400/40"
                  />
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

              {/* Photo Image URL & Presets */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Profile Photo URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.imageUrl || ""}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    placeholder="/images/owners/usama-nazir-ch.jpg or https://..."
                    className="flex-1 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gold-400/40"
                  />
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <span className="text-[10px] text-slate-400 self-center">Presets:</span>
                  {PRESET_AVATARS.map((p) => (
                    <button
                      key={p.url}
                      type="button"
                      onClick={() => setFormData({ ...formData, imageUrl: p.url })}
                      className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] text-slate-600 dark:text-slate-300 hover:bg-gold-400/20 hover:text-gold-600 transition"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={formData.phone || ""}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="0305-7902744"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gold-400/40"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    WhatsApp Number
                  </label>
                  <input
                    type="text"
                    value={formData.whatsapp || ""}
                    onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                    placeholder="0305-7902744"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gold-400/40"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Biography (English)
                </label>
                <textarea
                  rows={3}
                  value={formData.bio || ""}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Professional background, specializations, experience..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gold-400/40"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Biography (Urdu)
                </label>
                <textarea
                  rows={2}
                  dir="rtl"
                  value={formData.bioUrdu || ""}
                  onChange={(e) => setFormData({ ...formData, bioUrdu: e.target.value })}
                  placeholder="پیشہ ورانہ تعارف، تجربہ، عدالتی و ٹیکس خدمات کی تفصیل..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gold-400/40"
                />
              </div>

              {/* Submit Buttons */}
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
                      <Save className="h-3.5 w-3.5" /> Save Team Member
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
