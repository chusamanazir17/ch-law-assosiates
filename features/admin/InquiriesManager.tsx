"use client";

import React, { useEffect, useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  MessageSquareText,
  Search,
  Filter,
  Phone,
  MessageCircle,
  Clock,
  Trash2,
  Loader2,
  Plus,
  X,
  Check,
  FileText,
  PieChart,
  Flag,
  Mail,
  MapPin,
  Send,
  MoreHorizontal,
  Sun,
} from "lucide-react";
import type { ConsultationInquiry } from "@/types/cms";
import { apiFetch } from "@/lib/client/apiFetch";
import { useAdminSession } from "./useAdminSession";

type InquiryStatus = ConsultationInquiry["status"];

interface ExtendedInquiry extends ConsultationInquiry {
  priority?: "High" | "Medium" | "Low";
  assignedTo?: { name: string; avatar?: string };
  location?: string;
  source?: string;
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

function timeOfDayGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
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
  const gradId = `sparkline-inq-${Math.random().toString(36).substring(2, 9)}`;

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


export default function InquiriesManager() {
  return (
    <Suspense
      fallback={
        <div className="py-20 text-center text-xs text-[#64748B] dark:text-slate-400">
          Loading inquiries…
        </div>
      }
    >
      <InquiriesManagerInner />
    </Suspense>
  );
}

function InquiriesManagerInner() {
  const searchParams = useSearchParams();
  const session = useAdminSession();
  const [inquiries, setInquiries] = useState<ExtendedInquiry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | InquiryStatus>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Pagination (client-side over the filtered list)
  const PAGE_SIZE = 10;
  const [page, setPage] = useState(1);

  // Session-local annotations (no backend model exists for these yet)
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [activityLog, setActivityLog] = useState<Record<string, { text: string; at: string }[]>>({});

  // Selected inquiries checkboxes
  const [selectedRowIds, setSelectedRowIds] = useState<string[]>([]);

  // Modals & Details Panel
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedInquiry, setSelectedInquiry] = useState<ExtendedInquiry | null>(null);
  const [activeDrawerTab, setActiveDrawerTab] = useState<"details" | "conversation" | "notes" | "activity">("details");

  // Add Consultation Form State
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newService, setNewService] = useState("Income Tax Filing");
  const [newMessage, setNewMessage] = useState("");
  const [newPriority, setNewPriority] = useState<"High" | "Medium" | "Low">("High");
  const [addSuccess, setAddSuccess] = useState(false);

  // Current Live Time (matching mockup header)
  const [currentTime, setCurrentTime] = useState<string>("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
          year: "numeric",
        }) +
          " " +
          now.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  const loadInquiries = async () => {
    setIsLoading(true);
    try {
      const res = await apiFetch("/api/admin/inquiries");
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.inquiries) {
          const mapped: ExtendedInquiry[] = json.inquiries.map((inq: any) => ({
            ...inq,
            // Priority is a local annotation only — never invented per-row.
            priority: (["High", "Medium", "Low"] as const).includes(inq.priority)
              ? inq.priority
              : undefined,
            assignedTo: undefined,
            location: inq.location || undefined,
            source: inq.source || undefined,
          }));
          setInquiries(mapped);
          setPage(1);
          if (!selectedInquiry) setSelectedInquiry(mapped[0]);
        } else {
          setInquiries([]);
        }
      } else {
        setInquiries([]);
      }
    } catch (error) {
      console.warn("[Inquiries Load]", error);
      setInquiries([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInquiries();
  }, []);

  // H5: honor the header search (?q=) by seeding the table's search filter.
  useEffect(() => {
    const q = searchParams.get("q");
    if (q) setSearchQuery(q);
  }, [searchParams]);

  // Reset to first page whenever the result set changes.
  useEffect(() => {
    setPage(1);
  }, [searchQuery, statusFilter, categoryFilter, priorityFilter]);

  const handleStatusChange = async (id: string, newStatus: InquiryStatus) => {
    setActionLoading(id);

    try {
      const res = await apiFetch("/api/admin/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });

      if (res.ok) {
        setInquiries((prev) =>
          prev.map((inq) => (inq.id === id ? { ...inq, status: newStatus } : inq))
        );
        setActivityLog((prev) => ({
          ...prev,
          [id]: [
            ...(prev[id] || []),
            { text: `Status changed to ${newStatus.replace("_", " ")}`, at: new Date().toISOString() },
          ],
        }));
        setMessage({ type: "success", text: `Status updated to ${newStatus}.` });
        if (selectedInquiry && selectedInquiry.id === id) {
          setSelectedInquiry((prev) => (prev ? { ...prev, status: newStatus } : null));
        }
        setActionLoading(null);
        return;
      }

      const json = await res.json().catch(() => ({}));
      throw new Error(json.error || "Failed to update status.");
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
      const res = await apiFetch("/api/admin/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action: "delete" }),
      });

      if (res.ok) {
        setInquiries((prev) => prev.filter((i) => i.id !== id));
        setMessage({ type: "success", text: "Inquiry removed from inbox." });
        if (selectedInquiry?.id === id) {
          setSelectedInquiry(null);
        }
        setActionLoading(null);
        return;
      }

      const json = await res.json().catch(() => ({}));
      throw new Error(json.error || "Failed to delete inquiry.");
    } catch (error) {
      setMessage({ type: "error", text: getErrorMessage(error, "Failed to delete inquiry.") });
    } finally {
      setActionLoading(null);
    }
  };

  const handleAddConsultation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newPhone.trim()) return;

    const name = newName.trim();
    const phone = newPhone.trim();
    const email = newEmail.trim() || undefined;
    const service = newService;
    const msg = newMessage.trim() || "In-chamber consultation inquiry recorded.";
    const prio = newPriority;

    try {
      const res = await apiFetch("/api/admin/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create",
          name,
          phone,
          email,
          service,
          message: msg,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data?.success) {
        throw new Error(data?.error || "Failed to record consultation.");
      }
      const created = data.inquiry;
      const newInq: ExtendedInquiry = {
        id: created?.id || `inq-${Date.now()}`,
        name: created?.name || name,
        phone: created?.phone || phone,
        email: created?.email || email,
        service_needed: created?.service_needed || service,
        message: created?.message || msg,
        created_at: created?.created_at || new Date().toISOString(),
        status: "new",
        priority: prio,
        source: "In-Chamber Desk",
      };

      setInquiries((prev) => [newInq, ...prev]);
      setSelectedInquiry(newInq);
      setAddSuccess(true);
    } catch (err) {
      setMessage({ type: "error", text: getErrorMessage(err, "Failed to record consultation.") });
      return;
    }

    setTimeout(() => {
      setNewName("");
      setNewPhone("");
      setNewEmail("");
      setNewMessage("");
      setAddSuccess(false);
      setShowAddModal(false);
    }, 1000);
  };

  const filteredInquiries = useMemo(() => {
    return inquiries.filter((inq) => {
      const matchesSearch =
        inq.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inq.phone.includes(searchQuery) ||
        (inq.email && inq.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (inq.service_needed && inq.service_needed.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (inq.message && inq.message.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus =
        statusFilter === "all" || inq.status === statusFilter;

      const matchesCategory =
        categoryFilter === "all" || inq.service_needed === categoryFilter;

      const matchesPriority =
        priorityFilter === "all" || inq.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesCategory && matchesPriority;
    });
  }, [inquiries, searchQuery, statusFilter, categoryFilter, priorityFilter]);

  // Derived metrics — real counts only, 0 when empty.
  const totalCount = inquiries.length;
  const newCount = inquiries.filter((i) => i.status === "new").length;
  const completedCount = inquiries.filter((i) => i.status === "completed").length;
  const highPriorityCount = inquiries.filter((i) => i.priority === "High").length;
  const responseRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const newShare = totalCount > 0 ? Math.round((newCount / totalCount) * 100) : 0;
  const highShare = totalCount > 0 ? Math.round((highPriorityCount / totalCount) * 100) : 0;
  const thisWeekCount = inquiries.filter((i) => {
    const ts = new Date(i.created_at).getTime();
    return !Number.isNaN(ts) && Date.now() - ts < 7 * 24 * 60 * 60 * 1000;
  }).length;

  // Per-day counts for the last 6 days (honest sparklines).
  const sparkFor = (pred: (i: ExtendedInquiry) => boolean) => {
    const days = 6;
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const counts = new Array<number>(days).fill(0);
    for (const inq of inquiries) {
      if (!pred(inq)) continue;
      const ts = new Date(inq.created_at).getTime();
      if (Number.isNaN(ts)) continue;
      const dayIdx = Math.floor((ts - startOfToday.getTime()) / (24 * 60 * 60 * 1000));
      if (dayIdx <= 0 && dayIdx >= -days + 1) counts[days - 1 + dayIdx] += 1;
    }
    return counts;
  };
  const sparkCounts = useMemo(() => sparkFor(() => true), [inquiries]);
  const sparkNew = useMemo(() => sparkFor((i) => i.status === "new"), [inquiries]);
  const sparkCompleted = useMemo(() => sparkFor((i) => i.status === "completed"), [inquiries]);
  const sparkHigh = useMemo(() => sparkFor((i) => i.priority === "High"), [inquiries]);

  // Category breakdown derived from REAL inquiries (top services by volume).
  const CATEGORY_PALETTE = ["#2563EB", "#8B5CF6", "#10B981", "#F59E0B", "#EC4899", "#64748B"];
  const categoryChartData = useMemo(() => {
    const counts = new Map<string, number>();
    for (const inq of inquiries) {
      const svc = (inq.service_needed || "General Consultation").trim() || "General Consultation";
      counts.set(svc, (counts.get(svc) || 0) + 1);
    }
    const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6);
    const total = sorted.reduce((acc, [, c]) => acc + c, 0) || 1;
    return sorted.map(([label, count], idx) => ({
      label,
      count,
      pct: Math.round((count / total) * 100),
      color: CATEGORY_PALETTE[idx % CATEGORY_PALETTE.length],
    }));
  }, [inquiries]);

  // Helper for priority badges
  const getPriorityBadge = (prio?: string) => {
    switch (prio) {
      case "High":
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 px-2 py-0.5 text-[11px] font-semibold text-rose-700 dark:text-rose-300">
            <Flag className="h-3 w-3 fill-rose-500 text-rose-500" />
            High
          </span>
        );
      case "Medium":
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 px-2 py-0.5 text-[11px] font-semibold text-amber-700 dark:text-amber-300">
            <Flag className="h-3 w-3 fill-amber-500 text-amber-500" />
            Medium
          </span>
        );
      case "Low":
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-0.5 text-[11px] font-medium text-slate-600 dark:text-slate-400">
            <Flag className="h-3 w-3 text-slate-400" />
            Low
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium text-[#94A3B8] dark:text-slate-500">
            Not set
          </span>
        );
    }
  };

  // Helper for status badges
  const getStatusBadge = (status: InquiryStatus) => {
    switch (status) {
      case "new":
        return (
          <span className="inline-flex items-center rounded-md bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/70 dark:border-emerald-800/60 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
            New
          </span>
        );
      case "in_progress":
        return (
          <span className="inline-flex items-center rounded-md bg-sky-50 dark:bg-sky-950/40 border border-sky-200/70 dark:border-sky-800/60 px-2.5 py-0.5 text-[11px] font-semibold text-sky-700 dark:text-sky-300">
            In Progress
          </span>
        );
      case "completed":
        return (
          <span className="inline-flex items-center rounded-md bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/70 dark:border-emerald-800/60 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
            Responded
          </span>
        );
      case "archived":
      default:
        return (
          <span className="inline-flex items-center rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2.5 py-0.5 text-[11px] font-medium text-[#64748B] dark:text-slate-400">
            Closed
          </span>
        );
    }
  };

  // Helper for Avatar Initials
  const getInitials = (name: string) => {
    const parts = name.trim().split(" ");
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return (name.slice(0, 2) || "CL").toUpperCase();
  };

  // Select all handler
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedRowIds(filteredInquiries.map((i) => i.id));
    } else {
      setSelectedRowIds([]);
    }
  };

  const handleToggleRow = (id: string) => {
    setSelectedRowIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Client-side pagination over the filtered list.
  const totalPages = Math.max(1, Math.ceil(filteredInquiries.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pagedInquiries = useMemo(
    () => filteredInquiries.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE),
    [filteredInquiries, safePage]
  );
  const pageStart = filteredInquiries.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1;
  const pageEnd = Math.min(safePage * PAGE_SIZE, filteredInquiries.length);
  const pageNumbers = useMemo(() => {
    const nums: number[] = [];
    const from = Math.max(1, Math.min(safePage - 2, totalPages - 4));
    for (let n = from; n <= Math.min(totalPages, from + 4); n++) nums.push(n);
    return nums;
  }, [safePage, totalPages]);

  const handleBulkDelete = async () => {
    if (selectedRowIds.length === 0) return;
    if (!confirm(`Delete ${selectedRowIds.length} selected inquiries? This cannot be undone.`)) return;
    setActionLoading("bulk");
    try {
      await Promise.all(
        selectedRowIds.map((id) =>
          apiFetch("/api/admin/inquiries", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id, action: "delete" }),
          })
        )
      );
      setInquiries((prev) => prev.filter((i) => !selectedRowIds.includes(i.id)));
      if (selectedInquiry && selectedRowIds.includes(selectedInquiry.id)) setSelectedInquiry(null);
      setMessage({ type: "success", text: `${selectedRowIds.length} inquiries deleted.` });
      setSelectedRowIds([]);
    } catch (error) {
      setMessage({ type: "error", text: getErrorMessage(error, "Bulk delete failed.") });
    } finally {
      setActionLoading(null);
    }
  };

  const handleBulkStatus = async (newStatus: InquiryStatus) => {
    if (selectedRowIds.length === 0) return;
    setActionLoading("bulk");
    try {
      await Promise.all(
        selectedRowIds.map((id) =>
          apiFetch("/api/admin/inquiries", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id, status: newStatus }),
          })
        )
      );
      setInquiries((prev) =>
        prev.map((inq) => (selectedRowIds.includes(inq.id) ? { ...inq, status: newStatus } : inq))
      );
      setMessage({ type: "success", text: `${selectedRowIds.length} inquiries marked as ${newStatus}.` });
      setSelectedRowIds([]);
    } catch (error) {
      setMessage({ type: "error", text: getErrorMessage(error, "Bulk status update failed.") });
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-admin pb-12">
      {/* 1. Top Executive Banner & Action Bar (Screen 4 Header) */}
      <div className="rounded-2xl border border-[#E2E8F0] dark:border-slate-800 bg-white dark:bg-[#0b1329] p-5 sm:p-6 shadow-sm transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#0B1F36] dark:text-slate-100">
              Inquiries
            </h1>
            <p className="text-xs sm:text-sm text-[#52627A] dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Manage and respond to all website inquiries from your visitors.
            </p>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            {/* Live Clock & Greeting */}
            <div className="hidden md:flex items-center gap-3 pr-4 border-r border-[#E2E8F0] dark:border-slate-800 text-right">
              <div>
                <p className="text-xs text-[#64748B] dark:text-slate-400 font-medium">
                  {currentTime}
                </p>
                <div className="flex items-center justify-end gap-1.5 mt-0.5">
                  <Sun className="h-4 w-4 text-amber-500 animate-pulse" />
                  <span className="text-sm font-semibold text-[#0B1F36] dark:text-slate-200">
                    {timeOfDayGreeting()}, {session.name}!
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#0B1F36] hover:bg-[#102943] dark:bg-[#C8973D] dark:hover:bg-[#d8a74e] text-white dark:text-[#0B1F36] px-4 py-2.5 text-xs font-semibold shadow-sm transition"
            >
              <Plus className="h-4 w-4" />
              <span>Record Consultation</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. 4 Stat Cards with Sparklines (Screen 4) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Inquiries */}
        <div className="rounded-2xl border border-[#E2E8F0] dark:border-slate-800 bg-white dark:bg-[#0b1329] p-4 sm:p-5 shadow-2xs hover:border-[#CBD5E1] dark:hover:border-slate-700 transition flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#64748B] dark:text-slate-400">Total Inquiries</p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl sm:text-3xl font-bold tabular-nums tracking-tight text-[#0B1F36] dark:text-slate-100">
                {totalCount}
              </span>
            </div>
            <p className="text-xs text-[#64748B] dark:text-slate-400 mt-1">+{thisWeekCount} this week</p>
          </div>
          <MiniSparkline points={sparkCounts} color="#2563EB" />
        </div>

        {/* Card 2: Unresolved */}
        <div className="rounded-2xl border border-[#E2E8F0] dark:border-slate-800 bg-white dark:bg-[#0b1329] p-4 sm:p-5 shadow-2xs hover:border-[#CBD5E1] dark:hover:border-slate-700 transition flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#64748B] dark:text-slate-400">Unresolved</p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl sm:text-3xl font-bold tabular-nums tracking-tight text-[#0B1F36] dark:text-slate-100">
                {newCount}
              </span>
            </div>
            <p className="text-xs text-[#64748B] dark:text-slate-400 mt-1">{newShare}% of total</p>
          </div>
          <MiniSparkline points={sparkNew} color="#EA580C" />
        </div>

        {/* Card 3: Responded */}
        <div className="rounded-2xl border border-[#E2E8F0] dark:border-slate-800 bg-white dark:bg-[#0b1329] p-4 sm:p-5 shadow-2xs hover:border-[#CBD5E1] dark:hover:border-slate-700 transition flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#64748B] dark:text-slate-400">Responded</p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl sm:text-3xl font-bold tabular-nums tracking-tight text-[#0B1F36] dark:text-slate-100">
                {completedCount}
              </span>
            </div>
            <p className="text-xs text-[#64748B] dark:text-slate-400 mt-1">{responseRate}% response rate</p>
          </div>
          <MiniSparkline points={sparkCompleted} color="#10B981" />
        </div>

        {/* Card 4: High Priority */}
        <div className="rounded-2xl border border-[#E2E8F0] dark:border-slate-800 bg-white dark:bg-[#0b1329] p-4 sm:p-5 shadow-2xs hover:border-[#CBD5E1] dark:hover:border-slate-700 transition flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#64748B] dark:text-slate-400">High Priority</p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl sm:text-3xl font-bold tabular-nums tracking-tight text-[#0B1F36] dark:text-slate-100">
                {highPriorityCount}
              </span>
            </div>
            <p className="text-xs text-[#64748B] dark:text-slate-400 mt-1">{highShare}% of total</p>
          </div>
          <MiniSparkline points={sparkHigh} color="#F43F5E" />
        </div>
      </div>

      {/* 3. Inquiry Categories Donut Chart (real distribution) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Inquiry Categories Donut Chart (real distribution) */}
        <div className="lg:col-span-12 rounded-2xl border border-[#E2E8F0] dark:border-slate-800 bg-white dark:bg-[#0b1329] p-5 shadow-sm transition-colors">
          <div className="flex items-center justify-between pb-4 border-b border-[#F1F5F9] dark:border-slate-800">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
                <PieChart className="h-4.5 w-4.5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold tracking-[-0.01em] text-[#0B1F36] dark:text-slate-100 leading-tight">
                  Inquiry Categories
                </h3>
                <p className="text-xs text-[#52627A] dark:text-slate-400 mt-0.5">
                  Distribution of inquiries by category
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setCategoryFilter("all")}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
            >
              View All
            </button>
          </div>

          {categoryChartData.length === 0 ? (
            <div className="mt-4 py-10 text-center">
              <PieChart className="mx-auto h-8 w-8 text-[#CBD5E1] dark:text-slate-600 mb-2" />
              <p className="text-sm font-semibold text-[#0B1F36] dark:text-slate-100">No inquiries yet</p>
              <p className="text-xs text-[#64748B] dark:text-slate-400 mt-1">
                The category breakdown will appear once inquiries arrive.
              </p>
            </div>
          ) : (
          <div className="mt-4 flex flex-col sm:flex-row items-center gap-6">
            {/* SVG Donut Chart */}
            <div className="relative shrink-0 flex items-center justify-center">
              <svg width="170" height="170" viewBox="0 0 170 170" className="transform -rotate-90">
                {(() => {
                  const radius = 62;
                  const circumference = 2 * Math.PI * radius;
                  let offset = 0;

                  return categoryChartData.map((slice, i) => {
                    const strokeDash = (slice.pct / 100) * circumference;
                    const strokeDashoffset = -offset;
                    offset += strokeDash;

                    return (
                      <circle
                        key={i}
                        cx="85"
                        cy="85"
                        r={radius}
                        fill="transparent"
                        stroke={slice.color}
                        strokeWidth="20"
                        strokeDasharray={`${strokeDash} ${circumference}`}
                        strokeDashoffset={strokeDashoffset}
                        className="transition-all duration-500"
                      />
                    );
                  });
                })()}
              </svg>
              {/* Donut Center Label */}
              <div className="absolute text-center">
                <span className="text-xl sm:text-2xl font-bold tabular-nums tracking-tight text-[#0B1F36] dark:text-slate-100 block leading-tight">
                  {totalCount}
                </span>
                <span className="text-xs font-semibold uppercase tracking-wider text-[#64748B] dark:text-slate-400 block mt-0.5">
                  Total
                </span>
              </div>
            </div>

            {/* Legend List */}
            <div className="flex-1 space-y-2.5 w-full text-xs">
              {categoryChartData.map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="h-2.5 w-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="font-medium text-[#334155] dark:text-slate-300 truncate">
                      {item.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-semibold text-[#0B1F36] dark:text-slate-100">
                      {item.pct}%
                    </span>
                    <span className="text-[#64748B] dark:text-slate-400 text-xs font-medium">
                      ({item.count})
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          )}
        </div>

      </div>

      {/* Alert / Notification Feedback */}
      {message && (
        <div
          className={`flex items-center justify-between rounded-xl p-3.5 text-xs font-medium border shadow-2xs ${
            message.type === "success"
              ? "bg-[#FDF8EE] dark:bg-amber-950/30 text-[#96641E] dark:text-amber-300 border-[#C8973D]/40"
              : "bg-rose-50 dark:bg-rose-950/30 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-900/40"
          }`}
        >
          <span>{message.text}</span>
          <button
            onClick={() => setMessage(null)}
            className="text-[#64748B] dark:text-slate-400 hover:text-[#0B1F36] dark:hover:text-slate-100 ml-2 font-medium"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* 4. Search & Filters Bar (Screen 4) */}
      <div className="flex flex-col lg:flex-row gap-3">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94A3B8] dark:text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search inquiries by name, email or keyword..."
            className="w-full rounded-xl border border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-[#0f172a] py-2.5 pl-10 pr-4 text-sm text-[#0B1F36] dark:text-slate-100 placeholder:text-[#94A3B8] dark:placeholder:text-slate-500 focus:border-[#C8973D] focus:outline-none focus:ring-2 focus:ring-[#C8973D]/20 shadow-2xs transition"
          />
        </div>

        {/* Filter Dropdowns matching Screen 4 */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-xl border border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-[#0f172a] px-3 py-2.5 text-xs font-medium text-[#0B1F36] dark:text-slate-200 focus:border-[#C8973D] focus:outline-none transition shadow-2xs"
          >
            <option value="all">All Categories</option>
            <option value="Income Tax Filing">Income Tax Filing</option>
            <option value="E-Stamp Services">E-Stamp Services</option>
            <option value="Business Registration">Business Registration</option>
            <option value="Property Tax">Property Tax</option>
            <option value="Corporate Advisory">Corporate Advisory</option>
            <option value="Registry & Legal Deeds">Registry & Legal Deeds</option>
          </select>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="rounded-xl border border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-[#0f172a] px-3 py-2.5 text-xs font-medium text-[#0B1F36] dark:text-slate-200 focus:border-[#C8973D] focus:outline-none transition shadow-2xs"
          >
            <option value="all">All Priorities</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as "all" | InquiryStatus)}
            className="rounded-xl border border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-[#0f172a] px-3 py-2.5 text-xs font-medium text-[#0B1F36] dark:text-slate-200 focus:border-[#C8973D] focus:outline-none transition shadow-2xs"
          >
            <option value="all">All Statuses</option>
            <option value="new">New</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Responded</option>
            <option value="archived">Closed</option>
          </select>

          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setCategoryFilter("all");
              setPriorityFilter("all");
              setStatusFilter("all");
            }}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-[#0f172a] px-3 py-2.5 text-xs font-medium text-[#64748B] dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition shadow-2xs"
          >
            <Filter className="h-3.5 w-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* 5. Lower Section: Side-by-Side Table & Docked Inquiry Details Card (Screen 4) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Inquiries List Table (7 cols on desktop, or 12 if details closed) */}
        <div className={`${selectedInquiry ? "lg:col-span-7 xl:col-span-7" : "lg:col-span-12"} rounded-2xl border border-[#E2E8F0] dark:border-slate-800 bg-white dark:bg-[#0b1329] overflow-hidden shadow-sm transition-all`}>
          {isLoading ? (
            <div className="py-20 text-center text-xs text-[#64748B] dark:text-slate-400">
              <Loader2 className="h-6 w-6 animate-spin mx-auto text-[#C8973D] mb-2" />
              Loading client consultation inquiries...
            </div>
          ) : filteredInquiries.length === 0 ? (
            <div className="py-20 text-center text-xs text-[#64748B] dark:text-slate-400">
              <MessageSquareText className="mx-auto h-8 w-8 text-[#CBD5E1] dark:text-slate-600 mb-2" />
              <p className="font-semibold text-[#0B1F36] dark:text-slate-100 text-sm">
                No inquiries match your filters.
              </p>
              <p className="text-[#64748B] dark:text-slate-400 mt-1 max-w-sm mx-auto">
                Try resetting your search query or status filter to see other consultation records.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#E2E8F0] dark:border-slate-800 bg-[#F8FAFC]/80 dark:bg-[#0f172a] text-xs font-semibold uppercase tracking-wider text-[#64748B] dark:text-slate-400">
                    <th className="py-3.5 px-3.5 w-8">
                      <input
                        type="checkbox"
                        checked={selectedRowIds.length === filteredInquiries.length && filteredInquiries.length > 0}
                        onChange={handleSelectAll}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                    </th>
                    <th className="py-3.5 px-3.5 font-semibold">Name</th>
                    <th className="py-3.5 px-3.5 font-semibold">Category</th>
                    <th className="py-3.5 px-3.5 font-semibold">Message Preview</th>
                    <th className="py-3.5 px-3.5 font-semibold">Priority</th>
                    <th className="py-3.5 px-3.5 font-semibold">Date</th>
                    <th className="py-3.5 px-3.5 font-semibold">Status</th>
                    <th className="py-3.5 px-3.5 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F5F9] dark:divide-slate-800/60">
                  {pagedInquiries.map((inq) => {
                    const isSelected = selectedInquiry?.id === inq.id;
                    const cleanPhone = inq.phone.replace(/[^0-9]/g, "");
                    const waNumber = cleanPhone.startsWith("0")
                      ? `92${cleanPhone.slice(1)}`
                      : cleanPhone;

                    const waMessage = encodeURIComponent(
                      `السلام علیکم / Hello ${inq.name}, thank you for contacting Chamber 121 (Legal & Tax Advisors). Regarding your inquiry for ${inq.service_needed || "legal & tax services"}, how may we assist you today?`
                    );

                    return (
                      <tr
                        key={inq.id}
                        onClick={() => setSelectedInquiry(inq)}
                        className={`cursor-pointer transition-colors ${
                          isSelected
                            ? "bg-blue-50/60 dark:bg-blue-950/20 border-l-4 border-l-blue-600"
                            : "hover:bg-[#F8FAFC] dark:hover:bg-slate-800/40"
                        }`}
                      >
                        {/* Checkbox */}
                        <td className="py-3.5 px-3.5" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={selectedRowIds.includes(inq.id)}
                            onChange={() => handleToggleRow(inq.id)}
                            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                          />
                        </td>

                        {/* Name + Avatar */}
                        <td className="py-3.5 px-3.5 whitespace-nowrap">
                          <div className="flex items-center gap-2.5">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-xs font-semibold">
                              {getInitials(inq.name)}
                            </div>
                            <div className="min-w-0">
                              <span className="block text-sm font-semibold text-[#0B1F36] dark:text-slate-100 leading-tight">
                                {inq.name}
                              </span>
                              <span className="block text-xs text-[#64748B] dark:text-slate-400 font-normal leading-tight mt-0.5 truncate">
                                {inq.email || inq.phone}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="py-3.5 px-3.5 whitespace-nowrap">
                          <span className="inline-flex rounded-md bg-slate-100 dark:bg-slate-800 px-2.5 py-1 text-xs font-medium text-[#334155] dark:text-slate-300">
                            {inq.service_needed || "Consultation"}
                          </span>
                        </td>

                        {/* Message Preview */}
                        <td className="py-3.5 px-3.5 max-w-[200px] truncate text-sm text-[#475569] dark:text-slate-300">
                          {inq.message}
                        </td>

                        {/* Priority */}
                        <td className="py-3.5 px-3.5 whitespace-nowrap">
                          {getPriorityBadge(inq.priority)}
                        </td>


                        {/* Date */}
                        <td className="py-3.5 px-3.5 whitespace-nowrap text-xs text-[#64748B] dark:text-slate-400">
                          {new Date(inq.created_at).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-3.5 whitespace-nowrap">
                          {getStatusBadge(inq.status)}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-3.5 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1.5">
                            <a
                              href={`https://wa.me/${waNumber}?text=${waMessage}`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 rounded-lg bg-[#25D366] hover:bg-[#20ba59] px-2.5 py-1 text-xs font-semibold text-white transition shadow-2xs"
                              title="Reply via WhatsApp"
                            >
                              <MessageCircle className="h-3.5 w-3.5" />
                            </a>
                            <button
                              type="button"
                              onClick={() => setSelectedInquiry(inq)}
                              className="rounded-lg p-1.5 text-[#64748B] dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                              title="View Details"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Bulk actions bar (appears when rows are selected) */}
          {selectedRowIds.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 border-t border-[#E2E8F0] dark:border-slate-800 bg-blue-50/60 dark:bg-blue-950/20 px-4 py-2.5 text-xs">
              <span className="font-semibold text-[#0B1F36] dark:text-slate-100">
                {selectedRowIds.length} selected
              </span>
              <select
                defaultValue=""
                onChange={(e) => {
                  if (e.target.value) handleBulkStatus(e.target.value as InquiryStatus);
                  e.target.value = "";
                }}
                disabled={actionLoading === "bulk"}
                className="rounded-lg border border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-[#0f172a] px-2 py-1.5 text-xs font-medium text-[#0B1F36] dark:text-slate-200 focus:border-[#C8973D] focus:outline-none"
                aria-label="Set status for selected inquiries"
              >
                <option value="" disabled>
                  Set status…
                </option>
                <option value="new">New</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Responded</option>
                <option value="archived">Closed</option>
              </select>
              <button
                type="button"
                onClick={handleBulkDelete}
                disabled={actionLoading === "bulk"}
                className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 dark:border-rose-900/50 bg-white dark:bg-[#0f172a] px-2.5 py-1.5 text-xs font-semibold text-rose-700 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition disabled:opacity-50"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>{actionLoading === "bulk" ? "Working…" : "Delete selected"}</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedRowIds([])}
                className="text-xs font-medium text-[#64748B] dark:text-slate-400 hover:underline"
              >
                Clear
              </button>
            </div>
          )}

          {/* Working table pagination */}
          <div className="flex items-center justify-between border-t border-[#E2E8F0] dark:border-slate-800 bg-white dark:bg-[#0b1329] px-4 py-3 text-xs text-[#64748B] dark:text-slate-400">
            <span>
              Showing {pageStart}–{pageEnd} of {filteredInquiries.length} inquiries
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={safePage <= 1}
                aria-label="Previous page"
                className="h-7 w-7 rounded-lg border border-[#E2E8F0] dark:border-slate-700 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                ‹
              </button>
              {pageNumbers.map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setPage(n)}
                  aria-label={`Page ${n}`}
                  aria-current={n === safePage ? "page" : undefined}
                  className={`h-7 w-7 rounded-lg font-semibold flex items-center justify-center ${
                    n === safePage
                      ? "bg-blue-600 text-white"
                      : "border border-[#E2E8F0] dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}
                >
                  {n}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={safePage >= totalPages}
                aria-label="Next page"
                className="h-7 w-7 rounded-lg border border-[#E2E8F0] dark:border-slate-700 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                ›
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Docked Selected Inquiry Details Drawer (5 cols on desktop - Screen 4) */}
        {selectedInquiry ? (
          <div className="lg:col-span-5 xl:col-span-5 rounded-2xl border border-[#E2E8F0] dark:border-slate-800 bg-white dark:bg-[#0b1329] p-5 shadow-sm transition-all text-xs">
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9] dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-sm font-bold">
                  {getInitials(selectedInquiry.name)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-[#0B1F36] dark:text-slate-100">
                      {selectedInquiry.name}
                    </h3>
                    {getPriorityBadge(selectedInquiry.priority)}
                  </div>
                  <p className="text-xs text-[#64748B] dark:text-slate-400 mt-0.5 font-normal">
                    {selectedInquiry.email || selectedInquiry.phone}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedInquiry(null)}
                className="rounded-lg p-1 text-[#94A3B8] hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-300 transition"
                title="Close panel"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Sub-tabs: Details | Conversation | Notes | Activity */}
            <div className="flex items-center gap-6 border-b border-[#F1F5F9] dark:border-slate-800 pt-2 text-xs font-semibold text-[#64748B] dark:text-slate-400">
              <button
                type="button"
                onClick={() => setActiveDrawerTab("details")}
                className={`pb-2.5 transition border-b-2 ${
                  activeDrawerTab === "details"
                    ? "text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-400"
                    : "border-transparent hover:text-[#0B1F36] dark:hover:text-slate-200"
                }`}
              >
                Details
              </button>
              <button
                type="button"
                onClick={() => setActiveDrawerTab("conversation")}
                className={`pb-2.5 transition border-b-2 ${
                  activeDrawerTab === "conversation"
                    ? "text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-400"
                    : "border-transparent hover:text-[#0B1F36] dark:hover:text-slate-200"
                }`}
              >
                Conversation
              </button>
              <button
                type="button"
                onClick={() => setActiveDrawerTab("notes")}
                className={`pb-2.5 transition border-b-2 ${
                  activeDrawerTab === "notes"
                    ? "text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-400"
                    : "border-transparent hover:text-[#0B1F36] dark:hover:text-slate-200"
                }`}
              >
                Notes
              </button>
              <button
                type="button"
                onClick={() => setActiveDrawerTab("activity")}
                className={`pb-2.5 transition border-b-2 ${
                  activeDrawerTab === "activity"
                    ? "text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-400"
                    : "border-transparent hover:text-[#0B1F36] dark:hover:text-slate-200"
                }`}
              >
                Activity
              </button>
            </div>

            {/* Drawer Body Content */}
            <div className="mt-4 space-y-4">
              {activeDrawerTab === "details" && (
                <>
              {/* Card 1: Contact Information */}
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#64748B] dark:text-slate-400">
                  <Mail className="h-3.5 w-3.5 text-[#64748B] dark:text-slate-400" />
                  <span>Contact Information</span>
                </div>
                <div className="space-y-2 rounded-xl bg-[#F8FAFC] dark:bg-[#0f172a] p-3.5 border border-[#E2E8F0] dark:border-slate-800 text-sm">
                  <div className="flex items-center gap-2.5">
                    <Mail className="h-3.5 w-3.5 text-[#94A3B8]" />
                    <span className="text-[#334155] dark:text-slate-300 font-medium">
                      {selectedInquiry.email || "Not provided"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Phone className="h-3.5 w-3.5 text-[#94A3B8]" />
                    <span className="font-mono text-[#334155] dark:text-slate-300">
                      {selectedInquiry.phone}
                    </span>
                  </div>
                  {selectedInquiry.location && (
                    <div className="flex items-center gap-2.5">
                      <MapPin className="h-3.5 w-3.5 text-[#94A3B8]" />
                      <span className="text-[#334155] dark:text-slate-300">
                        {selectedInquiry.location}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Card 2: Inquiry Details */}
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#64748B] dark:text-slate-400">
                  <FileText className="h-3.5 w-3.5 text-[#64748B] dark:text-slate-400" />
                  <span>Inquiry Details</span>
                </div>
                <div className="space-y-2.5 rounded-xl bg-[#F8FAFC] dark:bg-[#0f172a] p-3.5 border border-[#E2E8F0] dark:border-slate-800 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[#64748B] dark:text-slate-400 font-medium">Category</span>
                    <span className="font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/50 px-2 py-0.5 rounded">
                      {selectedInquiry.service_needed || "General Consultation"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#64748B] dark:text-slate-400 font-medium">Priority</span>
                    <div>{getPriorityBadge(selectedInquiry.priority)}</div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#64748B] dark:text-slate-400 font-medium">Status</span>
                    <div>{getStatusBadge(selectedInquiry.status)}</div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#64748B] dark:text-slate-400 font-medium">Date Received</span>
                    <span className="text-[#334155] dark:text-slate-300">
                      {new Date(selectedInquiry.created_at).toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#64748B] dark:text-slate-400 font-medium">Source</span>
                    <span className="text-[#334155] dark:text-slate-300 font-medium">
                      {selectedInquiry.source || "Website"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Card 3: Message */}
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#64748B] dark:text-slate-400">
                  <MessageSquareText className="h-3.5 w-3.5 text-[#64748B] dark:text-slate-400" />
                  <span>Message</span>
                </div>
                <div className="p-3.5 rounded-xl bg-[#F8FAFC] dark:bg-[#0f172a] border border-[#E2E8F0] dark:border-slate-800 text-[#334155] dark:text-slate-200 text-sm leading-relaxed">
                  &ldquo;{selectedInquiry.message}&rdquo;
                </div>
              </div>

                </>
              )}

              {activeDrawerTab === "conversation" && (
                <div className="rounded-xl border border-dashed border-[#CBD5E1] dark:border-slate-700 p-8 text-center">
                  <MessageCircle className="mx-auto h-8 w-8 text-[#CBD5E1] dark:text-slate-600 mb-2" />
                  <p className="text-sm font-semibold text-[#0B1F36] dark:text-slate-100">
                    No in-app conversation yet
                  </p>
                  <p className="text-xs text-[#64748B] dark:text-slate-400 mt-1 max-w-xs mx-auto">
                    Replies to this client happen over WhatsApp or phone — there is no in-app
                    messaging thread to show.
                  </p>
                  {selectedInquiry.phone && (
                    <a
                      href={`https://wa.me/${selectedInquiry.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                        `Assalam-o-Alaikum ${selectedInquiry.name}, Chamber 121 responding regarding your inquiry on ${selectedInquiry.service_needed || "legal services"}.`
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white px-4 py-2 text-xs font-semibold transition"
                    >
                      <MessageCircle className="h-3.5 w-3.5" />
                      <span>Open WhatsApp Chat</span>
                    </a>
                  )}
                </div>
              )}

              {activeDrawerTab === "notes" && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-wider text-[#64748B] dark:text-slate-400">
                      Private Notes
                    </p>
                    <span className="text-[10px] text-[#94A3B8] dark:text-slate-500">
                      Saved on this device only
                    </span>
                  </div>
                  <textarea
                    rows={6}
                    value={notes[selectedInquiry.id] || ""}
                    onChange={(e) =>
                      setNotes((prev) => ({ ...prev, [selectedInquiry.id]: e.target.value }))
                    }
                    placeholder="Add an internal note about this inquiry — follow-ups, context, reminders…"
                    className="w-full rounded-xl border border-[#E2E8F0] dark:border-slate-700 bg-[#F8FAFC] dark:bg-[#0f172a] px-3.5 py-2.5 text-sm text-[#0B1F36] dark:text-slate-100 placeholder:text-[#94A3B8] dark:placeholder:text-slate-500 focus:border-[#C8973D] focus:outline-none focus:ring-2 focus:ring-[#C8973D]/20"
                  />
                </div>
              )}

              {activeDrawerTab === "activity" && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#64748B] dark:text-slate-400">
                    Activity
                  </p>
                  {(activityLog[selectedInquiry.id] || []).length === 0 ? (
                    <div className="rounded-xl border border-dashed border-[#CBD5E1] dark:border-slate-700 p-6 text-center">
                      <Clock className="mx-auto h-6 w-6 text-[#CBD5E1] dark:text-slate-600 mb-2" />
                      <p className="text-xs text-[#64748B] dark:text-slate-400">
                        No recorded activity yet. Status changes you make will appear here.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {(activityLog[selectedInquiry.id] || [])
                        .slice()
                        .reverse()
                        .map((entry, idx) => (
                          <div key={idx} className="flex items-start gap-2.5 text-xs">
                            <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-blue-500" />
                            <div className="min-w-0">
                              <p className="font-medium text-[#1E293B] dark:text-slate-200">{entry.text}</p>
                              <p className="text-[11px] text-[#94A3B8] dark:text-slate-500">
                                {new Date(entry.at).toLocaleString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </p>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                  <p className="text-[10px] text-[#94A3B8] dark:text-slate-500">
                    Received{" "}
                    {new Date(selectedInquiry.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                    {" "}via {selectedInquiry.source || "website"}
                  </p>
                </div>
              )}

              {/* Action Buttons matching Screen 4 */}
              <div className="pt-2 flex items-center gap-2">
                {/* WhatsApp Reply button */}
                <a
                  href={`https://wa.me/${selectedInquiry.phone.replace(/[^0-9]/g, "").startsWith("0") ? "92" + selectedInquiry.phone.replace(/[^0-9]/g, "").slice(1) : selectedInquiry.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                    `السلام علیکم / Hello ${selectedInquiry.name}, Chamber 121 responding regarding your inquiry on ${selectedInquiry.service_needed || "legal services"}.`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-[#2563EB] hover:bg-[#1d4ed8] text-white py-2.5 px-3 text-sm font-semibold shadow-sm transition"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>Reply</span>
                </a>

                {/* Mark as Resolved */}
                <button
                  type="button"
                  onClick={() => handleStatusChange(selectedInquiry.id, "completed")}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-[#0f172a] hover:bg-slate-50 dark:hover:bg-slate-800 text-[#334155] dark:text-slate-200 py-2.5 px-3 text-sm font-semibold shadow-2xs transition"
                >
                  <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Mark as Resolved</span>
                </button>

                {/* More options button */}
                <button
                  type="button"
                  onClick={() => handleDelete(selectedInquiry.id, selectedInquiry.name)}
                  className="rounded-xl border border-[#E2E8F0] dark:border-slate-700 p-2.5 text-[#94A3B8] hover:bg-rose-50 dark:hover:bg-rose-950/30 hover:text-rose-600 transition"
                  title="Delete inquiry"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="hidden lg:flex lg:col-span-5 rounded-2xl border border-dashed border-[#CBD5E1] dark:border-slate-800 p-12 text-center flex-col items-center justify-center text-xs text-[#64748B] dark:text-slate-400 min-h-[400px]">
            <MessageSquareText className="h-10 w-10 text-[#CBD5E1] dark:text-slate-700 mb-3" />
            <p className="font-semibold text-[#0B1F36] dark:text-slate-200 text-sm">
              No Inquiry Selected
            </p>
            <p className="mt-1 max-w-xs">
              Click on any inquiry in the table to view client details, message, and quick reply tools.
            </p>
          </div>
        )}
      </div>

      {/* MODAL: RECORD CONSULTATION */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl border border-[#E2E8F0] dark:border-slate-800 bg-white dark:bg-[#0b1329] p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9] dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0B1F36]/8 dark:bg-slate-800 text-[#0B1F36] dark:text-slate-200">
                  <Plus className="h-4 w-4" />
                </div>
                <h3 className="text-sm font-semibold text-[#0B1F36] dark:text-slate-100">
                  Record Consultation Request
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
                <h4 className="text-sm font-bold text-[#0B1F36] dark:text-slate-100">Consultation Recorded!</h4>
                <p className="text-xs text-[#52627A] dark:text-slate-400 mt-1">
                  Client inquiry has been successfully recorded in your inbox.
                </p>
              </div>
            ) : (
              <form onSubmit={handleAddConsultation} className="mt-4 space-y-3.5 text-xs">
                <div>
                  <label className="block font-semibold text-[#334155] dark:text-slate-300 mb-1">
                    Client Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. Tariq Mehmood"
                    className="w-full rounded-xl border border-[#E2E8F0] dark:border-slate-700 bg-[#F8FAFC] dark:bg-[#0f172a] px-3.5 py-2 text-[#0B1F36] dark:text-slate-100 placeholder:text-[#94A3B8] dark:placeholder:text-slate-500 focus:border-[#C8973D] focus:bg-white dark:focus:bg-[#131f37] focus:outline-none focus:ring-2 focus:ring-[#C8973D]/20"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-[#334155] dark:text-slate-300 mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="text"
                      required
                      value={newPhone}
                      onChange={(e) => setNewPhone(e.target.value)}
                      placeholder="+92 300 1234567"
                      className="w-full rounded-xl border border-[#E2E8F0] dark:border-slate-700 bg-[#F8FAFC] dark:bg-[#0f172a] px-3.5 py-2 text-[#0B1F36] dark:text-slate-100 placeholder:text-[#94A3B8] dark:placeholder:text-slate-500 focus:border-[#C8973D] focus:bg-white dark:focus:bg-[#131f37] focus:outline-none focus:ring-2 focus:ring-[#C8973D]/20"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-[#334155] dark:text-slate-300 mb-1">
                      Priority
                    </label>
                    <select
                      value={newPriority}
                      onChange={(e) => setNewPriority(e.target.value as "High" | "Medium" | "Low")}
                      className="w-full rounded-xl border border-[#E2E8F0] dark:border-slate-700 bg-[#F8FAFC] dark:bg-[#0f172a] px-3.5 py-2 text-[#0B1F36] dark:text-slate-100 focus:border-[#C8973D] focus:bg-white dark:focus:bg-[#131f37] focus:outline-none focus:ring-2 focus:ring-[#C8973D]/20"
                    >
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-[#334155] dark:text-slate-300 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="client@example.com"
                    className="w-full rounded-xl border border-[#E2E8F0] dark:border-slate-700 bg-[#F8FAFC] dark:bg-[#0f172a] px-3.5 py-2 text-[#0B1F36] dark:text-slate-100 placeholder:text-[#94A3B8] dark:placeholder:text-slate-500 focus:border-[#C8973D] focus:bg-white dark:focus:bg-[#131f37] focus:outline-none focus:ring-2 focus:ring-[#C8973D]/20"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#334155] dark:text-slate-300 mb-1">
                    Service Required
                  </label>
                  <select
                    value={newService}
                    onChange={(e) => setNewService(e.target.value)}
                    className="w-full rounded-xl border border-[#E2E8F0] dark:border-slate-700 bg-[#F8FAFC] dark:bg-[#0f172a] px-3.5 py-2 text-[#0B1F36] dark:text-slate-100 focus:border-[#C8973D] focus:bg-white dark:focus:bg-[#131f37] focus:outline-none focus:ring-2 focus:ring-[#C8973D]/20"
                  >
                    <option value="Income Tax Filing">Income Tax Filing</option>
                    <option value="E-Stamp Services">E-Stamp Services</option>
                    <option value="Business Registration">Business Registration</option>
                    <option value="Property Tax">Property Tax</option>
                    <option value="Corporate Advisory">Corporate Advisory</option>
                    <option value="Registry & Legal Deeds">Registry & Legal Deeds</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#334155] dark:text-slate-300 mb-1">
                    Matter Notes / Client Message
                  </label>
                  <textarea
                    rows={3}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Notes on client requirements or inquiry text..."
                    className="w-full rounded-xl border border-[#E2E8F0] dark:border-slate-700 bg-[#F8FAFC] dark:bg-[#0f172a] px-3.5 py-2 text-[#0B1F36] dark:text-slate-100 placeholder:text-[#94A3B8] dark:placeholder:text-slate-500 focus:border-[#C8973D] focus:bg-white dark:focus:bg-[#131f37] focus:outline-none focus:ring-2 focus:ring-[#C8973D]/20"
                  />
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
                    className="rounded-xl bg-[#0B1F36] hover:bg-[#102943] dark:bg-[#C8973D] dark:hover:bg-[#d8a74e] px-4 py-2 text-xs font-semibold text-white dark:text-[#0B1F36] shadow-sm transition"
                  >
                    Save Consultation
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
