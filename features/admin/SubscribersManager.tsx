"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Users,
  Search,
  Filter,
  UserX,
  CheckCircle,
  Clock,
  Ban,
  ShieldAlert,
  Loader2,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Info,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { SubscriberWithCategories, TaxCategory } from "@/types/reminders";

const PAGE_SIZE = 15;

export default function SubscribersManager() {
  const [subscribers, setSubscribers] = useState<SubscriberWithCategories[]>([]);
  const [categories, setCategories] = useState<TaxCategory[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const [isLoading, setIsLoading] = useState(true);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  // Load available categories
  useEffect(() => {
    async function fetchCats() {
      const supabase = createClient();
      const { data } = await supabase
        .from("tax_categories")
        .select("*")
        .order("sort_order", { ascending: true });
      if (data) setCategories(data);
    }
    fetchCats();
  }, []);

  const fetchSubscribers = useCallback(async () => {
    setIsLoading(true);
    setActionFeedback(null);

    try {
      const res = await fetch("/api/admin/subscribers");
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to load subscribers");
      }

      let all: SubscriberWithCategories[] = data.subscribers || [];

      // Apply Status Filter
      if (statusFilter !== "all") {
        all = all.filter((s) => s.status === statusFilter);
      }

      // Apply Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        all = all.filter(
          (s) => s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q)
        );
      }

      // Apply Category Filter
      if (categoryFilter !== "all") {
        all = all.filter((s) => s.categories.some((c) => c.id === categoryFilter));
      }

      setTotalCount(all.length);

      const from = (currentPage - 1) * PAGE_SIZE;
      const to = from + PAGE_SIZE;
      setSubscribers(all.slice(from, to));
    } catch (err) {
      console.error("[Subscribers Fetch Error]", err);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, statusFilter, categoryFilter, searchQuery]);

  useEffect(() => {
    fetchSubscribers();
  }, [fetchSubscribers]);

  // Action: Unsubscribe client
  const handleUnsubscribeClient = async (subscriberId: string, email: string) => {
    const confirmAction = window.confirm(
      `Are you sure you want to unsubscribe ${email}? They will stop receiving reminder emails.`
    );
    if (!confirmAction) return;

    try {
      const res = await fetch("/api/admin/subscribers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "unsubscribe", id: subscriberId, email }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to unsubscribe");
      }

      setActionFeedback(`Subscriber ${email} marked as unsubscribed.`);
      fetchSubscribers();
    } catch (err: any) {
      alert(err.message || "Failed to unsubscribe client.");
    }
  };

  const totalPages = Math.ceil(totalCount / PAGE_SIZE) || 1;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-emerald-300">
            <CheckCircle className="h-3 w-3" /> Active
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-amber-300">
            <Clock className="h-3 w-3" /> Pending
          </span>
        );
      case "unsubscribed":
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-slate-500/30 bg-slate-500/10 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            <UserX className="h-3 w-3" /> Unsubscribed
          </span>
        );
      case "suppressed":
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-red-500/30 bg-red-500/10 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-red-400">
            <Ban className="h-3 w-3" /> Suppressed
          </span>
        );
      default:
        return <span>{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-serif text-white tracking-tight sm:text-3xl">
            Subscribers Management
          </h1>
          <p className="mt-1 text-xs text-white/60">
            View consent records, manage subscriber statuses, and monitor compliance.
          </p>
        </div>

        <button
          onClick={fetchSubscribers}
          disabled={isLoading}
          className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/[0.05] px-3.5 py-2 text-xs font-semibold text-white hover:bg-white/10 transition"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
          Refresh List
        </button>
      </div>

      {/* Compliance Notice Banner */}
      <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-4 text-xs text-amber-200 flex items-start gap-3">
        <Info className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong>Legal Compliance & Consent Protection:</strong> Unsubscribed or suppressed clients cannot be manually reactivated by administrators. Reactivation strictly requires the client to re-subscribe on the public website and confirm via their inbox link.
        </div>
      </div>

      {/* Action feedback */}
      {actionFeedback && (
        <div className="rounded-lg border border-emerald-500/40 bg-emerald-950/40 p-3 text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />
          {actionFeedback}
        </div>
      )}

      {/* Filters & Search Toolbar */}
      <div className="grid gap-3 sm:grid-cols-12 rounded-xl border border-white/10 bg-navy-900/60 p-4 backdrop-blur-sm">
        {/* Search */}
        <div className="sm:col-span-6 relative">
          <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-white/40">
            <Search className="h-4 w-4" />
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search by client name or email..."
            className="w-full rounded-lg border border-white/15 bg-white/[0.06] py-2 pl-9 pr-3 text-xs text-white placeholder-white/40 focus:border-gold-400 focus:outline-none"
          />
        </div>

        {/* Status Filter */}
        <div className="sm:col-span-3">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            aria-label="Filter by Status"
            className="w-full rounded-lg border border-white/15 bg-navy-950 py-2 px-3 text-xs text-white focus:border-gold-400 focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active (Confirmed)</option>
            <option value="pending">Pending Confirmation</option>
            <option value="unsubscribed">Unsubscribed</option>
            <option value="suppressed">Suppressed (Bounces)</option>
          </select>
        </div>

        {/* Category Filter */}
        <div className="sm:col-span-3">
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setCurrentPage(1);
            }}
            aria-label="Filter by Tax Category"
            className="w-full rounded-lg border border-white/15 bg-navy-950 py-2 px-3 text-xs text-white focus:border-gold-400 focus:outline-none"
          >
            <option value="all">All Tax Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-white/10 bg-navy-900/60 backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-white">
            <thead className="border-b border-white/10 bg-white/[0.03] text-[11px] font-bold uppercase tracking-wider text-white/60">
              <tr>
                <th className="py-3.5 px-4">Client Name & Email</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Subscribed Categories</th>
                <th className="py-3.5 px-4">Consent Timestamp</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-white/50">
                    <Loader2 className="mx-auto h-5 w-5 animate-spin text-gold-400 mb-2" />
                    Loading subscriber records...
                  </td>
                </tr>
              ) : subscribers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-white/50">
                    No subscribers found matching your search or filters.
                  </td>
                </tr>
              ) : (
                subscribers.map((sub) => (
                  <tr key={sub.id} className="hover:bg-white/[0.02] transition">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-white text-sm">{sub.name}</div>
                      <div className="text-white/60 text-[11px] font-mono mt-0.5">{sub.email}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      {getStatusBadge(sub.status)}
                    </td>
                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="flex flex-wrap gap-1">
                        {sub.categories.length > 0 ? (
                          sub.categories.map((c) => (
                            <span
                              key={c.id}
                              className="rounded bg-white/10 px-2 py-0.5 text-[10px] text-white/80"
                            >
                              {c.name}
                            </span>
                          ))
                        ) : (
                          <span className="text-[11px] text-white/40">No categories</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-white/60 text-[11px]">
                      <div>{new Date(sub.consent_at).toLocaleString()}</div>
                      <div className="text-[10px] text-white/40 mt-0.5">
                        Version: {sub.consent_text_version}
                        {sub.confirmed_at && " • Confirmed"}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {sub.status === "active" ? (
                        <button
                          onClick={() => handleUnsubscribeClient(sub.id, sub.email)}
                          className="rounded border border-red-500/30 bg-red-500/10 px-2.5 py-1 text-[11px] font-semibold text-red-300 hover:bg-red-500/20 transition"
                          title="Unsubscribe this subscriber"
                        >
                          Unsubscribe
                        </button>
                      ) : sub.status === "pending" ? (
                        <span className="text-[11px] text-amber-400/80 italic">Awaiting client click</span>
                      ) : (
                        <span className="text-[11px] text-white/40 italic">Inactive</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex items-center justify-between border-t border-white/10 px-4 py-3 text-xs text-white/60">
          <div>
            Showing <strong className="text-white">{subscribers.length}</strong> of{" "}
            <strong className="text-white">{totalCount}</strong> records
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1 || isLoading}
              className="flex items-center gap-1 rounded border border-white/15 px-2.5 py-1 text-white hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-3.5 w-3.5" /> Prev
            </button>
            <span className="px-2">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages || isLoading}
              className="flex items-center gap-1 rounded border border-white/15 px-2.5 py-1 text-white hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
