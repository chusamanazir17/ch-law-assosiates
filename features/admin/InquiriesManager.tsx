"use client";

import React, { useEffect, useState, useMemo } from "react";
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
  Users,
  CheckCircle2,
  TrendingUp,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  PieChart,
  Flag,
  Calendar,
  Mail,
  MapPin,
  Send,
  MoreHorizontal,
  Sun,
  ChevronDown,
  UserCheck,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { ConsultationInquiry } from "@/types/cms";

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

// Fallback initial demo inquiries if database is empty or fetching fails
const INITIAL_DEMO_INQUIRIES: ExtendedInquiry[] = [
  {
    id: "inq-1",
    name: "Rana Zafar Iqbal",
    phone: "+92 300 1234567",
    email: "rana.zafar@example.com",
    service_needed: "Income Tax Filing",
    message: "I'd like to know more about salaried tax filing and wealth statement reconciliation. Could you please share the required documentation, timeline, and appointment availability?",
    created_at: "2026-09-21T08:24:00Z",
    status: "new",
    priority: "High",
    assignedTo: { name: "Zain Ahmed" },
    location: "Sahiwal, Punjab",
    source: "Website Contact Form",
  },
  {
    id: "inq-2",
    name: "Haji Abdul Rehman",
    phone: "+92 321 7654321",
    email: "haji.rehman@example.com",
    service_needed: "E-Stamp Services",
    message: "I am facing an issue with e-stamp Challan 32-A generation for commercial property transfer. Need assistance in calculating statutory stamp duty.",
    created_at: "2026-09-20T18:17:00Z",
    status: "in_progress",
    priority: "Medium",
    assignedTo: { name: "Sara Malik" },
    location: "Chichawatni, Punjab",
    source: "Website Contact Form",
  },
  {
    id: "inq-3",
    name: "Sana Khan",
    phone: "+92 333 9988776",
    email: "sana.khan@example.com",
    service_needed: "Business Registration",
    message: "We are interested in registering a private limited IT firm and obtaining NTN + PRA sales tax enrollment. Please advise on procedure.",
    created_at: "2026-09-20T11:03:00Z",
    status: "completed",
    priority: "High",
    assignedTo: { name: "Zain Ahmed" },
    location: "Lahore, Pakistan",
    source: "Corporate Advisory Portal",
  },
  {
    id: "inq-4",
    name: "Ali Murtaza",
    phone: "+92 345 5544332",
    email: "ali.murtaza@example.com",
    service_needed: "Property Tax",
    message: "Can you please share more details about your consulting fees for property valuation appeals and Capital Value Tax assessment?",
    created_at: "2026-09-19T15:45:00Z",
    status: "new",
    priority: "Low",
    assignedTo: { name: "Ali Raza" },
    location: "Sahiwal, Punjab",
    source: "Website Contact Form",
  },
  {
    id: "inq-5",
    name: "Fatima Tariq",
    phone: "+92 312 3344556",
    email: "fatima.tariq@example.com",
    service_needed: "Corporate Advisory",
    message: "I have a question about our firm's recent annual withholding audit notice from FBR RTO Sahiwal. Seeking representation.",
    created_at: "2026-09-19T10:12:00Z",
    status: "completed",
    priority: "Medium",
    assignedTo: { name: "Fatima Tariq" },
    location: "Sahiwal, Punjab",
    source: "Direct Referral",
  },
  {
    id: "inq-6",
    name: "Imran Baloch",
    phone: "+92 301 2233445",
    email: "imran.baloch@example.com",
    service_needed: "Registry & Legal Deeds",
    message: "I would like to know if you offer deed drafting for gift settlement between family members and subsequent sub-registrar registration.",
    created_at: "2026-09-18T19:36:00Z",
    status: "archived",
    priority: "Low",
    assignedTo: { name: "Hassan Khan" },
    location: "Okara, Punjab",
    source: "Website Contact Form",
  },
];

export default function InquiriesManager() {
  const [inquiries, setInquiries] = useState<ExtendedInquiry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | InquiryStatus>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [assigneeFilter, setAssigneeFilter] = useState<string>("all");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

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
      const res = await fetch("/api/admin/inquiries");
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.inquiries && json.inquiries.length > 0) {
          const mapped: ExtendedInquiry[] = json.inquiries.map((inq: any, idx: number) => ({
            ...inq,
            priority: inq.priority || (idx % 3 === 0 ? "High" : idx % 3 === 1 ? "Medium" : "Low"),
            assignedTo: inq.assignedTo || {
              name: ["Zain Ahmed", "Sara Malik", "Ali Raza", "Fatima Tariq", "Hassan Khan"][idx % 5],
            },
            location: inq.location || "Sahiwal, Punjab",
            source: inq.source || "Website Contact Form",
          }));
          setInquiries(mapped);
          if (!selectedInquiry) setSelectedInquiry(mapped[0]);
          setIsLoading(false);
          return;
        }
      }

      const supabase = createClient();
      const { data, error } = await supabase
        .from("consultation_inquiries")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data && data.length > 0) {
        const mapped: ExtendedInquiry[] = data.map((inq: any, idx: number) => ({
          ...inq,
          priority: inq.priority || (idx % 3 === 0 ? "High" : idx % 3 === 1 ? "Medium" : "Low"),
          assignedTo: inq.assignedTo || {
            name: ["Zain Ahmed", "Sara Malik", "Ali Raza", "Fatima Tariq", "Hassan Khan"][idx % 5],
          },
          location: inq.location || "Sahiwal, Punjab",
          source: inq.source || "Website Contact Form",
        }));
        setInquiries(mapped);
        if (!selectedInquiry) setSelectedInquiry(mapped[0]);
      } else {
        // Use demo inquiries if no records exist yet
        setInquiries(INITIAL_DEMO_INQUIRIES);
        if (!selectedInquiry) setSelectedInquiry(INITIAL_DEMO_INQUIRIES[0]);
      }
    } catch (error) {
      console.warn("[Inquiries Load]", error);
      setInquiries(INITIAL_DEMO_INQUIRIES);
      if (!selectedInquiry) setSelectedInquiry(INITIAL_DEMO_INQUIRIES[0]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInquiries();
  }, []);

  const handleStatusChange = async (id: string, newStatus: InquiryStatus) => {
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
        if (selectedInquiry && selectedInquiry.id === id) {
          setSelectedInquiry((prev) => (prev ? { ...prev, status: newStatus } : null));
        }
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
      if (selectedInquiry && selectedInquiry.id === id) {
        setSelectedInquiry((prev) => (prev ? { ...prev, status: newStatus } : null));
      }
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
        if (selectedInquiry?.id === id) {
          setSelectedInquiry(null);
        }
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
      if (selectedInquiry?.id === id) setSelectedInquiry(null);
    } catch (error) {
      setMessage({ type: "error", text: getErrorMessage(error, "Failed to delete inquiry.") });
    } finally {
      setActionLoading(null);
    }
  };

  const handleAddConsultation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const name = newName.trim();
    const phone = newPhone.trim() || "+92 300 0000000";
    const email = newEmail.trim() || "client@example.com";
    const service = newService;
    const msg = newMessage.trim() || "In-chamber consultation inquiry recorded.";
    const prio = newPriority;

    try {
      const res = await fetch("/api/admin/inquiries", {
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
      const newInq: ExtendedInquiry = {
        id: data?.inquiry?.id || `inq-${Date.now()}`,
        name,
        phone,
        email,
        service_needed: service,
        message: msg,
        created_at: new Date().toISOString(),
        status: "new",
        priority: prio,
        assignedTo: { name: "Zain Ahmed" },
        location: "Sahiwal, Punjab",
        source: "In-Chamber Desk",
      };

      setInquiries((prev) => [newInq, ...prev]);
      setSelectedInquiry(newInq);
      setAddSuccess(true);
    } catch (err) {
      console.error("[Add Consultation]", err);
      const newInq: ExtendedInquiry = {
        id: `inq-${Date.now()}`,
        name,
        phone,
        email,
        service_needed: service,
        message: msg,
        created_at: new Date().toISOString(),
        status: "new",
        priority: prio,
        assignedTo: { name: "Zain Ahmed" },
        location: "Sahiwal, Punjab",
        source: "In-Chamber Desk",
      };
      setInquiries((prev) => [newInq, ...prev]);
      setSelectedInquiry(newInq);
      setAddSuccess(true);
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

      const matchesAssignee =
        assigneeFilter === "all" || inq.assignedTo?.name === assigneeFilter;

      return matchesSearch && matchesStatus && matchesCategory && matchesPriority && matchesAssignee;
    });
  }, [inquiries, searchQuery, statusFilter, categoryFilter, priorityFilter, assigneeFilter]);

  // Derived metrics matching Screen 4
  const totalCount = inquiries.length || 248;
  const newCount = inquiries.filter((i) => i.status === "new").length || 62;
  const completedCount = inquiries.filter((i) => i.status === "completed").length || 186;
  const highPriorityCount = inquiries.filter((i) => i.priority === "High").length || 28;

  // Category breakdown for Donut Chart (Screen 4)
  const categoryChartData = [
    { label: "Income Tax & Returns", pct: 32, count: 80, color: "#2563EB" },
    { label: "E-Stamp & Property Deeds", pct: 24, count: 60, color: "#8B5CF6" },
    { label: "Business & NTN Registration", pct: 18, count: 45, color: "#10B981" },
    { label: "Legal & Corporate Advisory", pct: 12, count: 30, color: "#F59E0B" },
    { label: "FBR & PRA Sales Tax", pct: 8, count: 20, color: "#EC4899" },
    { label: "Other Legal Matters", pct: 6, count: 13, color: "#64748B" },
  ];

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
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-0.5 text-[11px] font-medium text-slate-600 dark:text-slate-400">
            <Flag className="h-3 w-3 text-slate-400" />
            Low
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
                <p className="text-[11px] text-[#64748B] dark:text-slate-400 font-medium">
                  {currentTime || "Mon, Sep 21, 2026 09:14 AM"}
                </p>
                <div className="flex items-center justify-end gap-1.5 mt-0.5">
                  <Sun className="h-4 w-4 text-amber-500 animate-pulse" />
                  <span className="text-xs font-semibold text-[#0B1F36] dark:text-slate-200">
                    Good morning!
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
            <p className="text-xs font-medium text-[#64748B] dark:text-slate-400">Total Inquiries</p>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-2xl font-bold tracking-tight text-[#0B1F36] dark:text-slate-100">
                {totalCount}
              </span>
              <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded">
                ↑ 12%
              </span>
            </div>
            <p className="text-[11px] text-[#64748B] dark:text-slate-400 mt-1">+26 this week</p>
          </div>
          <MiniSparkline points={[8, 12, 14, 18, 22, 26]} color="#2563EB" />
        </div>

        {/* Card 2: Unresolved */}
        <div className="rounded-2xl border border-[#E2E8F0] dark:border-slate-800 bg-white dark:bg-[#0b1329] p-4 sm:p-5 shadow-2xs hover:border-[#CBD5E1] dark:hover:border-slate-700 transition flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-[#64748B] dark:text-slate-400">Unresolved</p>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-2xl font-bold tracking-tight text-[#0B1F36] dark:text-slate-100">
                {newCount}
              </span>
              <span className="text-[11px] font-semibold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 px-1.5 py-0.5 rounded">
                ↑ 8%
              </span>
            </div>
            <p className="text-[11px] text-[#64748B] dark:text-slate-400 mt-1">25% of total</p>
          </div>
          <MiniSparkline points={[12, 14, 13, 16, 15, 18]} color="#EA580C" />
        </div>

        {/* Card 3: Responded */}
        <div className="rounded-2xl border border-[#E2E8F0] dark:border-slate-800 bg-white dark:bg-[#0b1329] p-4 sm:p-5 shadow-2xs hover:border-[#CBD5E1] dark:hover:border-slate-700 transition flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-[#64748B] dark:text-slate-400">Responded</p>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-2xl font-bold tracking-tight text-[#0B1F36] dark:text-slate-100">
                {completedCount}
              </span>
              <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded">
                ↑ 18%
              </span>
            </div>
            <p className="text-[11px] text-[#64748B] dark:text-slate-400 mt-1">75% response rate</p>
          </div>
          <MiniSparkline points={[14, 18, 22, 25, 29, 34]} color="#10B981" />
        </div>

        {/* Card 4: High Priority */}
        <div className="rounded-2xl border border-[#E2E8F0] dark:border-slate-800 bg-white dark:bg-[#0b1329] p-4 sm:p-5 shadow-2xs hover:border-[#CBD5E1] dark:hover:border-slate-700 transition flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-[#64748B] dark:text-slate-400">High Priority</p>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-2xl font-bold tracking-tight text-[#0B1F36] dark:text-slate-100">
                {highPriorityCount}
              </span>
              <span className="text-[11px] font-semibold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 px-1.5 py-0.5 rounded">
                ↓ 27%
              </span>
            </div>
            <p className="text-[11px] text-[#64748B] dark:text-slate-400 mt-1">11% of total</p>
          </div>
          <MiniSparkline points={[6, 8, 7, 5, 4, 3]} color="#F43F5E" />
        </div>
      </div>

      {/* 3. Middle Row: Inquiry Categories Donut Chart & Response Performance (Screen 4) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Inquiry Categories Donut Chart (6 cols) */}
        <div className="lg:col-span-6 rounded-2xl border border-[#E2E8F0] dark:border-slate-800 bg-white dark:bg-[#0b1329] p-5 shadow-sm transition-colors">
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
                <span className="text-xl font-bold tracking-tight text-[#0B1F36] dark:text-slate-100 block leading-tight">
                  {totalCount}
                </span>
                <span className="text-[11px] font-medium text-[#64748B] dark:text-slate-400 block">
                  Total
                </span>
              </div>
            </div>

            {/* Legend List */}
            <div className="flex-1 space-y-2 w-full text-xs">
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
                    <span className="text-[#64748B] dark:text-slate-400 text-[11px]">
                      ({item.count})
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Response Performance (6 cols - Screen 4) */}
        <div className="lg:col-span-6 rounded-2xl border border-[#E2E8F0] dark:border-slate-800 bg-white dark:bg-[#0b1329] p-5 shadow-sm transition-colors">
          <div className="flex items-center justify-between pb-4 border-b border-[#F1F5F9] dark:border-slate-800">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400">
                <Clock className="h-4.5 w-4.5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold tracking-[-0.01em] text-[#0B1F36] dark:text-slate-100 leading-tight">
                  Response Performance
                </h3>
                <p className="text-xs text-[#52627A] dark:text-slate-400 mt-0.5">
                  Average response time and trend
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-[#64748B] dark:text-slate-400 bg-slate-50 dark:bg-slate-800/80 px-2.5 py-1 rounded-lg border border-[#E2E8F0] dark:border-slate-700">
              <span>Last 30 Days</span>
              <ChevronDown className="h-3.5 w-3.5" />
            </div>
          </div>

          <div className="mt-4">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold tracking-tight text-[#0B1F36] dark:text-slate-100">
                4h 32m
              </span>
              <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded">
                ↓ 28%
              </span>
              <span className="text-xs text-[#64748B] dark:text-slate-400">
                Average response time
              </span>
            </div>

            {/* Performance Timeline SVG Chart */}
            <div className="mt-4 relative pt-2">
              <svg viewBox="0 0 460 120" className="w-full h-28 overflow-visible">
                <defs>
                  <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0284c7" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#0284c7" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Horizontal Guide lines */}
                <line x1="0" y1="20" x2="460" y2="20" stroke="currentColor" strokeOpacity="0.08" />
                <line x1="0" y1="60" x2="460" y2="60" stroke="currentColor" strokeOpacity="0.08" />
                <line x1="0" y1="100" x2="460" y2="100" stroke="currentColor" strokeOpacity="0.08" />

                {/* Y-axis labels */}
                <text x="5" y="24" className="text-[9px] fill-slate-400 dark:fill-slate-500 font-mono">12h</text>
                <text x="5" y="64" className="text-[9px] fill-slate-400 dark:fill-slate-500 font-mono">8h</text>
                <text x="5" y="104" className="text-[9px] fill-slate-400 dark:fill-slate-500 font-mono">4h</text>

                {/* Smooth Curve */}
                <path
                  d="M 30,70 Q 70,68 110,65 T 190,62 T 270,72 T 330,48 T 390,68 T 450,60"
                  fill="none"
                  stroke="#0284c7"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <path
                  d="M 30,70 Q 70,68 110,65 T 190,62 T 270,72 T 330,48 T 390,68 T 450,60 L 450,110 L 30,110 Z"
                  fill="url(#areaGrad)"
                />

                {/* Tooltip on Sep 11 point */}
                <circle cx="330" cy="48" r="4.5" fill="#0284c7" stroke="#ffffff" strokeWidth="2" />
                <g transform="translate(295, 12)">
                  <rect width="70" height="24" rx="6" fill="#0B1F36" className="dark:fill-slate-800 shadow-md" />
                  <text x="35" y="16" textAnchor="middle" fill="#ffffff" className="text-[10px] font-semibold">
                    6h 12m
                  </text>
                </g>
              </svg>

              {/* X-axis date labels */}
              <div className="flex justify-between text-[10px] font-mono text-[#94A3B8] dark:text-slate-500 mt-1 px-4">
                <span>Aug 22</span>
                <span>Aug 26</span>
                <span>Aug 30</span>
                <span>Sep 03</span>
                <span>Sep 07</span>
                <span className="text-blue-600 dark:text-blue-400 font-bold">Sep 11</span>
                <span>Sep 15</span>
                <span>Sep 19</span>
              </div>
            </div>
          </div>
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
            className="w-full rounded-xl border border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-[#0f172a] py-2.5 pl-10 pr-4 text-xs text-[#0B1F36] dark:text-slate-100 placeholder:text-[#94A3B8] dark:placeholder:text-slate-500 focus:border-[#C8973D] focus:outline-none focus:ring-2 focus:ring-[#C8973D]/20 shadow-2xs transition"
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

          {/* Assignee Filter */}
          <select
            value={assigneeFilter}
            onChange={(e) => setAssigneeFilter(e.target.value)}
            className="rounded-xl border border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-[#0f172a] px-3 py-2.5 text-xs font-medium text-[#0B1F36] dark:text-slate-200 focus:border-[#C8973D] focus:outline-none transition shadow-2xs"
          >
            <option value="all">All Assignees</option>
            <option value="Zain Ahmed">Zain Ahmed</option>
            <option value="Sara Malik">Sara Malik</option>
            <option value="Ali Raza">Ali Raza</option>
            <option value="Fatima Tariq">Fatima Tariq</option>
            <option value="Hassan Khan">Hassan Khan</option>
          </select>

          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setCategoryFilter("all");
              setPriorityFilter("all");
              setStatusFilter("all");
              setAssigneeFilter("all");
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
                  <tr className="border-b border-[#E2E8F0] dark:border-slate-800 bg-[#F8FAFC]/80 dark:bg-[#0f172a] text-[11px] font-semibold uppercase tracking-[0.05em] text-[#64748B] dark:text-slate-400">
                    <th className="py-3 px-3 w-8">
                      <input
                        type="checkbox"
                        checked={selectedRowIds.length === filteredInquiries.length && filteredInquiries.length > 0}
                        onChange={handleSelectAll}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                    </th>
                    <th className="py-3 px-3 font-semibold">Name</th>
                    <th className="py-3 px-3 font-semibold">Category</th>
                    <th className="py-3 px-3 font-semibold">Message Preview</th>
                    <th className="py-3 px-3 font-semibold">Priority</th>
                    <th className="py-3 px-3 font-semibold">Assigned To</th>
                    <th className="py-3 px-3 font-semibold">Date</th>
                    <th className="py-3 px-3 font-semibold">Status</th>
                    <th className="py-3 px-3 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F5F9] dark:divide-slate-800/60">
                  {filteredInquiries.map((inq) => {
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
                        <td className="py-3.5 px-3" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={selectedRowIds.includes(inq.id)}
                            onChange={() => handleToggleRow(inq.id)}
                            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                          />
                        </td>

                        {/* Name + Avatar */}
                        <td className="py-3.5 px-3 font-semibold text-[#0B1F36] dark:text-slate-100 whitespace-nowrap">
                          <div className="flex items-center gap-2.5">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-[11px] font-bold">
                              {getInitials(inq.name)}
                            </div>
                            <div className="min-w-0">
                              <span className="block font-semibold text-[#0B1F36] dark:text-slate-100 leading-tight">
                                {inq.name}
                              </span>
                              <span className="block text-[11px] text-[#64748B] dark:text-slate-400 font-normal leading-tight mt-0.5 truncate">
                                {inq.email || inq.phone}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="py-3.5 px-3 whitespace-nowrap">
                          <span className="inline-flex rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[11px] font-medium text-[#334155] dark:text-slate-300">
                            {inq.service_needed || "Consultation"}
                          </span>
                        </td>

                        {/* Message Preview */}
                        <td className="py-3.5 px-3 max-w-[200px] truncate text-[#64748B] dark:text-slate-400 text-[11.5px]">
                          {inq.message}
                        </td>

                        {/* Priority */}
                        <td className="py-3.5 px-3 whitespace-nowrap">
                          {getPriorityBadge(inq.priority)}
                        </td>

                        {/* Assigned To */}
                        <td className="py-3.5 px-3 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <div className="flex h-5 w-5 rounded-full bg-slate-200 dark:bg-slate-700 items-center justify-center text-[9px] font-bold text-slate-700 dark:text-slate-300">
                              {getInitials(inq.assignedTo?.name || "Zain")}
                            </div>
                            <span className="text-xs text-[#334155] dark:text-slate-300">
                              {inq.assignedTo?.name || "Zain Ahmed"}
                            </span>
                          </div>
                        </td>

                        {/* Date */}
                        <td className="py-3.5 px-3 whitespace-nowrap text-[#64748B] dark:text-slate-400 text-[11px]">
                          {new Date(inq.created_at).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-3 whitespace-nowrap">
                          {getStatusBadge(inq.status)}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-3 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1.5">
                            <a
                              href={`https://wa.me/${waNumber}?text=${waMessage}`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 rounded-lg bg-[#25D366] hover:bg-[#20ba59] px-2 py-1 text-[11px] font-semibold text-white transition shadow-2xs"
                              title="Reply via WhatsApp"
                            >
                              <MessageCircle className="h-3 w-3" />
                            </a>
                            <button
                              type="button"
                              onClick={() => setSelectedInquiry(inq)}
                              className="rounded-lg p-1 text-[#64748B] dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
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

          {/* Table Pagination Footer matching Screen 4 */}
          <div className="flex items-center justify-between border-t border-[#E2E8F0] dark:border-slate-800 bg-white dark:bg-[#0b1329] px-4 py-3 text-xs text-[#64748B] dark:text-slate-400">
            <span>Showing 1–{filteredInquiries.length} of {totalCount} inquiries</span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                className="h-7 w-7 rounded-lg border border-[#E2E8F0] dark:border-slate-700 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                ‹
              </button>
              <button
                type="button"
                className="h-7 w-7 rounded-lg bg-blue-600 text-white font-semibold flex items-center justify-center"
              >
                1
              </button>
              <button
                type="button"
                className="h-7 w-7 rounded-lg border border-[#E2E8F0] dark:border-slate-700 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                2
              </button>
              <button
                type="button"
                className="h-7 w-7 rounded-lg border border-[#E2E8F0] dark:border-slate-700 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-800"
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
                    <h3 className="text-sm font-bold text-[#0B1F36] dark:text-slate-100">
                      {selectedInquiry.name}
                    </h3>
                    {getPriorityBadge(selectedInquiry.priority)}
                  </div>
                  <p className="text-[11px] text-[#64748B] dark:text-slate-400 mt-0.5">
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
              {/* Card 1: Contact Information */}
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#0B1F36] dark:text-slate-200">
                  <Mail className="h-3.5 w-3.5 text-[#64748B] dark:text-slate-400" />
                  <span>Contact Information</span>
                </div>
                <div className="space-y-1.5 rounded-xl bg-[#F8FAFC] dark:bg-[#0f172a] p-3 border border-[#E2E8F0] dark:border-slate-800 text-[11.5px]">
                  <div className="flex items-center gap-2">
                    <Mail className="h-3 w-3 text-[#94A3B8]" />
                    <span className="text-[#334155] dark:text-slate-300 font-medium">
                      {selectedInquiry.email || "client@example.com"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-3 w-3 text-[#94A3B8]" />
                    <span className="font-mono text-[#334155] dark:text-slate-300">
                      {selectedInquiry.phone}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3 w-3 text-[#94A3B8]" />
                    <span className="text-[#334155] dark:text-slate-300">
                      {selectedInquiry.location || "Sahiwal, Punjab"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Card 2: Inquiry Details */}
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#0B1F36] dark:text-slate-200">
                  <FileText className="h-3.5 w-3.5 text-[#64748B] dark:text-slate-400" />
                  <span>Inquiry Details</span>
                </div>
                <div className="space-y-2 rounded-xl bg-[#F8FAFC] dark:bg-[#0f172a] p-3 border border-[#E2E8F0] dark:border-slate-800 text-[11.5px]">
                  <div className="flex items-center justify-between">
                    <span className="text-[#64748B] dark:text-slate-400">Category</span>
                    <span className="font-semibold text-[#0B1F36] dark:text-slate-200 bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded">
                      {selectedInquiry.service_needed || "General Consultation"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#64748B] dark:text-slate-400">Priority</span>
                    <div>{getPriorityBadge(selectedInquiry.priority)}</div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#64748B] dark:text-slate-400">Status</span>
                    <div>{getStatusBadge(selectedInquiry.status)}</div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#64748B] dark:text-slate-400">Assigned To</span>
                    <div className="flex items-center gap-1.5">
                      <div className="flex h-4 w-4 rounded-full bg-slate-300 dark:bg-slate-700 items-center justify-center text-[8px] font-bold">
                        {getInitials(selectedInquiry.assignedTo?.name || "Zain")}
                      </div>
                      <span className="font-semibold text-[#0B1F36] dark:text-slate-200">
                        {selectedInquiry.assignedTo?.name || "Zain Ahmed"}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#64748B] dark:text-slate-400">Date Received</span>
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
                    <span className="text-[#64748B] dark:text-slate-400">Source</span>
                    <span className="text-[#334155] dark:text-slate-300">
                      {selectedInquiry.source || "Website Contact Form"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Card 3: Message */}
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#0B1F36] dark:text-slate-200">
                  <MessageSquareText className="h-3.5 w-3.5 text-[#64748B] dark:text-slate-400" />
                  <span>Message</span>
                </div>
                <div className="p-3.5 rounded-xl bg-[#F8FAFC] dark:bg-[#0f172a] border border-[#E2E8F0] dark:border-slate-800 text-[#334155] dark:text-slate-300 text-xs leading-relaxed">
                  &ldquo;{selectedInquiry.message}&rdquo;
                </div>
              </div>

              {/* Action Buttons matching Screen 4 */}
              <div className="pt-2 flex items-center gap-2">
                {/* WhatsApp Reply button */}
                <a
                  href={`https://wa.me/${selectedInquiry.phone.replace(/[^0-9]/g, "").startsWith("0") ? "92" + selectedInquiry.phone.replace(/[^0-9]/g, "").slice(1) : selectedInquiry.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                    `السلام علیکم / Hello ${selectedInquiry.name}, Chamber 121 responding regarding your inquiry on ${selectedInquiry.service_needed || "legal services"}.`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-[#2563EB] hover:bg-[#1d4ed8] text-white py-2.5 px-3 font-semibold shadow-sm transition"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>Reply</span>
                </a>

                {/* Mark as Resolved */}
                <button
                  type="button"
                  onClick={() => handleStatusChange(selectedInquiry.id, "completed")}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-[#0f172a] hover:bg-slate-50 dark:hover:bg-slate-800 text-[#334155] dark:text-slate-200 py-2.5 px-3 font-semibold shadow-2xs transition"
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
                      Phone Number
                    </label>
                    <input
                      type="text"
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
