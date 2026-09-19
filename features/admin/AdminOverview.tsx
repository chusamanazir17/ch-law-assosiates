"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Users,
  Mail,
  Clock,
  AlertTriangle,
  BarChart2,
  TrendingUp,
  ChevronDown,
  Zap,
  FileText,
  Image as ImageIcon,
  MessageSquare,
  ChevronRight,
  Megaphone,
  Layers,
  ExternalLink,
  Calendar,
  Plus,
  MoreHorizontal,
  LayoutGrid,
  Sliders,
  Compass,
  Check,
  X,
  Phone,
  MessageCircle,
} from "lucide-react";
import type { SubscriberAnalytics, SiteAnnouncement } from "@/types/cms";

interface InquiryItem {
  id: string;
  name: string;
  phone?: string;
  service_needed: string;
  message: string;
  created_at: string;
  status: "New" | "In Progress" | "Replied" | "Closed";
}

interface ActivityItem {
  id: string;
  title: string;
  subtitle: string;
  time: string;
  dotColor: string;
}

type Timeframe = "daily" | "weekly" | "monthly" | "yearly";

interface CategoryData {
  name: string;
  count: number;
  color: string;
  points: number[];
}

const TIMEFRAME_DATA: Record<Timeframe, { label: string; xLabels: string[]; categories: CategoryData[] }> = {
  daily: {
    label: "Daily (Today)",
    xLabels: ["00:00", "04:00", "08:00", "12:00", "16:00", "20:00"],
    categories: [
      { name: "Income Tax - Individuals & AOPs", count: 1, color: "#059669", points: [0, 0, 1, 1, 1, 1] },
      { name: "Property & Capital Value Tax", count: 1, color: "#0284c7", points: [0, 0, 0, 0, 1, 1] },
      { name: "Business & Corporate Tax", count: 0, color: "#ea580c", points: [0, 0, 0, 0, 0, 0] },
      { name: "Sales Tax (Federal & PRA)", count: 0, color: "#9333ea", points: [0, 0, 0, 0, 0, 0] },
    ],
  },
  weekly: {
    label: "Weekly (Last 7 Days)",
    xLabels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    categories: [
      { name: "Income Tax - Individuals & AOPs", count: 3, color: "#059669", points: [1, 1, 2, 2, 3, 3, 3] },
      { name: "Property & Capital Value Tax", count: 2, color: "#0284c7", points: [0, 1, 1, 1, 2, 2, 2] },
      { name: "Business & Corporate Tax", count: 2, color: "#ea580c", points: [1, 1, 1, 2, 2, 2, 2] },
      { name: "Sales Tax (Federal & PRA)", count: 1, color: "#9333ea", points: [0, 0, 1, 1, 1, 1, 1] },
    ],
  },
  monthly: {
    label: "Monthly (Last 30 Days)",
    xLabels: ["Aug 25", "Sep 01", "Sep 07", "Sep 13", "Sep 19"],
    categories: [
      { name: "Income Tax - Individuals & AOPs", count: 3, color: "#059669", points: [1, 2, 2, 3, 3] },
      { name: "Property & Capital Value Tax", count: 2, color: "#0284c7", points: [1, 1, 2, 2, 2] },
      { name: "Business & Corporate Tax", count: 2, color: "#ea580c", points: [0, 1, 1, 2, 2] },
      { name: "Sales Tax (Federal & PRA)", count: 1, color: "#9333ea", points: [0, 0, 1, 1, 1] },
    ],
  },
  yearly: {
    label: "Yearly (Year to Date)",
    xLabels: ["Jan", "Mar", "May", "Jul", "Sep"],
    categories: [
      { name: "Income Tax - Individuals & AOPs", count: 12, color: "#059669", points: [2, 5, 8, 10, 12] },
      { name: "Property & Capital Value Tax", count: 8, color: "#0284c7", points: [1, 3, 5, 7, 8] },
      { name: "Business & Corporate Tax", count: 9, color: "#ea580c", points: [2, 4, 6, 8, 9] },
      { name: "Sales Tax (Federal & PRA)", count: 5, color: "#9333ea", points: [1, 2, 3, 4, 5] },
    ],
  },
};

export default function AdminOverview() {
  const [, setIsLoading] = useState(true);

  // Timeframe states
  const [globalTimeframe, setGlobalTimeframe] = useState<Timeframe>("weekly");
  const [showGlobalDropdown, setShowGlobalDropdown] = useState(false);
  const [chartView, setChartView] = useState<"bars" | "graph">("bars");
  const [chartTimeframe, setChartTimeframe] = useState<Timeframe>("monthly");
  const [showChartDropdown, setShowChartDropdown] = useState(false);

  // Modals & Interactive States
  const [showAddConsultationModal, setShowAddConsultationModal] = useState(false);
  const [activeInquiryAction, setActiveInquiryAction] = useState<string | null>(null);
  const [selectedInquiryDetail, setSelectedInquiryDetail] = useState<InquiryItem | null>(null);

  // New Consultation Form State
  const [newClientName, setNewClientName] = useState("");
  const [newClientPhone, setNewClientPhone] = useState("");
  const [newClientService, setNewClientService] = useState("Income Tax Filing");
  const [newClientMessage, setNewClientMessage] = useState("");
  const [addConsultationSuccess, setAddConsultationSuccess] = useState(false);

  // Click outside handlers
  const globalRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (globalRef.current && !globalRef.current.contains(event.target as Node)) {
        setShowGlobalDropdown(false);
      }
      if (chartRef.current && !chartRef.current.contains(event.target as Node)) {
        setShowChartDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Email Signups Telemetry State
  const [subscriberAnalytics, setSubscriberAnalytics] = useState<SubscriberAnalytics>({
    totalEmails: 4,
    activeCount: 4,
    pendingCount: 0,
    unsubscribedCount: 0,
    suppressedCount: 0,
    categoryBreakdown: [],
    recentSignups: [],
  });

  // CMS Metrics State
  const [cmsStats, setCmsStats] = useState({
    totalPosts: 5,
    publishedPosts: 5,
    draftPosts: 0,
    totalMedia: 12,
    newInquiries: 1,
    activeNotice: null as SiteAnnouncement | null,
  });

  // Recent Inquiries State
  const [inquiries, setInquiries] = useState<InquiryItem[]>([
    {
      id: "inq-1",
      name: "Ali Khan",
      phone: "0300 9876543",
      service_needed: "Income Tax Filing",
      message: "Need guidance on salaried tax filing and wealth statement reconciliation.",
      created_at: "Sep 19, 2026",
      status: "New",
    },
    {
      id: "inq-2",
      name: "Sara Ahmed",
      phone: "0321 4567890",
      service_needed: "Property Tax",
      message: "Property tax calculation for commercial plot transfer in Sahiwal.",
      created_at: "Sep 18, 2026",
      status: "In Progress",
    },
    {
      id: "inq-3",
      name: "Bilal Hussain",
      phone: "0333 1122334",
      service_needed: "E-Stamp Services",
      message: "Need help with e-stamp Challan 32-A generation for registry.",
      created_at: "Sep 17, 2026",
      status: "Replied",
    },
    {
      id: "inq-4",
      name: "Ayesha Malik",
      phone: "0345 9988776",
      service_needed: "Corporate Tax",
      message: "Looking for consultation on business tax registration and PRA compliance.",
      created_at: "Sep 16, 2026",
      status: "Closed",
    },
  ]);

  // Recent Activity Items
  const activities: ActivityItem[] = [
    {
      id: "act-1",
      title: "New subscriber registered",
      subtitle: "from website signup form",
      time: "2 hours ago",
      dotColor: "bg-emerald-500",
    },
    {
      id: "act-2",
      title: "Page content updated",
      subtitle: "Services page modified",
      time: "4 hours ago",
      dotColor: "bg-blue-500",
    },
    {
      id: "act-3",
      title: "Media file uploaded",
      subtitle: "Homepage banner image",
      time: "6 hours ago",
      dotColor: "bg-blue-500",
    },
    {
      id: "act-4",
      title: "New inquiry received",
      subtitle: "From Ali Khan - Income Tax Filing",
      time: "9 hours ago",
      dotColor: "bg-amber-500",
    },
    {
      id: "act-5",
      title: "Site settings updated",
      subtitle: "General configuration",
      time: "1 day ago",
      dotColor: "bg-slate-400",
    },
  ];

  const loadData = async () => {
    try {
      const res = await fetch("/api/admin/overview");
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          if (json.subscriberAnalytics) {
            setSubscriberAnalytics((prev) => ({
              ...prev,
              ...json.subscriberAnalytics,
              totalEmails: json.subscriberAnalytics.totalEmails || 4,
              activeCount: json.subscriberAnalytics.activeCount || 4,
            }));
          }
          if (json.cmsStats) {
            setCmsStats((prev) => ({
              ...prev,
              ...json.cmsStats,
              totalPosts: json.cmsStats.totalPosts ?? 5,
              publishedPosts: json.cmsStats.publishedPosts ?? 5,
              totalMedia: json.cmsStats.totalMedia ?? 12,
              newInquiries: json.cmsStats.newInquiries ?? 1,
            }));
          }
          if (json.recentInquiries && json.recentInquiries.length > 0) {
            const mapped: InquiryItem[] = json.recentInquiries.map((inq: any) => ({
              id: inq.id,
              name: inq.name || "Client",
              phone: inq.phone || "0300 0000000",
              service_needed: inq.service_needed || "Tax Filing",
              message: inq.message || "Consultation request submitted.",
              created_at: inq.created_at
                ? new Date(inq.created_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                : "Recently",
              status:
                inq.status === "new"
                  ? "New"
                  : inq.status === "in_progress"
                  ? "In Progress"
                  : inq.status === "replied"
                  ? "Replied"
                  : "Closed",
            }));
            setInquiries(mapped);
          }
        }
      }
    } catch {
      // Retain baseline visual mock data if fetch fails
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddConsultationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName.trim()) return;

    const newInq: InquiryItem = {
      id: `inq-${Date.now()}`,
      name: newClientName.trim(),
      phone: newClientPhone.trim() || "0300 0000000",
      service_needed: newClientService,
      message: newClientMessage.trim() || "In-chamber consultation inquiry recorded.",
      created_at: "Just now",
      status: "New",
    };

    setInquiries((prev) => [newInq, ...prev]);
    setCmsStats((prev) => ({ ...prev, newInquiries: prev.newInquiries + 1 }));
    setAddConsultationSuccess(true);

    setTimeout(() => {
      setNewClientName("");
      setNewClientPhone("");
      setNewClientMessage("");
      setAddConsultationSuccess(false);
      setShowAddConsultationModal(false);
    }, 1000);
  };

  const handleUpdateStatus = (id: string, newStatus: "New" | "In Progress" | "Replied" | "Closed") => {
    setInquiries((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
    );
    setActiveInquiryAction(null);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "New":
        return (
          <span className="inline-flex items-center rounded bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
            New
          </span>
        );
      case "In Progress":
        return (
          <span className="inline-flex items-center rounded bg-sky-50 px-2 py-0.5 text-[11px] font-semibold text-sky-700">
            In Progress
          </span>
        );
      case "Replied":
        return (
          <span className="inline-flex items-center rounded bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
            Replied
          </span>
        );
      case "Closed":
      default:
        return (
          <span className="inline-flex items-center rounded bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
            Closed
          </span>
        );
    }
  };

  const currentChartData = TIMEFRAME_DATA[chartTimeframe];

  // Helper to render SVG line paths for chart
  const renderSvgChart = () => {
    const width = 560;
    const height = 180;
    const padX = 40;
    const padY = 25;

    const allValues = currentChartData.categories.flatMap((c) => c.points);
    const maxVal = Math.max(...allValues, 1);

    const getX = (index: number, total: number) => {
      return padX + (index / (total - 1)) * (width - padX * 2);
    };

    const getY = (val: number) => {
      return height - padY - (val / maxVal) * (height - padY * 2);
    };

    return (
      <div className="w-full overflow-hidden pt-2">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-44 overflow-visible">
          <defs>
            {currentChartData.categories.map((cat, i) => (
              <linearGradient key={cat.name} id={`grad-${i}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={cat.color} stopOpacity="0.25" />
                <stop offset="100%" stopColor={cat.color} stopOpacity="0.0" />
              </linearGradient>
            ))}
          </defs>

          {/* Horizontal Grid lines */}
          {[0, 0.5, 1].map((pct, idx) => {
            const y = padY + pct * (height - padY * 2);
            return (
              <g key={idx}>
                <line
                  x1={padX}
                  y1={y}
                  x2={width - padX}
                  y2={y}
                  stroke="#e2e8f0"
                  strokeDasharray="4 4"
                  strokeWidth="1"
                />
                <text
                  x={padX - 8}
                  y={y + 3}
                  textAnchor="end"
                  fontSize="9"
                  fill="#94a3b8"
                  className="font-mono font-medium"
                >
                  {Math.round(maxVal * (1 - pct))}
                </text>
              </g>
            );
          })}

          {/* Category Lines & Area */}
          {currentChartData.categories.map((cat, catIdx) => {
            const points = cat.points;
            const pathCommands = points.map((p, i) => {
              const x = getX(i, points.length);
              const y = getY(p);
              return `${i === 0 ? "M" : "L"} ${x} ${y}`;
            });
            const linePath = pathCommands.join(" ");
            const areaPath = `${linePath} L ${getX(points.length - 1, points.length)} ${height - padY} L ${getX(0, points.length)} ${height - padY} Z`;

            return (
              <g key={cat.name}>
                {/* Area Gradient Fill */}
                <path d={areaPath} fill={`url(#grad-${catIdx})`} />

                {/* Main Line */}
                <path
                  d={linePath}
                  fill="none"
                  stroke={cat.color}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Point Dots */}
                {points.map((p, i) => {
                  const cx = getX(i, points.length);
                  const cy = getY(p);
                  return (
                    <circle
                      key={i}
                      cx={cx}
                      cy={cy}
                      r="3.5"
                      fill="#ffffff"
                      stroke={cat.color}
                      strokeWidth="2"
                      className="cursor-pointer hover:r-5 transition-all"
                    >
                      <title>{`${cat.name}: ${p} subscriber(s)`}</title>
                    </circle>
                  );
                })}
              </g>
            );
          })}

          {/* X Axis Labels */}
          {currentChartData.xLabels.map((lbl, idx) => {
            const x = getX(idx, currentChartData.xLabels.length);
            return (
              <text
                key={lbl}
                x={x}
                y={height - 5}
                textAnchor="middle"
                fontSize="10"
                fill="#64748b"
                className="font-medium"
              >
                {lbl}
              </text>
            );
          })}
        </svg>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-center gap-4 mt-3 pt-3 border-t border-slate-100 text-xs">
          {currentChartData.categories.map((cat) => (
            <div key={cat.name} className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
              <span className="text-slate-600 font-medium">{cat.name}</span>
              <span className="font-bold text-slate-800">({cat.count})</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-5 max-w-7xl mx-auto font-sans pb-10">
      {/* 1. Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
        <span>Office CMS</span>
        <span className="text-slate-400">›</span>
        <span className="text-slate-800 font-semibold">Dashboard</span>
      </div>

      {/* 2. Main Title & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Monitor client subscriber signups, manage legal content, and review inquiries.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          {/* Interactive Date Range Dropdown */}
          <div ref={globalRef} className="relative">
            <button
              type="button"
              onClick={() => setShowGlobalDropdown((prev) => !prev)}
              className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-2xs hover:bg-slate-50 transition"
              aria-expanded={showGlobalDropdown}
            >
              <Calendar className="h-3.5 w-3.5 text-slate-400" />
              <span>{TIMEFRAME_DATA[globalTimeframe].label}</span>
              <ChevronDown className="h-3.5 w-3.5 text-slate-400 ml-0.5" />
            </button>

            {showGlobalDropdown && (
              <div className="absolute right-0 mt-1.5 w-52 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl z-50 text-xs">
                {(["daily", "weekly", "monthly", "yearly"] as Timeframe[]).map((tf) => (
                  <button
                    key={tf}
                    type="button"
                    onClick={() => {
                      setGlobalTimeframe(tf);
                      setChartTimeframe(tf);
                      setShowGlobalDropdown(false);
                    }}
                    className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left transition ${
                      globalTimeframe === tf
                        ? "bg-[#eef7f2] font-bold text-[#075e38]"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <span>{TIMEFRAME_DATA[tf].label}</span>
                    {globalTimeframe === tf && <Check className="h-3.5 w-3.5 text-[#075e38]" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Create Post Button */}
          <Link
            href="/admin/posts/editor"
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#075e38] hover:bg-[#064e2e] text-white px-3.5 py-1.5 text-xs font-semibold shadow-2xs transition"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Create Post</span>
          </Link>

          {/* Media Button */}
          <Link
            href="/admin/media"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 px-3 py-1.5 text-xs font-semibold shadow-2xs transition"
          >
            <ImageIcon className="h-3.5 w-3.5 text-slate-500" />
            <span>Media</span>
          </Link>
        </div>
      </div>

      {/* 3. Section 1: Email Signups & Audience Telemetry */}
      <div className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-4 border-b border-slate-100">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-[#075e38]">
              <Mail className="h-4.5 w-4.5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Email Signups & Audience Telemetry
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Live counter and status of clients registered for automated tax deadline reminders.
              </p>
            </div>
          </div>
          <Link
            href="/admin/subscribers"
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#075e38] hover:underline"
          >
            <span>View All Subscribers</span>
            <span>→</span>
          </Link>
        </div>

        {/* 4 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
          {/* Card 1: Total Subscribers */}
          <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">Total Subscribers</p>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-2xl font-bold text-slate-900">
                    {subscriberAnalytics.totalEmails}
                  </span>
                  <span className="text-[11px] font-semibold text-emerald-600">
                    ↑ +2 this month
                  </span>
                </div>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 mt-2.5">
              Clients opted-in via website reminders.
            </p>
          </div>

          {/* Card 2: Active Recipients */}
          <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Mail className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">Active Recipients</p>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-2xl font-bold text-slate-900">
                    {subscriberAnalytics.activeCount}
                  </span>
                  <span className="inline-flex items-center rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                    100% active
                  </span>
                </div>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 mt-2.5">
              Receiving statutory reminder dispatches.
            </p>
          </div>

          {/* Card 3: Pending Verification */}
          <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">Pending Verification</p>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-2xl font-bold text-slate-900">
                    {subscriberAnalytics.pendingCount}
                  </span>
                  <span className="inline-flex items-center rounded-full bg-amber-50 border border-amber-200 px-2 py-0.5 text-[10px] font-semibold text-amber-800">
                    Double opt-in
                  </span>
                </div>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 mt-2.5">
              Awaiting verification link confirmation.
            </p>
          </div>

          {/* Card 4: Opted-Out */}
          <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">Opted-Out</p>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-2xl font-bold text-slate-900">
                    {subscriberAnalytics.unsubscribedCount + subscriberAnalytics.suppressedCount}
                  </span>
                  <span className="inline-flex items-center rounded-full bg-slate-100 border border-slate-200 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                    Inactive
                  </span>
                </div>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 mt-2.5">
              Safe unsubscription links honored.
            </p>
          </div>
        </div>
      </div>

      {/* 4. Section 2: Two Columns (Subscriber Interest / Chart & Quick Actions) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Column: Subscriber Interest with BARS & GRAPH TOGGLE (Span 2) */}
        <div className="lg:col-span-2 rounded-xl border border-slate-200/90 bg-white p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <BarChart2 className="h-4.5 w-4.5 text-[#075e38]" />
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Subscriber Interest by Tax Category
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Top categories based on subscriber interest and content engagement.
                  </p>
                </div>
              </div>

              {/* View Switcher & Timeframe Buttons */}
              <div className="flex items-center gap-2">
                {/* Switcher between Bars & Line Graph */}
                <div className="flex items-center rounded-lg bg-slate-100 p-0.5 border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setChartView("bars")}
                    className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-semibold transition ${
                      chartView === "bars"
                        ? "bg-white text-[#075e38] shadow-2xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                    title="View as Horizontal Bars"
                  >
                    <BarChart2 className="h-3.5 w-3.5" />
                    <span>Bars</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setChartView("graph")}
                    className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-semibold transition ${
                      chartView === "graph"
                        ? "bg-white text-[#075e38] shadow-2xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                    title="View as Line Graph & Chart"
                  >
                    <TrendingUp className="h-3.5 w-3.5" />
                    <span>Graph</span>
                  </button>
                </div>

                {/* Dropdown for timeframe */}
                <div ref={chartRef} className="relative">
                  <button
                    type="button"
                    onClick={() => setShowChartDropdown((prev) => !prev)}
                    className="flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 shadow-2xs hover:bg-slate-50 transition"
                  >
                    <span>{TIMEFRAME_DATA[chartTimeframe].label}</span>
                    <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                  </button>

                  {showChartDropdown && (
                    <div className="absolute right-0 mt-1.5 w-44 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl z-50 text-xs">
                      {(["daily", "weekly", "monthly", "yearly"] as Timeframe[]).map((tf) => (
                        <button
                          key={tf}
                          type="button"
                          onClick={() => {
                            setChartTimeframe(tf);
                            setShowChartDropdown(false);
                          }}
                          className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left transition ${
                            chartTimeframe === tf
                              ? "bg-[#eef7f2] font-bold text-[#075e38]"
                              : "text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          <span>{TIMEFRAME_DATA[tf].label}</span>
                          {chartTimeframe === tf && <Check className="h-3.5 w-3.5 text-[#075e38]" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Render Bars View OR Graph/Line Chart View */}
            {chartView === "bars" ? (
              <div className="mt-5 space-y-3.5">
                {currentChartData.categories.map((cat) => {
                  const maxCount = Math.max(...currentChartData.categories.map((c) => c.count), 1);
                  const percentage = Math.max(12, Math.round((cat.count / maxCount) * 100));

                  return (
                    <div key={cat.name} className="flex items-center gap-4 text-xs">
                      <span className="w-56 shrink-0 font-medium text-slate-700 truncate">
                        {cat.name}
                      </span>
                      <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%`, backgroundColor: cat.color }}
                        />
                      </div>
                      <span className="w-4 text-right font-bold text-slate-800 shrink-0">
                        {cat.count}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              renderSvgChart()
            )}
          </div>
        </div>

        {/* Right Column: Quick Actions (Span 1) */}
        <div className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
              <Zap className="h-4.5 w-4.5 text-[#075e38]" />
              <div>
                <h3 className="text-sm font-bold text-slate-900">Quick Actions</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Common tasks for content and client management.
                </p>
              </div>
            </div>

            {/* 2x2 Action Buttons Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-3.5">
              {/* Action 1: Create Post */}
              <Link
                href="/admin/posts/editor"
                className="group flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50/60 p-2.5 transition hover:border-emerald-200 hover:bg-white hover:shadow-2xs"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                    <FileText className="h-3.5 w-3.5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800 group-hover:text-emerald-800 truncate">
                      Create Post
                    </p>
                    <p className="text-[10.5px] text-slate-400 truncate">Publish news or updates</p>
                  </div>
                </div>
                <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-400 group-hover:text-emerald-700 transition" />
              </Link>

              {/* Action 2: Media Library */}
              <Link
                href="/admin/media"
                className="group flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50/60 p-2.5 transition hover:border-blue-200 hover:bg-white hover:shadow-2xs"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                    <ImageIcon className="h-3.5 w-3.5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800 group-hover:text-blue-800 truncate">
                      Media Library
                    </p>
                    <p className="text-[10.5px] text-slate-400 truncate">Manage images & files</p>
                  </div>
                </div>
                <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-400 group-hover:text-blue-700 transition" />
              </Link>

              {/* Action 3: Add Consultation (Interactive Modal Trigger) */}
              <button
                type="button"
                onClick={() => setShowAddConsultationModal(true)}
                className="group flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50/60 p-2.5 text-left transition hover:border-orange-200 hover:bg-white hover:shadow-2xs"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-orange-700">
                    <MessageSquare className="h-3.5 w-3.5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800 group-hover:text-orange-800 truncate">
                      Add Consultation
                    </p>
                    <p className="text-[10.5px] text-slate-400 truncate">Track client inquiries</p>
                  </div>
                </div>
                <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-400 group-hover:text-orange-700 transition" />
              </button>

              {/* Action 4: E-Stamp Services */}
              <Link
                href="/admin/services"
                className="group flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50/60 p-2.5 transition hover:border-purple-200 hover:bg-white hover:shadow-2xs"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-purple-50 text-purple-700">
                    <Compass className="h-3.5 w-3.5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800 group-hover:text-purple-800 truncate">
                      E-Stamp Services
                    </p>
                    <p className="text-[10.5px] text-slate-400 truncate">Manage e-stamp content</p>
                  </div>
                </div>
                <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-400 group-hover:text-purple-700 transition" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Section 3: Overview Metric Cards (4 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Articles & Posts */}
        <Link
          href="/admin/posts"
          className="group rounded-xl border border-slate-200/90 bg-white p-4 shadow-2xs hover:border-emerald-300 transition flex items-center justify-between"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
              <FileText className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-800 truncate">Articles & Posts</p>
              <p className="text-2xl font-bold text-slate-900 mt-0.5">
                {cmsStats.totalPosts}
              </p>
              <p className="text-[11px] text-slate-400 truncate">
                {cmsStats.publishedPosts} published • {cmsStats.draftPosts} draft
              </p>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 shrink-0 text-slate-400 group-hover:text-slate-700 transition" />
        </Link>

        {/* Card 2: Media & Images */}
        <Link
          href="/admin/media"
          className="group rounded-xl border border-slate-200/90 bg-white p-4 shadow-2xs hover:border-blue-300 transition flex items-center justify-between"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
              <ImageIcon className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-800 truncate">Media & Images</p>
              <p className="text-2xl font-bold text-slate-900 mt-0.5">
                {cmsStats.totalMedia}
              </p>
              <p className="text-[11px] text-slate-400 truncate">Stored image assets & banners</p>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 shrink-0 text-slate-400 group-hover:text-slate-700 transition" />
        </Link>

        {/* Card 3: Consultation Leads */}
        <Link
          href="/admin/inquiries"
          className="group rounded-xl border border-slate-200/90 bg-white p-4 shadow-2xs hover:border-emerald-300 transition flex items-center justify-between"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
              <MessageSquare className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-xs font-bold text-slate-800 truncate">Consultation Leads</p>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-2xl font-bold text-slate-900">
                  {cmsStats.newInquiries}
                </span>
                <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-800">
                  NEW
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate">Direct client requests</p>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 shrink-0 text-slate-400 group-hover:text-slate-700 transition" />
        </Link>

        {/* Card 4: Site Notice / Ticker */}
        <Link
          href="/admin/announcements"
          className="group rounded-xl border border-slate-200/90 bg-white p-4 shadow-2xs hover:border-amber-300 transition flex items-center justify-between"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
              <Megaphone className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-800 truncate">Site Notice / Ticker</p>
              <p className="text-2xl font-bold text-slate-900 mt-0.5">0</p>
              <p className="text-[11px] text-slate-400 truncate">No active announcement</p>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 shrink-0 text-slate-400 group-hover:text-slate-700 transition" />
        </Link>
      </div>

      {/* 6. Section 4: Website Content Management Hub */}
      <div className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <Layers className="h-5 w-5 text-[#075e38]" />
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Website Content Management Hub
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Customize text, headlines, hero photography, legal practices, and navigation in real time.
              </p>
            </div>
          </div>
          <Link
            href="/"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#075e38] hover:underline"
          >
            <span>Open Public Website</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* 4 Hub Action Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mt-4">
          {/* Hub 1: Page Content Editor */}
          <Link
            href="/admin/pages"
            className="group flex items-center justify-between rounded-xl border border-slate-200/80 bg-slate-50/50 p-3.5 transition hover:border-emerald-300 hover:bg-white hover:shadow-2xs"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                <FileText className="h-4.5 w-4.5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900 group-hover:text-emerald-800 truncate">
                  Page Content Editor
                </p>
                <p className="text-[11px] text-slate-500 truncate">Manage pages, about, legal info</p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 shrink-0 text-slate-400 group-hover:text-emerald-700 transition" />
          </Link>

          {/* Hub 2: Service Categories */}
          <Link
            href="/admin/services"
            className="group flex items-center justify-between rounded-xl border border-slate-200/80 bg-slate-50/50 p-3.5 transition hover:border-blue-300 hover:bg-white hover:shadow-2xs"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                <LayoutGrid className="h-4.5 w-4.5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900 group-hover:text-blue-800 truncate">
                  Service Categories
                </p>
                <p className="text-[11px] text-slate-500 truncate">Organize tax & e-stamp services</p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 shrink-0 text-slate-400 group-hover:text-blue-700 transition" />
          </Link>

          {/* Hub 3: Featured Sections */}
          <Link
            href="/admin/pages"
            className="group flex items-center justify-between rounded-xl border border-slate-200/80 bg-slate-50/50 p-3.5 transition hover:border-amber-300 hover:bg-white hover:shadow-2xs"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-700">
                <Sliders className="h-4.5 w-4.5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900 group-hover:text-amber-800 truncate">
                  Featured Sections
                </p>
                <p className="text-[11px] text-slate-500 truncate">Update homepage content</p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 shrink-0 text-slate-400 group-hover:text-amber-700 transition" />
          </Link>

          {/* Hub 4: Media Management */}
          <Link
            href="/admin/media"
            className="group flex items-center justify-between rounded-xl border border-slate-200/80 bg-slate-50/50 p-3.5 transition hover:border-purple-300 hover:bg-white hover:shadow-2xs"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-purple-50 text-purple-700">
                <ImageIcon className="h-4.5 w-4.5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900 group-hover:text-purple-800 truncate">
                  Media Management
                </p>
                <p className="text-[11px] text-slate-500 truncate">Upload & manage files</p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 shrink-0 text-slate-400 group-hover:text-purple-700 transition" />
          </Link>
        </div>
      </div>

      {/* 7. Section 5: Two Columns (Recent Inquiries & Recent Activity) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Column: Recent Inquiries Table (Span 2) */}
        <div className="lg:col-span-2 rounded-xl border border-slate-200/90 bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <Users className="h-4.5 w-4.5 text-[#075e38]" />
              <div>
                <h3 className="text-sm font-bold text-slate-900">Recent Inquiries</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Latest consultation requests from website visitors.
                </p>
              </div>
            </div>
            <Link
              href="/admin/inquiries"
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#075e38] hover:underline"
            >
              <span>View All Inquiries</span>
              <span>→</span>
            </Link>
          </div>

          {/* Table */}
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-semibold text-slate-400">
                  <th className="pb-2.5 font-medium">Name</th>
                  <th className="pb-2.5 font-medium">Service Interest</th>
                  <th className="pb-2.5 font-medium">Message</th>
                  <th className="pb-2.5 font-medium">Date</th>
                  <th className="pb-2.5 font-medium">Status</th>
                  <th className="pb-2.5 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {inquiries.map((inq) => (
                  <tr key={inq.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 font-semibold text-slate-900 pr-2 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => setSelectedInquiryDetail(inq)}
                        className="hover:text-[#075e38] hover:underline text-left font-semibold"
                      >
                        {inq.name}
                      </button>
                    </td>
                    <td className="py-3 text-slate-600 pr-2 whitespace-nowrap">
                      {inq.service_needed}
                    </td>
                    <td className="py-3 text-slate-500 max-w-[200px] truncate pr-2">
                      {inq.message}
                    </td>
                    <td className="py-3 text-slate-500 whitespace-nowrap pr-2">
                      {inq.created_at}
                    </td>
                    <td className="py-3 whitespace-nowrap pr-2">
                      {getStatusBadge(inq.status)}
                    </td>
                    <td className="py-3 text-right relative">
                      <button
                        type="button"
                        onClick={() =>
                          setActiveInquiryAction((prev) => (prev === inq.id ? null : inq.id))
                        }
                        className="inline-flex h-7 w-7 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
                        title="Actions"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </button>

                      {/* Dropdown Action Menu */}
                      {activeInquiryAction === inq.id && (
                        <div className="absolute right-0 top-10 w-44 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl z-50 text-xs text-left">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedInquiryDetail(inq);
                              setActiveInquiryAction(null);
                            }}
                            className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-slate-700 hover:bg-slate-50"
                          >
                            <FileText className="h-3.5 w-3.5 text-slate-400" />
                            <span>View Details</span>
                          </button>

                          {inq.phone && (
                            <a
                              href={`https://wa.me/${inq.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                                `Hello ${inq.name}, thank you for reaching out to Chaudhry Law Associates regarding ${inq.service_needed}.`
                              )}`}
                              target="_blank"
                              rel="noreferrer"
                              onClick={() => setActiveInquiryAction(null)}
                              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-emerald-700 hover:bg-emerald-50"
                            >
                              <MessageCircle className="h-3.5 w-3.5" />
                              <span>WhatsApp Reply</span>
                            </a>
                          )}

                          <div className="my-1 border-t border-slate-100" />
                          <p className="px-2 py-1 text-[10px] font-bold uppercase text-slate-400">
                            Change Status
                          </p>

                          {(["New", "In Progress", "Replied", "Closed"] as const).map((st) => (
                            <button
                              key={st}
                              type="button"
                              onClick={() => handleUpdateStatus(inq.id, st)}
                              className={`flex w-full items-center justify-between rounded-lg px-2 py-1 text-[11px] ${
                                inq.status === st
                                  ? "font-bold text-[#075e38] bg-[#eef7f2]"
                                  : "text-slate-600 hover:bg-slate-50"
                              }`}
                            >
                              <span>{st}</span>
                              {inq.status === st && <Check className="h-3 w-3 text-[#075e38]" />}
                            </button>
                          ))}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Recent Activity (Span 1) */}
        <div className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Clock className="h-4.5 w-4.5 text-[#075e38]" />
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Recent Activity</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Latest updates in your CMS.</p>
                </div>
              </div>
              <Link
                href="/admin/history"
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#075e38] hover:underline"
              >
                <span>View All Activity</span>
                <span>→</span>
              </Link>
            </div>

            {/* Activity List */}
            <div className="mt-4 space-y-3.5">
              {activities.map((act) => (
                <div key={act.id} className="flex items-start justify-between gap-3 text-xs">
                  <div className="flex items-start gap-2.5 min-w-0">
                    <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${act.dotColor}`} />
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-800 truncate">{act.title}</p>
                      <p className="text-[11px] text-slate-400 truncate">{act.subtitle}</p>
                    </div>
                  </div>
                  <span className="shrink-0 text-[11px] text-slate-400 whitespace-nowrap">
                    {act.time}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* MODAL 1: ADD CONSULTATION */}
      {showAddConsultationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-50 text-orange-700">
                  <MessageSquare className="h-4 w-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Add New Client Consultation</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddConsultationModal(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {addConsultationSuccess ? (
              <div className="my-8 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mb-3">
                  <Check className="h-6 w-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-900">Consultation Recorded!</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Client inquiry has been added to your dashboard list.
                </p>
              </div>
            ) : (
              <form onSubmit={handleAddConsultationSubmit} className="mt-4 space-y-3.5 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Client Name *</label>
                  <input
                    type="text"
                    required
                    value={newClientName}
                    onChange={(e) => setNewClientName(e.target.value)}
                    placeholder="e.g. Muhammad Usman"
                    className="w-full rounded-lg border border-slate-200 bg-slate-50/60 px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:border-[#075e38] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#075e38]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={newClientPhone}
                    onChange={(e) => setNewClientPhone(e.target.value)}
                    placeholder="e.g. 0300 1234567"
                    className="w-full rounded-lg border border-slate-200 bg-slate-50/60 px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:border-[#075e38] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#075e38]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Service Required
                  </label>
                  <select
                    value={newClientService}
                    onChange={(e) => setNewClientService(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50/60 px-3 py-2 text-slate-900 focus:border-[#075e38] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#075e38]"
                  >
                    <option value="Income Tax Filing">FBR Income Tax Filing</option>
                    <option value="Property Tax">Property & Capital Value Tax</option>
                    <option value="E-Stamp Services">E-Stamp Challan 32-A</option>
                    <option value="Business Registration">Business / NTN Registration</option>
                    <option value="Registry & Legal Deeds">Registry & Legal Deeds</option>
                    <option value="Court Litigation">Civil & Criminal Legal Matters</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Consultation Notes / Message
                  </label>
                  <textarea
                    rows={3}
                    value={newClientMessage}
                    onChange={(e) => setNewClientMessage(e.target.value)}
                    placeholder="Enter discussion notes or client requirement..."
                    className="w-full rounded-lg border border-slate-200 bg-slate-50/60 px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:border-[#075e38] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#075e38]"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowAddConsultationModal(false)}
                    className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-lg bg-[#075e38] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#064e2e] shadow-2xs transition"
                  >
                    Save Consultation
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* MODAL 2: INQUIRY DETAILS */}
      {selectedInquiryDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                  <Users className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {selectedInquiryDetail.name}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Received on {selectedInquiryDetail.created_at}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedInquiryDetail(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <div className="grid grid-cols-2 gap-3 bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                <div>
                  <p className="text-[11px] font-semibold text-slate-400">Service Interest</p>
                  <p className="text-xs font-bold text-slate-800 mt-0.5">
                    {selectedInquiryDetail.service_needed}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-slate-400">Status</p>
                  <div className="mt-0.5">{getStatusBadge(selectedInquiryDetail.status)}</div>
                </div>
              </div>

              <div>
                <p className="text-[11px] font-semibold text-slate-400">Client Phone</p>
                <p className="text-xs font-bold text-slate-800 mt-0.5">
                  {selectedInquiryDetail.phone || "Not provided"}
                </p>
              </div>

              <div>
                <p className="text-[11px] font-semibold text-slate-400">Message / Inquiry Details</p>
                <div className="mt-1 p-3 rounded-xl bg-slate-50 border border-slate-100 text-slate-700 leading-relaxed">
                  {selectedInquiryDetail.message}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 pt-4 mt-4 border-t border-slate-100">
              {selectedInquiryDetail.phone ? (
                <div className="flex items-center gap-2">
                  <a
                    href={`https://wa.me/${selectedInquiryDetail.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                      `Assalam-o-Alaikum ${selectedInquiryDetail.name}, Chaudhry Law Associates responding regarding your inquiry on ${selectedInquiryDetail.service_needed}.`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#25D366] hover:bg-[#20ba59] text-white px-3 py-1.5 font-bold shadow-2xs transition"
                  >
                    <MessageCircle className="h-3.5 w-3.5" />
                    <span>WhatsApp</span>
                  </a>
                  <a
                    href={`tel:${selectedInquiryDetail.phone.replace(/[^0-9]/g, "")}`}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 px-3 py-1.5 font-bold shadow-2xs transition"
                  >
                    <Phone className="h-3.5 w-3.5 text-slate-400" />
                    <span>Call</span>
                  </a>
                </div>
              ) : (
                <div />
              )}

              <button
                type="button"
                onClick={() => setSelectedInquiryDetail(null)}
                className="rounded-lg bg-slate-900 hover:bg-slate-800 text-white px-4 py-1.5 font-semibold shadow-2xs transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
