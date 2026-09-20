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
  ChevronDown,
  Download,
  ExternalLink,
  Mail,
  Calendar,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { SubscriberWithCategories, TaxCategory } from "@/types/reminders";

const PAGE_SIZE = 12;
type SubscriberTab = "all" | "active" | "pending" | "unsubscribed";

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export default function SubscribersManager() {
  const [allSubscribers, setAllSubscribers] = useState<SubscriberWithCategories[]>([]);
  const [categories, setCategories] = useState<TaxCategory[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [emailConfigured, setEmailConfigured] = useState<boolean | null>(null);

  // Filters
  const [activeTab, setActiveTab] = useState<SubscriberTab>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const [isLoading, setIsLoading] = useState(true);
  const [actionFeedback, setActionFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Load available categories
  useEffect(() => {
    async function fetchCats() {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("tax_categories")
          .select("*")
          .order("sort_order", { ascending: true });
        if (error || !data || data.length === 0) {
          setCategories([
            { id: "income-tax-individuals", name: "Income Tax - Individuals & Salaried", slug: "income-tax-individuals", description: "Annual FBR returns", is_active: true, sort_order: 1, created_at: "", updated_at: "" },
            { id: "business-corporate-tax", name: "Business & Corporate Tax", slug: "business-corporate-tax", description: "AOP, Sole Proprietor, Private Ltd", is_active: true, sort_order: 2, created_at: "", updated_at: "" },
            { id: "sales-tax-pra", name: "Sales Tax (Federal & PRA)", slug: "sales-tax-pra", description: "Monthly sales tax returns", is_active: true, sort_order: 3, created_at: "", updated_at: "" },
            { id: "withholding-tax", name: "Withholding Tax Statements", slug: "withholding-tax", description: "Periodic withholding statements", is_active: true, sort_order: 4, created_at: "", updated_at: "" },
            { id: "property-tax-stamp-duty", name: "Property & Capital Value Tax", slug: "property-tax-stamp-duty", description: "E-Stamp duty and transfer deadlines", is_active: true, sort_order: 5, created_at: "", updated_at: "" },
          ]);
          return;
        }
        setCategories(data);
      } catch {
        setCategories([
          { id: "income-tax-individuals", name: "Income Tax - Individuals & Salaried", slug: "income-tax-individuals", description: "Annual FBR returns", is_active: true, sort_order: 1, created_at: "", updated_at: "" },
          { id: "business-corporate-tax", name: "Business & Corporate Tax", slug: "business-corporate-tax", description: "AOP, Sole Proprietor, Private Ltd", is_active: true, sort_order: 2, created_at: "", updated_at: "" },
          { id: "sales-tax-pra", name: "Sales Tax (Federal & PRA)", slug: "sales-tax-pra", description: "Monthly sales tax returns", is_active: true, sort_order: 3, created_at: "", updated_at: "" },
          { id: "withholding-tax", name: "Withholding Tax Statements", slug: "withholding-tax", description: "Periodic withholding statements", is_active: true, sort_order: 4, created_at: "", updated_at: "" },
          { id: "property-tax-stamp-duty", name: "Property & Capital Value Tax", slug: "property-tax-stamp-duty", description: "E-Stamp duty and transfer deadlines", is_active: true, sort_order: 5, created_at: "", updated_at: "" },
        ]);
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

      if (typeof data.emailConfigured === "boolean") {
        setEmailConfigured(data.emailConfigured);
      }

      setAllSubscribers(data.subscribers || []);
    } catch (err) {
      console.error("[Subscribers Fetch Error]", err);
      setActionFeedback({ type: "error", message: getErrorMessage(err, "Failed to load subscribers.") });
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

  const statusTabs: Array<{ key: SubscriberTab; label: string; count: number }> = [
    { key: "all", label: "All subscribers", count: totalCount },
    { key: "active", label: "Active", count: activeCount },
    { key: "pending", label: "Pending", count: pendingCount },
    { key: "unsubscribed", label: "Unsubscribed", count: unsubscribedCount },
  ];

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

      setActionFeedback({ type: "success", message: `Subscriber ${email} marked as unsubscribed.` });
      fetchSubscribers();
    } catch (error) {
      setActionFeedback({ type: "error", message: getErrorMessage(error, "Failed to unsubscribe client.") });
    }
  };

  // CSV Export for office bookkeeping
  const handleExportCSV = () => {
    if (filteredSubscribers.length === 0) {
      setActionFeedback({ type: "error", message: "No subscriber records match the current filters." });
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
    URL.revokeObjectURL(url);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#eef7f2] border border-emerald-200/80 px-2.5 py-0.5 text-[11px] font-semibold text-[#075e38]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#075e38] animate-pulse" />
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
        <div
          role="status"
          className={`rounded-xl border p-3.5 text-xs flex items-center gap-2.5 shadow-2xs ${
            actionFeedback.type === "success"
              ? "border-emerald-200 bg-emerald-50/80 text-emerald-900"
              : "border-rose-200 bg-rose-50 text-rose-800"
          }`}
        >
          {actionFeedback.type === "success" ? (
            <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
          ) : (
            <Ban className="h-4 w-4 text-rose-600 shrink-0" />
          )}
          <span>{actionFeedback.message}</span>
        </div>
      )}

      {/* Email Service Warning when unconfigured */}
      {emailConfigured === false && (
        <div className="rounded-xl border border-amber-200 bg-amber-50/90 p-4 text-xs text-amber-900 shadow-2xs flex items-start gap-3">
          <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold text-amber-950">Email Delivery Setup Note</p>
            <p className="text-amber-800 leading-relaxed">
              Subscribers are being saved in the database, but <code className="bg-amber-100/80 px-1.5 py-0.5 rounded text-[11px] font-mono">RESEND_API_KEY</code> is not yet configured in environment variables. To send live confirmation emails to subscribers, add your <code className="bg-amber-100/80 px-1.5 py-0.5 rounded text-[11px] font-mono">RESEND_API_KEY</code> in Vercel Project Settings (or <code className="bg-amber-100/80 px-1.5 py-0.5 rounded text-[11px] font-mono">.env.local</code>).
            </p>
          </div>
        </div>
      )}

      {/* 4 Uniform Metric KPI Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Total Registered */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs transition hover:border-slate-300 hover:shadow-xs flex flex-col justify-between h-[132px]">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-semibold text-slate-600">Total Subscribers</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
              <Users className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight text-slate-900">
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin text-slate-400" /> : totalCount}
            </span>
            <span className="text-[11.5px] font-medium text-slate-500">Registered</span>
          </div>
          <p className="text-[12px] text-slate-500 truncate">
            Opted-in via public website forms
          </p>
        </div>

        {/* Card 2: Active Alerts */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs transition hover:border-slate-300 hover:shadow-xs flex flex-col justify-between h-[132px]">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-semibold text-slate-600">Active Recipients</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#eef7f2] text-[#075e38]">
              <UserCheck className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight text-slate-900">
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin text-emerald-600" /> : activeCount}
            </span>
            <span className="inline-flex items-center rounded-full bg-[#eef7f2] border border-emerald-200/60 px-2 py-0.5 text-[11px] font-semibold text-[#075e38]">
              {totalCount > 0 ? `${Math.round((activeCount / totalCount) * 100)}% active` : "0%"}
            </span>
          </div>
          <p className="text-[12px] text-slate-500 truncate">
            Receiving statutory reminder dispatches
          </p>
        </div>

        {/* Card 3: Pending Confirmation */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs transition hover:border-slate-300 hover:shadow-xs flex flex-col justify-between h-[132px]">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-semibold text-slate-600">Pending Verification</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-700">
              <Clock className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight text-slate-900">
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin text-amber-600" /> : pendingCount}
            </span>
            <span className="inline-flex items-center rounded-full bg-amber-50 border border-amber-200/60 px-2 py-0.5 text-[11px] font-semibold text-amber-800">
              Double opt-in
            </span>
          </div>
          <p className="text-[12px] text-slate-500 truncate">
            Awaiting verification link confirmation
          </p>
        </div>

        {/* Card 4: Tax Categories */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs transition hover:border-slate-300 hover:shadow-xs flex flex-col justify-between h-[132px]">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-semibold text-slate-600">Tax Categories</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
              <ShieldCheck className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight text-slate-900">
              {categories.length}
            </span>
            <span className="inline-flex items-center rounded-full bg-slate-100 border border-slate-200 px-2 py-0.5 text-[11px] font-medium text-slate-600">
              Active schedules
            </span>
          </div>
          <p className="text-[12px] text-slate-500 truncate">
            FBR, PRA, E-Stamping & Withholding
          </p>
        </div>
      </div>

      {/* Status Filter Tabs matching Dashboard & PostsManager */}
      <div className="border-b border-slate-200">
        <nav className="flex space-x-6 text-[14px]">
          {statusTabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => {
                  setActiveTab(tab.key);
                  setCurrentPage(1);
                }}
                className={`flex items-center gap-2 pb-3 pt-1 text-[13.5px] font-medium transition-colors border-b-2 -mb-px ${
                  isActive
                    ? "border-[#075e38] text-[#075e38] font-semibold"
                    : "border-transparent text-slate-600 hover:text-slate-900"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`rounded-md px-2 py-0.5 text-xs font-semibold ${
                    isActive
                      ? "bg-emerald-50 text-[#075e38]"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Search and Category Filter Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search by client name or email address..."
            className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-10 pr-4 text-[13.5px] text-slate-800 placeholder-slate-400 focus:border-[#075e38] focus:outline-none focus:ring-1 focus:ring-[#075e38] shadow-2xs"
          />
        </div>

        {/* Category Filter */}
        <div className="relative w-full sm:w-auto">
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setCurrentPage(1);
            }}
            aria-label="Filter by Category"
            className="w-full sm:w-auto appearance-none rounded-lg border border-slate-200 bg-white py-2 pl-3.5 pr-9 text-[13.5px] font-normal text-slate-700 focus:border-[#075e38] focus:outline-none shadow-2xs cursor-pointer"
          >
            <option value="all">All tax categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
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
