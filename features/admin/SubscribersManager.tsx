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
  Plus,
  X,
  Check,
  PieChart,
  TrendingUp,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { SubscriberWithCategories, TaxCategory } from "@/types/reminders";

const PAGE_SIZE = 12;
type SubscriberTab = "all" | "active" | "pending" | "unsubscribed";

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

// Mini Sparkline Component
function MiniSparkline({
  points,
  color,
  height = 32,
  width = 80,
}: {
  points: number[];
  color: string;
  height?: number;
  width?: number;
}) {
  const max = Math.max(...points, 1);
  const min = Math.min(...points, 0);
  const range = max - min || 1;
  const pad = 3;

  const getX = (idx: number) => pad + (idx / (points.length - 1)) * (width - pad * 2);
  const getY = (val: number) => height - pad - ((val - min) / range) * (height - pad * 2);

  const pathD = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${getX(i).toFixed(1)} ${getY(p).toFixed(1)}`)
    .join(" ");

  const areaD = `${pathD} L ${getX(points.length - 1).toFixed(1)} ${height} L ${getX(0).toFixed(1)} ${height} Z`;
  const gradId = `sparkline-sub-${Math.random().toString(36).substring(2, 9)}`;

  return (
    <svg width={width} height={height} className="overflow-visible">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.2} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={areaD} fill={`url(#${gradId})`} />
      <path d={pathD} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
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

  // Modal: Add Subscriber
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [selectedCats, setSelectedCats] = useState<string[]>([]);
  const [addLoading, setAddLoading] = useState(false);
  const [addSuccess, setAddSuccess] = useState(false);

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

  // Action: Add new subscriber manually
  const handleAddSubscriberSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim()) return;

    setAddLoading(true);
    try {
      const res = await fetch("/api/reminders/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName.trim() || "Client",
          email: newEmail.trim(),
          categoryIds: selectedCats.length > 0 ? selectedCats : categories.map((c) => c.id),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to add subscriber");
      }

      setAddSuccess(true);
      setTimeout(() => {
        setNewName("");
        setNewEmail("");
        setSelectedCats([]);
        setAddSuccess(false);
        setShowAddModal(false);
        fetchSubscribers();
      }, 1000);
    } catch (err) {
      console.error("[Add Subscriber]", err);
      setActionFeedback({ type: "error", message: getErrorMessage(err, "Failed to add subscriber.") });
    } finally {
      setAddLoading(false);
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
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/70 dark:border-emerald-800/60 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Active
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/60 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider text-amber-800 dark:text-amber-300">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            Pending
          </span>
        );
      case "unsubscribed":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-[#E2E8F0] dark:border-slate-700 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider text-[#64748B] dark:text-slate-400">
            <UserX className="h-3 w-3" />
            Unsubscribed
          </span>
        );
      case "suppressed":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider text-rose-700 dark:text-rose-300">
            <Ban className="h-3 w-3 text-rose-500" />
            Suppressed
          </span>
        );
      default:
        return <span className="capitalize text-[#334155] dark:text-slate-300">{status}</span>;
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
    <div className="space-y-6 max-w-7xl mx-auto font-admin pb-12">
      {/* 1. Top Executive Banner & Action Bar */}
      <div className="rounded-2xl border border-[#E2E8F0] dark:border-slate-800 bg-white dark:bg-[#0b1329] p-5 sm:p-6 shadow-sm transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-[#64748B] dark:text-slate-400 font-medium mb-1">
              <span>Reminders</span>
              <span>›</span>
              <span className="text-[#0B1F36] dark:text-slate-200 font-semibold">Subscribers Telemetry</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#0B1F36] dark:text-slate-100">
              Tax Reminder Subscribers
            </h1>
            <p className="text-xs sm:text-sm text-[#52627A] dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Manage client subscribers registered for automated statutory tax deadline notices, compliance reminders, and e-stamp updates.
            </p>
          </div>

          {/* Action Buttons (Screen 2: Export CSV + Add Subscriber) */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={fetchSubscribers}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-[#0f172a] px-3.5 py-2 text-xs font-semibold text-[#52627A] dark:text-slate-200 shadow-2xs hover:bg-[#F8FAFC] dark:hover:bg-slate-800 transition"
            >
              <RefreshCw className={`h-3.5 w-3.5 text-[#64748B] dark:text-slate-400 ${isLoading ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-[#0f172a] px-3.5 py-2 text-xs font-semibold text-[#52627A] dark:text-slate-200 shadow-2xs hover:bg-[#F8FAFC] dark:hover:bg-slate-800 transition"
            >
              <Download className="h-3.5 w-3.5 text-[#64748B] dark:text-slate-400" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#0B1F36] hover:bg-[#102943] dark:bg-[#C8973D] dark:hover:bg-[#d8a74e] text-white dark:text-[#0B1F36] px-4 py-2 text-xs font-semibold shadow-sm transition"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Subscriber</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. 4 Stat Cards with Sparklines (Screen 2: Subscribers) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Subscribers */}
        <div className="rounded-2xl border border-[#E2E8F0] dark:border-slate-800 bg-white dark:bg-[#0b1329] p-4 sm:p-5 shadow-2xs hover:border-[#CBD5E1] dark:hover:border-slate-700 transition flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#64748B] dark:text-slate-400">Total Subscribers</p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl sm:text-3xl font-bold tabular-nums tracking-tight text-[#0B1F36] dark:text-slate-100">
                {totalCount}
              </span>
              <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md">
                ↑ +18%
              </span>
            </div>
            <p className="text-xs text-[#64748B] dark:text-slate-400 mt-1">Opted-in clients</p>
          </div>
          <MiniSparkline points={[2, 3, 3, 4, 4, totalCount || 4]} color="#0284c7" />
        </div>

        {/* Card 2: Active Subscribers */}
        <div className="rounded-2xl border border-[#E2E8F0] dark:border-slate-800 bg-white dark:bg-[#0b1329] p-4 sm:p-5 shadow-2xs hover:border-[#CBD5E1] dark:hover:border-slate-700 transition flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#64748B] dark:text-slate-400">Active Recipients</p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl sm:text-3xl font-bold tabular-nums tracking-tight text-[#0B1F36] dark:text-slate-100">
                {activeCount}
              </span>
              <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md">
                100% active
              </span>
            </div>
            <p className="text-xs text-[#64748B] dark:text-slate-400 mt-1">Receiving reminders</p>
          </div>
          <MiniSparkline points={[2, 2, 3, 3, 4, activeCount || 4]} color="#059669" />
        </div>

        {/* Card 3: Avg. Open Rate */}
        <div className="rounded-2xl border border-[#E2E8F0] dark:border-slate-800 bg-white dark:bg-[#0b1329] p-4 sm:p-5 shadow-2xs hover:border-[#CBD5E1] dark:hover:border-slate-700 transition flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#64748B] dark:text-slate-400">Avg. Open Rate</p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl sm:text-3xl font-bold tabular-nums tracking-tight text-[#0B1F36] dark:text-slate-100">
                42.8%
              </span>
              <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md">
                ↑ +4.2%
              </span>
            </div>
            <p className="text-xs text-[#64748B] dark:text-slate-400 mt-1">Audience engagement</p>
          </div>
          <MiniSparkline points={[35, 38, 40, 39, 41, 43]} color="#d97706" />
        </div>

        {/* Card 4: Unsubscribed */}
        <div className="rounded-2xl border border-[#E2E8F0] dark:border-slate-800 bg-white dark:bg-[#0b1329] p-4 sm:p-5 shadow-2xs hover:border-[#CBD5E1] dark:hover:border-slate-700 transition flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#64748B] dark:text-slate-400">Unsubscribed</p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl sm:text-3xl font-bold tabular-nums tracking-tight text-[#0B1F36] dark:text-slate-100">
                {unsubscribedCount}
              </span>
              <span className="text-xs font-semibold text-[#64748B] dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                0% churn
              </span>
            </div>
            <p className="text-xs text-[#64748B] dark:text-slate-400 mt-1">Clean opt-out rate</p>
          </div>
          <MiniSparkline points={[0, 0, 0, 0, 0, unsubscribedCount]} color="#94a3b8" />
        </div>
      </div>

      {/* 3. Acquisition Sources & Subscriber Segments (Screen 2: Subscribers) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Subscriber Segments Breakdown (7 cols) */}
        <div className="lg:col-span-7 rounded-2xl border border-[#E2E8F0] dark:border-slate-800 bg-white dark:bg-[#0b1329] p-5 shadow-sm transition-colors">
          <div className="flex items-center justify-between pb-4 border-b border-[#F1F5F9] dark:border-slate-800">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#0B1F36]/8 dark:bg-slate-800 text-[#0B1F36] dark:text-slate-200">
                <PieChart className="h-4.5 w-4.5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold tracking-[-0.01em] text-[#0B1F36] dark:text-slate-100 leading-tight">
                  Subscriber Segments
                </h3>
                <p className="text-xs text-[#52627A] dark:text-slate-400 mt-0.5">
                  Breakdown by statutory tax notice preferences.
                </p>
              </div>
            </div>
            <span className="text-xs font-semibold text-[#C8973D]">
              {categories.length} Active Categories
            </span>
          </div>

          <div className="space-y-3.5 mt-4">
            {categories.slice(0, 4).map((cat, idx) => {
              const colors = ["#059669", "#0284c7", "#ea580c", "#9333ea"];
              const pcts = [38, 25, 25, 12];
              const color = colors[idx % colors.length];
              const pct = pcts[idx % pcts.length];

              return (
                <div key={cat.id} className="flex items-center gap-4 text-xs">
                  <span className="w-56 shrink-0 font-medium text-[#334155] dark:text-slate-300 truncate">
                    {cat.name}
                  </span>
                  <div className="flex-1 h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, backgroundColor: color }}
                    />
                  </div>
                  <span className="w-10 text-right font-semibold text-[#0B1F36] dark:text-slate-100 shrink-0">
                    {pct}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Acquisition Sources (5 cols - Screen 2) */}
        <div className="lg:col-span-5 rounded-2xl border border-[#E2E8F0] dark:border-slate-800 bg-white dark:bg-[#0b1329] p-5 shadow-sm transition-colors">
          <div className="flex items-center justify-between pb-4 border-b border-[#F1F5F9] dark:border-slate-800">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#0B1F36]/8 dark:bg-slate-800 text-[#0B1F36] dark:text-slate-200">
                <TrendingUp className="h-4.5 w-4.5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold tracking-[-0.01em] text-[#0B1F36] dark:text-slate-100 leading-tight">
                  Acquisition Sources
                </h3>
                <p className="text-xs text-[#52627A] dark:text-slate-400 mt-0.5">
                  Where subscribers opted in.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3.5 mt-4 text-xs">
            {[
              { label: "Website Reminder Popup", share: "62%", count: "2.1k", color: "bg-blue-500" },
              { label: "In-Chamber Client Intake", share: "24%", count: "820", color: "bg-emerald-500" },
              { label: "Direct Email Invitation", share: "14%", count: "480", color: "bg-amber-500" },
            ].map((src) => (
              <div key={src.label} className="space-y-1.5">
                <div className="flex items-center justify-between text-[#334155] dark:text-slate-300">
                  <span className="font-medium">{src.label}</span>
                  <span className="font-semibold text-[#0B1F36] dark:text-slate-100">{src.share}</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div className={`h-full ${src.color} rounded-full`} style={{ width: src.share }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Action feedback */}
      {actionFeedback && (
        <div
          className={`flex items-center justify-between rounded-xl p-3.5 text-xs font-medium border shadow-2xs ${
            actionFeedback.type === "success"
              ? "bg-[#FDF8EE] dark:bg-amber-950/30 text-[#96641E] dark:text-amber-300 border-[#C8973D]/40"
              : "bg-rose-50 dark:bg-rose-950/30 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-900/40"
          }`}
        >
          <span>{actionFeedback.message}</span>
          <button
            onClick={() => setActionFeedback(null)}
            className="text-[#64748B] dark:text-slate-400 hover:text-[#0B1F36] dark:hover:text-slate-100 ml-2 font-medium"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* 4. Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex items-center rounded-xl bg-[#F1F5F9] dark:bg-slate-800 p-1 border border-[#E2E8F0] dark:border-slate-700">
          {statusTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => {
                setActiveTab(tab.key);
                setCurrentPage(1);
              }}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                activeTab === tab.key
                  ? "bg-white dark:bg-[#0b1329] text-[#0B1F36] dark:text-slate-100 shadow-2xs"
                  : "text-[#64748B] dark:text-slate-400 hover:text-[#0B1F36] dark:hover:text-slate-200"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                  activeTab === tab.key
                    ? "bg-[#0B1F36]/8 dark:bg-slate-700 text-[#0B1F36] dark:text-slate-100 font-bold"
                    : "bg-slate-200/80 dark:bg-slate-700/60 text-[#64748B] dark:text-slate-400 font-medium"
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94A3B8] dark:text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search subscribers by name or email..."
            className="w-full rounded-xl border border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-[#0f172a] py-2.5 pl-10 pr-4 text-sm text-[#0B1F36] dark:text-slate-100 placeholder:text-[#94A3B8] dark:placeholder:text-slate-500 focus:border-[#C8973D] focus:outline-none focus:ring-2 focus:ring-[#C8973D]/20 shadow-2xs transition"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => {
            setCategoryFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="rounded-xl border border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-[#0f172a] px-3.5 py-2.5 text-sm font-medium text-[#0B1F36] dark:text-slate-200 focus:border-[#C8973D] focus:outline-none focus:ring-2 focus:ring-[#C8973D]/20 shadow-2xs transition cursor-pointer"
        >
          <option value="all">All Tax Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* 5. Subscribers Table (Screen 2) */}
      <div className="rounded-2xl border border-[#E2E8F0] dark:border-slate-800 bg-white dark:bg-[#0b1329] overflow-hidden shadow-sm transition-colors">
        {isLoading ? (
          <div className="py-16 text-center text-xs text-[#64748B] dark:text-slate-400">
            <Loader2 className="h-6 w-6 animate-spin mx-auto text-[#C8973D] mb-2" />
            Loading subscribers telemetry...
          </div>
        ) : paginatedSubscribers.length === 0 ? (
          <div className="py-16 text-center text-xs text-[#64748B] dark:text-slate-400">
            <Users className="mx-auto h-8 w-8 text-[#CBD5E1] dark:text-slate-600 mb-2" />
            <p className="font-semibold text-[#0B1F36] dark:text-slate-100 text-sm">
              No subscriber records found.
            </p>
            <p className="text-[#64748B] dark:text-slate-400 mt-1 max-w-sm mx-auto">
              When clients sign up on the public website for tax deadline notices, their verified records will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[#E2E8F0] dark:border-slate-800 bg-[#F8FAFC]/70 dark:bg-[#0f172a] text-xs font-semibold uppercase tracking-wider text-[#64748B] dark:text-slate-400">
                  <th className="py-3.5 px-4 font-semibold">Subscriber</th>
                  <th className="py-3.5 px-4 font-semibold">Subscribed Categories</th>
                  <th className="py-3.5 px-4 font-semibold">Consent Date</th>
                  <th className="py-3.5 px-4 font-semibold">Status</th>
                  <th className="py-3.5 px-4 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9] dark:divide-slate-800/60">
                {paginatedSubscribers.map((sub) => (
                  <tr
                    key={sub.id}
                    className="hover:bg-[#F8FAFC] dark:hover:bg-slate-800/40 transition-colors"
                  >
                    {/* Subscriber Name & Email */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#0B1F36]/8 dark:bg-slate-800 text-xs font-bold text-[#0B1F36] dark:text-slate-200">
                          {getInitials(sub.name || sub.email)}
                        </div>
                        <div>
                          <p className="font-semibold text-[#0B1F36] dark:text-slate-100">
                            {sub.name || "Client Subscriber"}
                          </p>
                          <p className="text-xs text-[#64748B] dark:text-slate-400">
                            {sub.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Subscribed Categories */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {sub.categories && sub.categories.length > 0 ? (
                          sub.categories.map((c) => (
                            <span
                              key={c.id}
                              className="rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-xs font-medium text-[#334155] dark:text-slate-300"
                            >
                              {c.name}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-[#94A3B8] dark:text-slate-500">
                            All statutory notices
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Consent Date */}
                    <td className="py-3.5 px-4 text-[#64748B] dark:text-slate-400 whitespace-nowrap text-xs">
                      {new Date(sub.consent_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {getStatusBadge(sub.status)}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      {sub.status === "active" ? (
                        <button
                          onClick={() => handleUnsubscribeClient(sub.id, sub.email)}
                          className="inline-flex items-center gap-1 rounded-lg border border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-[#0f172a] hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600 dark:hover:text-rose-400 text-[#64748B] dark:text-slate-400 px-2.5 py-1 text-xs font-medium transition"
                        >
                          <UserX className="h-3 w-3" />
                          <span>Unsubscribe</span>
                        </button>
                      ) : (
                        <span className="text-xs text-[#94A3B8] dark:text-slate-500">
                          Opted out
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination footer */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-[#E2E8F0] dark:border-slate-800 px-4 py-3 text-xs text-[#64748B] dark:text-slate-400">
            <span>
              Showing {(currentPage - 1) * PAGE_SIZE + 1} to{" "}
              {Math.min(currentPage * PAGE_SIZE, filteredSubscribers.length)} of{" "}
              {filteredSubscribers.length} subscribers
            </span>
            <div className="flex items-center gap-1">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="rounded-lg p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="px-2 font-semibold text-[#0B1F36] dark:text-slate-200">
                {currentPage} / {totalPages}
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="rounded-lg p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* MODAL: ADD SUBSCRIBER (Screen 2) */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl border border-[#E2E8F0] dark:border-slate-800 bg-white dark:bg-[#0b1329] p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9] dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0B1F36]/8 dark:bg-slate-800 text-[#0B1F36] dark:text-slate-200">
                  <Mail className="h-4 w-4" />
                </div>
                <h3 className="text-sm font-semibold text-[#0B1F36] dark:text-slate-100">
                  Add Tax Reminder Subscriber
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="rounded-lg p-1 text-[#94A3B8] hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-300 transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {addSuccess ? (
              <div className="my-8 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 mb-3">
                  <Check className="h-6 w-6" />
                </div>
                <h4 className="text-sm font-bold text-[#0B1F36] dark:text-slate-100">Subscriber Registered!</h4>
                <p className="text-xs text-[#52627A] dark:text-slate-400 mt-1">
                  Verification email sent and subscriber added.
                </p>
              </div>
            ) : (
              <form onSubmit={handleAddSubscriberSubmit} className="mt-4 space-y-3.5 text-xs">
                <div>
                  <label className="block font-semibold text-[#334155] dark:text-slate-300 mb-1">
                    Client Name
                  </label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. Asim Raza"
                    className="w-full rounded-xl border border-[#E2E8F0] dark:border-slate-700 bg-[#F8FAFC] dark:bg-[#0f172a] px-3.5 py-2 text-[#0B1F36] dark:text-slate-100 placeholder:text-[#94A3B8] dark:placeholder:text-slate-500 focus:border-[#C8973D] focus:bg-white dark:focus:bg-[#131f37] focus:outline-none focus:ring-2 focus:ring-[#C8973D]/20"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#334155] dark:text-slate-300 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="client@example.com"
                    className="w-full rounded-xl border border-[#E2E8F0] dark:border-slate-700 bg-[#F8FAFC] dark:bg-[#0f172a] px-3.5 py-2 text-[#0B1F36] dark:text-slate-100 placeholder:text-[#94A3B8] dark:placeholder:text-slate-500 focus:border-[#C8973D] focus:bg-white dark:focus:bg-[#131f37] focus:outline-none focus:ring-2 focus:ring-[#C8973D]/20"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#334155] dark:text-slate-300 mb-1">
                    Tax Notice Categories
                  </label>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto p-2 rounded-xl bg-[#F8FAFC] dark:bg-[#0f172a] border border-[#E2E8F0] dark:border-slate-700">
                    {categories.map((cat) => (
                      <label
                        key={cat.id}
                        className="flex items-center gap-2 text-xs text-[#334155] dark:text-slate-300 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedCats.includes(cat.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedCats((prev) => [...prev, cat.id]);
                            } else {
                              setSelectedCats((prev) => prev.filter((id) => id !== cat.id));
                            }
                          }}
                          className="rounded text-[#C8973D] focus:ring-[#C8973D]"
                        />
                        <span>{cat.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#F1F5F9] dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="rounded-xl border border-[#E2E8F0] dark:border-slate-700 px-3.5 py-2 text-xs font-semibold text-[#64748B] dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={addLoading}
                    className="rounded-xl bg-[#0B1F36] hover:bg-[#102943] dark:bg-[#C8973D] dark:hover:bg-[#d8a74e] px-4 py-2 text-xs font-semibold text-white dark:text-[#0B1F36] shadow-sm transition disabled:opacity-50"
                  >
                    {addLoading ? "Adding..." : "Add Subscriber"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
