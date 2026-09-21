"use client";

import React, { useEffect, useState } from "react";
import {
  MessageSquareText,
  Search,
  Filter,
  Phone,
  MessageCircle,
  Clock,
  Trash2,
  Loader2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { ConsultationInquiry } from "@/types/cms";

type InquiryStatus = ConsultationInquiry["status"];

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export default function InquiriesManager() {
  const [inquiries, setInquiries] = useState<ConsultationInquiry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | InquiryStatus>("all");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const loadInquiries = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/inquiries");
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.inquiries) {
          setInquiries(json.inquiries);
          setIsLoading(false);
          return;
        }
      }
      const supabase = createClient();
      const { data, error } = await supabase
        .from("consultation_inquiries")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setInquiries(data || []);
    } catch (error) {
      console.warn("[Inquiries Load]", error);
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
    newStatus: InquiryStatus
  ) => {
    setActionLoading(id);

    try {
      const res = await fetch("/api/admin/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });

      if (res.ok) {
        setInquiries((prev) =>
          prev.map((inq) => (inq.id === id ? { ...inq, status: newStatus } : inq))
        );
        setMessage({ type: "success", text: `Status updated to ${newStatus}.` });
        setActionLoading(null);
        return;
      }

      const supabase = createClient();
      const { error } = await supabase
        .from("consultation_inquiries")
        .update({ status: newStatus })
        .eq("id", id);

      if (error) throw error;

      setInquiries((prev) =>
        prev.map((inq) => (inq.id === id ? { ...inq, status: newStatus } : inq))
      );
      setMessage({ type: "success", text: `Status updated to ${newStatus}.` });
    } catch (error) {
      setMessage({ type: "error", text: getErrorMessage(error, "Failed to update status.") });
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete inquiry from ${name}?`)) return;

    setActionLoading(id);
    try {
      const res = await fetch("/api/admin/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action: "delete" }),
      });

      if (res.ok) {
        setInquiries((prev) => prev.filter((i) => i.id !== id));
        setMessage({ type: "success", text: "Inquiry removed from inbox." });
        setActionLoading(null);
        return;
      }

      const supabase = createClient();
      const { error } = await supabase
        .from("consultation_inquiries")
        .delete()
        .eq("id", id);

      if (error) throw error;
      setInquiries((prev) => prev.filter((i) => i.id !== id));
      setMessage({ type: "success", text: "Inquiry removed from inbox." });
    } catch (error) {
      setMessage({ type: "error", text: getErrorMessage(error, "Failed to delete inquiry.") });
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
      {/* Top Breadcrumb */}
      <div className="text-xs text-[#64748B] font-medium flex items-center gap-1.5">
        <span>Website</span>
        <span className="text-[#94A3B8]">/</span>
        <span className="text-[#0B1F36] font-semibold">Client Inquiries</span>
      </div>

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0B1F36]">
            Consultation Requests Inbox
          </h1>
          <p className="text-xs text-[#52627A] mt-0.5 leading-relaxed">
            Real-time client leads submitted from website contact forms. Reply directly via WhatsApp or phone.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="rounded-xl border border-[#E2E8F0] bg-white px-3.5 py-1.5 text-xs text-[#52627A] shadow-2xs">
            <span>Total Leads: </span>
            <strong className="text-[#0B1F36] font-bold">{inquiries.length}</strong>
            <span className="mx-2 text-[#CBD5E1]">•</span>
            <span>New: </span>
            <strong className="text-[#B8832A] font-bold">
              {inquiries.filter((i) => i.status === "new").length}
            </strong>
          </div>
        </div>
      </div>

      {/* Alert / Notification */}
      {message && (
        <div
          className={`flex items-center justify-between rounded-xl p-3.5 text-xs font-medium border shadow-2xs ${
            message.type === "success"
              ? "bg-[#FDF8EE] text-[#96641E] border-[#C8973D]/40"
              : "bg-rose-50 text-rose-800 border-rose-200"
          }`}
        >
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)} className="text-[#64748B] hover:text-[#0B1F36] ml-2 font-medium">
            Dismiss
          </button>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94A3B8]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search leads by client name, phone number, service, or message..."
            className="w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] py-2 pl-10 pr-4 text-xs text-[#0B1F36] placeholder:text-[#94A3B8] focus:border-[#C8973D] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C8973D]/20 shadow-2xs transition"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-[#94A3B8] shrink-0" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as "all" | InquiryStatus)}
            className="rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2 text-xs font-medium text-[#0B1F36] focus:border-[#C8973D] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C8973D]/20 shadow-2xs transition"
          >
            <option value="all">All Statuses</option>
            <option value="new">New</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      {/* Leads List */}
      <div className="rounded-xl border border-[#E2E8F0] bg-white overflow-hidden shadow-2xs">
        {isLoading ? (
          <div className="py-16 text-center text-xs text-[#64748B]">
            <Loader2 className="h-6 w-6 animate-spin mx-auto text-[#C8973D] mb-2" />
            Loading inquiries...
          </div>
        ) : filteredInquiries.length === 0 ? (
          <div className="py-16 text-center text-xs text-[#64748B]">
            <MessageSquareText className="mx-auto h-8 w-8 text-[#CBD5E1] mb-2" />
            <p className="font-semibold text-[#0B1F36] text-sm">No consultation inquiries found.</p>
            <p className="text-[#64748B] mt-1 max-w-sm mx-auto">
              When clients fill out the contact form on your website requesting tax filing or e-stamping assistance, their inquiries appear here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#E2E8F0] text-xs">
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
                  className="p-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 hover:bg-[#F8FAFC] transition"
                >
                  {/* Left Column: Client info and message */}
                  <div className="space-y-2 max-w-2xl">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-sm text-[#0B1F36]">{inq.name}</span>
                      <span className="rounded-md bg-[#F1F5F9] border border-[#E2E8F0] px-2 py-0.5 text-[11px] font-medium text-[#334155]">
                        {inq.service_needed || "Tax Consultation"}
                      </span>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10.5px] font-bold uppercase tracking-wide ${
                          inq.status === "new"
                            ? "bg-[#FDF8EE] text-[#96641E] border border-[#C8973D]/40"
                            : inq.status === "in_progress"
                            ? "bg-sky-50 text-sky-800 border border-sky-200"
                            : inq.status === "completed"
                            ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                            : "bg-slate-100 text-[#64748B] border border-[#E2E8F0]"
                        }`}
                      >
                        {inq.status}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-[#64748B] text-[11.5px]">
                      <span className="flex items-center gap-1 text-[#0B1F36] font-mono">
                        <Phone className="h-3 w-3 text-[#94A3B8]" />
                        {inq.phone}
                      </span>
                      {inq.email && (
                        <span>Email: {inq.email}</span>
                      )}
                      <span className="flex items-center gap-1 text-[#64748B]">
                        <Clock className="h-3 w-3 text-[#94A3B8]" />
                        {new Date(inq.created_at).toLocaleString("en-PK", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </span>
                    </div>

                    {inq.message && (
                      <p className="rounded-lg bg-[#F8FAFC] p-3 border border-[#E2E8F0] text-[#334155] text-xs leading-relaxed italic">
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
                      className="inline-flex items-center gap-1.5 rounded-lg bg-[#128C7E] hover:bg-[#075E54] px-3 py-1.5 text-xs font-semibold text-white transition shadow-xs"
                    >
                      <MessageCircle className="h-3.5 w-3.5" />
                      <span>WhatsApp Reply</span>
                    </a>

                    {/* Phone Call Button */}
                    <a
                      href={`tel:${inq.phone}`}
                      className="inline-flex items-center gap-1 rounded-lg border border-[#E2E8F0] bg-white px-3 py-1.5 text-xs font-semibold text-[#0B1F36] hover:bg-[#F8FAFC] shadow-2xs transition"
                    >
                      <Phone className="h-3.5 w-3.5 text-[#64748B]" />
                      <span>Call</span>
                    </a>

                    {/* Status Select */}
                    <select
                      value={inq.status}
                      disabled={actionLoading === inq.id}
                      onChange={(e) =>
                        handleStatusChange(
                          inq.id,
                          e.target.value as InquiryStatus
                        )
                      }
                      className="rounded-lg border border-[#E2E8F0] bg-white px-2.5 py-1.5 text-xs font-medium text-[#0B1F36] focus:border-[#C8973D] focus:outline-none focus:ring-2 focus:ring-[#C8973D]/20 shadow-2xs transition"
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
                      className="rounded-lg p-1.5 text-[#94A3B8] hover:bg-rose-50 hover:text-rose-600 transition"
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
