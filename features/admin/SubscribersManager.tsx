"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  Users,
  UserCheck,
  Clock,
  UserX,
  Search,
  Filter,
  CheckCircle,
  Ban,
  ShieldCheck,
  Loader2,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Download,
  ExternalLink,
  Mail,
  Calendar,
  Sparkles,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { SubscriberWithCategories, TaxCategory } from "@/types/reminders";

const PAGE_SIZE = 12;

export default function SubscribersManager() {
  const [allSubscribers, setAllSubscribers] = useState<SubscriberWithCategories[]>([]);
  const [categories, setCategories] = useState<TaxCategory[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  // Filters
  const [activeTab, setActiveTab] = useState<"all" | "active" | "pending" | "unsubscribed">("all");
  const [searchQuery, setSearchQuery] = useState("");
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
      if (data && data.length > 0) {
        setCategories(data);
      }
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

      setAllSubscribers(data.subscribers || []);
    } catch (err) {
      console.error("[Subscribers Fetch Error]", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubscribers();
  }, [fetchSubscribers]);

  // Derived KPI Stats
  const totalCount = allSubscribers.length;
  const activeCount = useMemo(
    () => allSubscribers.filter((s) => s.status === "active").length,
    [allSubscribers]
  );
  const pendingCount = useMemo(
    () => allSubscribers.filter((s) => s.status === "pending").length,
    [allSubscribers]
  );
  const unsubscribedCount = useMemo(
    () => allSubscribers.filter((s) => s.status === "unsubscribed").length,
    [allSubscribers]
  );

  // Filtered subscribers
  const filteredSubscribers = useMemo(() => {
    return allSubscribers.filter((sub) => {
      if (activeTab !== "all" && sub.status !== activeTab) {
        return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const matchName = sub.name?.toLowerCase().includes(q);
        const matchEmail = sub.email?.toLowerCase().includes(q);
        if (!matchName && !matchEmail) return false;
      }

      if (categoryFilter !== "all") {
        const hasCategory = sub.categories?.some((c) => c.id === categoryFilter);
        if (!hasCategory) return false;
      }

      return true;
    });
  }, [allSubscribers, activeTab, searchQuery, categoryFilter]);

  const totalPages = Math.ceil(filteredSubscribers.length / PAGE_SIZE) || 1;
  const paginatedSubscribers = useMemo(() => {
    const from = (currentPage - 1) * PAGE_SIZE;
    return filteredSubscribers.slice(from, from + PAGE_SIZE);
  }, [filteredSubscribers, currentPage]);

  // Action: Unsubscribe client
  const handleUnsubscribeClient = async (subscriberId: string, email: string) => {
    const confirmAction = window.confirm(
      `Are you sure you want to unsubscribe ${email}? They will stop receiving automated statutory reminder emails.`
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

  // CSV Export for office bookkeeping
  const handleExportCSV = () => {
    if (filteredSubscribers.length === 0) {
      alert("No records to export.");
      return;
    }

    const headers = ["ID", "Name", "Email", "Status", "Categories", "Consent Date", "Version"];
    const rows = filteredSubscribers.map((s) => [
      s.id,
      `"${s.name.replace(/"/g, '""')}"`,
      `"${s.email}"`,
      s.status,
      `"${(s.categories || []).map((c) => c.name).join("; ")}"`,
      `"${new Date(s.consent_at).toLocaleString()}"`,
      s.consent_text_version || "v1.0",
    ]);

    const csvContent = [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `subscribers_ch_law_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-800">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse" />
            Active
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200/80 px-2.5 py-0.5 text-[11px] font-semibold text-amber-800">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            Pending
          </span>
        );
      case "unsubscribed":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 border border-slate-200 px-2.5 py-0.5 text-[11px] font-semibold text-slate-600">
            <UserX className="h-3 w-3 text-slate-400" />
            Unsubscribed
          </span>
        );
      case "suppressed":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 border border-rose-200 px-2.5 py-0.5 text-[11px] font-semibold text-rose-700">
            <Ban className="h-3 w-3 text-rose-500" />
            Suppressed
          </span>
        );
      default:
        return <span className="capitalize text-slate-700">{status}</span>;
    }
  };

  const getInitials = (name: string) => {
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return (name.slice(0, 2) || "CL").toUpperCase();
  };

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb */}
      <div className="text-[13px] text-slate-500 font-normal">
        <span>Reminders</span>
        <span className="mx-2 text-slate-400">/</span>
        <span className="text-slate-800 font-medium">Subscribers</span>
      </div>

      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-[32px] font-bold tracking-tight text-slate-900 leading-tight">
            Subscribers Management
          </h1>
          <p className="text-[14.5px] text-slate-500 mt-1">
            View registered clients, monitor statutory consent records, and manage tax reminder categories.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchSubscribers}
            disabled={isLoading}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-[13.5px] font-medium text-slate-700 shadow-2xs hover:bg-slate-50 hover:text-slate-900 transition"
          >
            <RefreshCw className={`h-4 w-4 text-slate-500 ${isLoading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-[13.5px] font-medium text-slate-700 shadow-2xs hover:bg-slate-50 hover:text-slate-900 transition"
          >
            <Download className="h-4 w-4 text-slate-500" />
            <span>Export CSV</span>
          </button>

          <Link
            href="/#tax-reminders"
            target="_blank"
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#075e38] hover:bg-[#064e2e] px-4 py-2 text-[13.5px] font-medium text-white shadow-2xs transition"
          >
            <ExternalLink className="h-4 w-4" />
            <span>View alert form</span>
          </Link>
        </div>
      </div>

      {/* Action feedback toast */}
      {actionFeedback && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 p-3.5 text-xs text-emerald-900 flex items-center gap-2.5 shadow-2xs">
          <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{actionFeedback}</span>
        </div>
      )}

      {/* 4 Metric KPI Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Registered */}
        <div className="rounded-xl border border-slate-200 bg-white p-4.5 shadow-xs transition hover:border-slate-300">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Total Registered Clients</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight text-slate-900">
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin text-slate-400" /> : totalCount}
            </span>
            <span className="text-xs font-medium text-slate-500">Email Alerts</span>
          </div>
          <p className="mt-1 text-[11.5px] text-slate-400">
            Clients registered on the official website.
          </p>
        </div>

        {/* Active Alerts */}
        <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/40 p-4.5 shadow-xs transition hover:border-emerald-300">
          <div className="flex items-center justify-between text-xs font-semibold text-emerald-900">
            <span>Active & Receiving Alerts</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
              <UserCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight text-emerald-950">
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin text-emerald-600" /> : activeCount}
            </span>
            <span className="text-xs font-bold text-emerald-700">
              {totalCount > 0 ? `${Math.round((activeCount / totalCount) * 100)}% active` : "100%"}
            </span>
          </div>
          <div className="mt-2.5 h-1.5 w-full rounded-full bg-emerald-200/70 overflow-hidden">
            <div
              className="h-full bg-[#075e38] rounded-full transition-all duration-500"
              style={{ width: `${totalCount > 0 ? (activeCount / totalCount) * 100 : 100}%` }}
            />
          </div>
        </div>

        {/* Pending Confirmation */}
        <div className="rounded-xl border border-amber-200/80 bg-amber-50/40 p-4.5 shadow-xs transition hover:border-amber-300">
          <div className="flex items-center justify-between text-xs font-semibold text-amber-900">
            <span>Pending Confirmation</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight text-amber-950">
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin text-amber-600" /> : pendingCount}
            </span>
            <span className="text-xs font-medium text-amber-800">Awaiting Click</span>
          </div>
          <p className="mt-1 text-[11.5px] text-amber-700/80">
            Double opt-in verification links sent.
          </p>
        </div>

        {/* Monitored Categories */}
        <div className="rounded-xl border border-slate-200 bg-white p-4.5 shadow-xs transition hover:border-slate-300">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Tax Categories</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              <ShieldCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight text-slate-900">
              {categories.length || 5}
            </span>
            <span className="text-xs font-medium text-slate-500">Active Schedules</span>
          </div>
          <p className="mt-1 text-[11.5px] text-slate-400">
            FBR, PRA, E-Stamping, and Withholding.
          </p>
        </div>
      </div>

      {/* Tabs & Search Toolbar */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs space-y-4">
        {/* Status Tabs matching Office CMS Posts pattern */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 pb-3">
          <div className="flex items-center gap-1">
            {[
              { key: "all", label: "All Subscribers", count: totalCount },
              { key: "active", label: "Active", count: activeCount },
              { key: "pending", label: "Pending", count: pendingCount },
              { key: "unsubscribed", label: "Unsubscribed", count: unsubscribedCount },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => {
                  setActiveTab(tab.key as any);
                  setCurrentPage(1);
                }}
                className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                  activeTab === tab.key
                    ? "bg-[#075e38] text-white shadow-2xs"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[10.5px] ${
                    activeTab === tab.key
                      ? "bg-white/20 text-white"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          <span className="text-xs text-slate-400 font-normal">
            Showing {filteredSubscribers.length} filtered results
          </span>
        </div>

        {/* Search and Category Filter Toolbar */}
        <div className="grid gap-3 sm:grid-cols-12">
          {/* Search */}
          <div className="sm:col-span-8 relative">
            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
              <Search className="h-4 w-4" />
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by client name or email address..."
              className="w-full rounded-lg border border-slate-200 bg-slate-50/50 py-2 pl-9.5 pr-4 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:border-slate-400 focus:outline-none transition"
            />
          </div>

          {/* Category Filter */}
          <div className="sm:col-span-4">
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setCurrentPage(1);
              }}
              aria-label="Filter by Category"
              className="w-full rounded-lg border border-slate-200 bg-white py-2 px-3 text-xs text-slate-700 focus:border-slate-400 focus:outline-none"
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
      </div>

      {/* Main Table Card */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="border-b border-slate-200 bg-slate-50/80 text-[11.5px] font-semibold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="py-3.5 px-4 font-semibold">Client Name & Email</th>
                <th className="py-3.5 px-4 font-semibold">Status</th>
                <th className="py-3.5 px-4 font-semibold">Subscribed Tax Categories</th>
                <th className="py-3.5 px-4 font-semibold">Consent Record</th>
                <th className="py-3.5 px-4 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center text-slate-500">
                    <Loader2 className="mx-auto h-6 w-6 animate-spin text-[#075e38] mb-2" />
                    <span className="text-xs font-medium">Loading database subscribers...</span>
                  </td>
                </tr>
              ) : paginatedSubscribers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center text-slate-500">
                    <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-400 mb-2">
                      <Users className="h-5 w-5" />
                    </div>
                    <p className="font-semibold text-slate-800 text-sm">No subscribers found</p>
                    <p className="mt-1 text-xs text-slate-400">
                      Try changing your search terms or filter selections.
                    </p>
                  </td>
                </tr>
              ) : (
                paginatedSubscribers.map((sub) => {
                  const initials = getInitials(sub.name);
                  const consentDate = new Date(sub.consent_at).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  });
                  const consentTime = new Date(sub.consent_at).toLocaleTimeString("en-US", {
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true,
                  });

                  return (
                    <tr key={sub.id} className="hover:bg-slate-50/75 transition">
                      {/* Name & Email with Avatar */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700">
                            {initials}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900 text-sm">{sub.name}</div>
                            <div className="text-slate-500 text-xs font-mono flex items-center gap-1.5 mt-0.5">
                              <Mail className="h-3 w-3 text-slate-400" />
                              <span>{sub.email}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Status Badge */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {getStatusBadge(sub.status)}
                      </td>

                      {/* Categories Tags */}
                      <td className="py-3.5 px-4 max-w-sm">
                        <div className="flex flex-wrap gap-1.5">
                          {sub.categories && sub.categories.length > 0 ? (
                            sub.categories.map((c) => (
                              <span
                                key={c.id}
                                className="inline-flex items-center rounded-md bg-slate-100 border border-slate-200/80 px-2 py-0.5 text-[11px] font-medium text-slate-700"
                              >
                                {c.name}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-slate-400 italic">General Statutory Alerts</span>
                          )}
                        </div>
                      </td>

                      {/* Consent Details */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="text-xs font-medium text-slate-800">{consentDate}</div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                          <span>{consentTime}</span>
                          <span>•</span>
                          <span className="font-mono text-[10px] uppercase">{sub.consent_text_version || "v1.0"}</span>
                        </div>
                      </td>

                      {/* Action Button */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        {sub.status === "active" ? (
                          <button
                            onClick={() => handleUnsubscribeClient(sub.id, sub.email)}
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-red-50 hover:border-red-200 hover:text-red-700 transition shadow-2xs"
                            title="Unsubscribe client from automated emails"
                          >
                            Unsubscribe
                          </button>
                        ) : sub.status === "pending" ? (
                          <span className="text-[11.5px] font-medium text-amber-700 bg-amber-50 border border-amber-200/60 rounded px-2 py-0.5">
                            Awaiting Click
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400 italic">Inactive</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50/50 px-4 py-3 text-xs text-slate-600">
          <div>
            Showing <strong className="text-slate-900">{paginatedSubscribers.length}</strong> of{" "}
            <strong className="text-slate-900">{filteredSubscribers.length}</strong> total records
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1 || isLoading}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 shadow-2xs hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <ChevronLeft className="h-3.5 w-3.5" /> Prev
            </button>
            <span className="px-2 text-slate-700 font-medium">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages || isLoading}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 shadow-2xs hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              Next <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
