"use client";

import React, { useEffect, useState } from "react";
import {
  MessageSquareText,
  Search,
  Filter,
  Phone,
  MessageCircle,
  Clock,
  CheckCircle2,
  Trash2,
  User,
  Calendar,
  Loader2,
  MapPin,
  ExternalLink,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { ConsultationInquiry } from "@/types/cms";

export default function InquiriesManager() {
  const [inquiries, setInquiries] = useState<ConsultationInquiry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const loadInquiries = async () => {
    setIsLoading(true);
    const supabase = createClient();
    try {
      const { data, error } = await supabase
        .from("consultation_inquiries")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setInquiries(data || []);
    } catch (err: any) {
      console.error("[Inquiries Load Error]", err);
      setMessage({ type: "error", text: "Failed to load client inquiries." });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInquiries();
  }, []);

  const handleStatusChange = async (
    id: string,
    newStatus: "new" | "in_progress" | "completed" | "archived"
  ) => {
    setActionLoading(id);
    const supabase = createClient();

    try {
      const { error } = await supabase
        .from("consultation_inquiries")
        .update({ status: newStatus })
        .eq("id", id);

      if (error) throw error;

      setInquiries((prev) =>
        prev.map((inq) => (inq.id === id ? { ...inq, status: newStatus } : inq))
      );
      setMessage({ type: "success", text: `Status updated to ${newStatus}.` });
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to update status." });
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete inquiry from ${name}?`)) return;

    setActionLoading(id);
    const supabase = createClient();
    try {
      const { error } = await supabase
        .from("consultation_inquiries")
        .delete()
        .eq("id", id);

      if (error) throw error;
      setInquiries((prev) => prev.filter((i) => i.id !== id));
      setMessage({ type: "success", text: "Inquiry removed from inbox." });
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to delete inquiry." });
    } finally {
      setActionLoading(null);
    }
  };

  const filteredInquiries = inquiries.filter((inq) => {
    const matchesSearch =
      inq.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inq.phone.includes(searchQuery) ||
      (inq.email && inq.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (inq.service_needed && inq.service_needed.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (inq.message && inq.message.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus =
      statusFilter === "all" || inq.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-400/20 text-emerald-400">
              <MessageSquareText className="h-3.5 w-3.5" />
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
              Client Inquiries & Leads
            </span>
          </div>
          <h1 className="mt-1 text-2xl font-bold font-serif text-white tracking-tight sm:text-3xl">
            Consultation Requests Inbox
          </h1>
          <p className="mt-1 text-xs text-white/60">
            Real-time leads submitted by visitors from the website contact forms. Reply directly via WhatsApp or Phone.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="rounded-xl border border-white/10 bg-navy-900/80 px-4 py-2 text-xs text-white/70">
            <span>Total Leads: </span>
            <strong className="text-gold-400 font-bold">{inquiries.length}</strong>
            <span className="mx-2 text-white/30">•</span>
            <span>New: </span>
            <strong className="text-emerald-400 font-bold">
              {inquiries.filter((i) => i.status === "new").length}
            </strong>
          </div>
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

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 rounded-xl border border-white/10 bg-navy-900/60 p-4 backdrop-blur-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search leads by client name, phone number, service, or message..."
            className="w-full rounded-lg border border-white/10 bg-navy-950/80 py-2 pl-9 pr-4 text-xs text-white placeholder-white/40 focus:border-gold-400 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-white/40 shrink-0" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-white/10 bg-navy-950/80 px-3 py-2 text-xs text-white focus:border-gold-400 focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Leads List */}
      <div className="rounded-xl border border-white/10 bg-navy-900/60 backdrop-blur-sm overflow-hidden shadow-xl">
        {isLoading ? (
          <div className="py-16 text-center text-xs text-white/40">
            <Loader2 className="h-6 w-6 animate-spin mx-auto text-gold-400 mb-2" />
            Loading inquiries...
          </div>
        ) : filteredInquiries.length === 0 ? (
          <div className="py-16 text-center text-xs text-white/60">
            <MessageSquareText className="mx-auto h-8 w-8 text-white/30 mb-2" />
            <p className="font-semibold text-white">No consultation inquiries found.</p>
            <p className="text-white/40 mt-1 max-w-sm mx-auto">
              When clients fill out the contact form on your website requesting tax filing or e-stamping assistance, their inquiries appear here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-white/5 text-xs">
            {filteredInquiries.map((inq) => {
              // Clean phone number for WhatsApp
              const cleanPhone = inq.phone.replace(/[^0-9]/g, "");
              const waNumber = cleanPhone.startsWith("0")
                ? `92${cleanPhone.slice(1)}`
                : cleanPhone;

              const waMessage = encodeURIComponent(
                `السلام علیکم / Hello ${inq.name}, thank you for contacting Ch Composing Estamp & Tax Advisor (Chamber 121, Sahiwal). Regarding your inquiry for ${inq.service_needed || "legal & tax services"}, how may we assist you today?`
              );

              return (
                <div
                  key={inq.id}
                  className="p-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 hover:bg-white/[0.02] transition"
                >
                  {/* Left Column: Client info and message */}
                  <div className="space-y-2 max-w-2xl">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-sm text-white">{inq.name}</span>
                      <span className="rounded-md bg-gold-400/10 border border-gold-400/20 px-2 py-0.5 text-[11px] font-semibold text-gold-400">
                        {inq.service_needed || "Tax Consultation"}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                          inq.status === "new"
                            ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                            : inq.status === "in_progress"
                            ? "bg-sky-500/15 text-sky-400 border border-sky-500/30"
                            : "bg-slate-500/15 text-slate-400 border border-slate-500/30"
                        }`}
                      >
                        {inq.status}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-white/60 text-[11px]">
                      <span className="flex items-center gap-1 text-white/80 font-mono">
                        <Phone className="h-3 w-3 text-gold-400" />
                        {inq.phone}
                      </span>
                      {inq.email && (
                        <span>Email: {inq.email}</span>
                      )}
                      <span className="flex items-center gap-1 text-white/40">
                        <Clock className="h-3 w-3" />
                        {new Date(inq.created_at).toLocaleString("en-PK", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </span>
                    </div>

                    {inq.message && (
                      <p className="rounded-lg bg-navy-950/60 p-3 border border-white/5 text-white/80 text-xs leading-relaxed italic">
                        "{inq.message}"
                      </p>
                    )}
                  </div>

                  {/* Right Column: Actions (WhatsApp, Call, Status change, Delete) */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    {/* WhatsApp Action Button */}
                    <a
                      href={`https://wa.me/${waNumber}?text=${waMessage}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-500 transition shadow-sm"
                    >
                      <MessageCircle className="h-3.5 w-3.5" />
                      <span>WhatsApp Reply</span>
                    </a>

                    {/* Phone Call Button */}
                    <a
                      href={`tel:${inq.phone}`}
                      className="inline-flex items-center gap-1 rounded-lg border border-white/15 bg-white/[0.05] px-3 py-1.5 text-xs font-semibold text-white/80 hover:bg-white/10 transition"
                    >
                      <Phone className="h-3.5 w-3.5" />
                      <span>Call</span>
                    </a>

                    {/* Status Select */}
                    <select
                      value={inq.status}
                      disabled={actionLoading === inq.id}
                      onChange={(e) =>
                        handleStatusChange(
                          inq.id,
                          e.target.value as "new" | "in_progress" | "completed" | "archived"
                        )
                      }
                      className="rounded-lg border border-white/10 bg-navy-950/80 px-2.5 py-1.5 text-xs text-white focus:border-gold-400 focus:outline-none"
                    >
                      <option value="new">Mark: New</option>
                      <option value="in_progress">Mark: In Progress</option>
                      <option value="completed">Mark: Completed</option>
                      <option value="archived">Mark: Archived</option>
                    </select>

                    {/* Delete */}
                    <button
                      onClick={() => handleDelete(inq.id, inq.name)}
                      disabled={actionLoading === inq.id}
                      className="rounded-lg p-1.5 text-white/40 hover:bg-red-500/10 hover:text-red-400 transition"
                      title="Delete Inquiry"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
