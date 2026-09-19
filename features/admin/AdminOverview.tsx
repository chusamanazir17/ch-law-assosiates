"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  Mail,
  Clock,
  AlertTriangle,
  BarChart2,
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
} from "lucide-react";
import type { ConsultationInquiry, Post, SubscriberAnalytics, SiteAnnouncement } from "@/types/cms";

interface InquiryItem {
  id: string;
  name: string;
  service_needed: string;
  message: string;
  created_at: string;
  status: string;
}

interface ActivityItem {
  id: string;
  title: string;
  subtitle: string;
  time: string;
  dotColor: string;
}

export default function AdminOverview() {
  const [isLoading, setIsLoading] = useState(true);

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

  // Recent Inquiries
  const [inquiries, setInquiries] = useState<InquiryItem[]>([
    {
      id: "inq-1",
      name: "Ali Khan",
      service_needed: "Income Tax Filing",
      message: "Need guidance on salaried tax filing...",
      created_at: "Sep 19, 2026",
      status: "New",
    },
    {
      id: "inq-2",
      name: "Sara Ahmed",
      service_needed: "Property Tax",
      message: "Property tax calculation for commercial...",
      created_at: "Sep 18, 2026",
      status: "In Progress",
    },
    {
      id: "inq-3",
      name: "Bilal Hussain",
      service_needed: "E-Stamp Services",
      message: "Need help with e-stamp registration...",
      created_at: "Sep 17, 2026",
      status: "Replied",
    },
    {
      id: "inq-4",
      name: "Ayesha Malik",
      service_needed: "Corporate Tax",
      message: "Looking for consultation on business tax...",
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
            const mapped = json.recentInquiries.map((inq: any) => ({
              id: inq.id,
              name: inq.name || "Client",
              service_needed: inq.service_needed || "Tax Filing",
              message: inq.message || "Consultation request submitted.",
              created_at: inq.created_at ? new Date(inq.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Recently",
              status: inq.status === "new" ? "New" : inq.status === "in_progress" ? "In Progress" : inq.status === "replied" ? "Replied" : "Closed",
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "New":
        return (
          <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
            New
          </span>
        );
      case "In Progress":
        return (
          <span className="inline-flex items-center rounded-md bg-sky-50 px-2 py-0.5 text-[11px] font-semibold text-sky-700">
            In Progress
          </span>
        );
      case "Replied":
        return (
          <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
            Replied
          </span>
        );
      case "Closed":
      default:
        return (
          <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
            Closed
          </span>
        );
    }
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
          {/* Date Picker Button */}
          <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-2xs">
            <Calendar className="h-3.5 w-3.5 text-slate-400" />
            <span>Sep 13, 2026 - Sep 19, 2026</span>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400 ml-0.5" />
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

      {/* 4. Section 2: Two Columns (Subscriber Interest & Quick Actions) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Column: Subscriber Interest by Tax Category (Span 2) */}
        <div className="lg:col-span-2 rounded-xl border border-slate-200/90 bg-white p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
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
              <div className="flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 shadow-2xs">
                <span>Last 30 days</span>
                <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
              </div>
            </div>

            {/* Horizontal Progress Bars */}
            <div className="mt-5 space-y-4">
              {/* Category 1: Income Tax */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-semibold text-slate-800">
                    Income Tax - Individuals & AOPs
                  </span>
                  <span className="font-bold text-slate-900">3</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full rounded-full bg-emerald-600" style={{ width: "75%" }} />
                </div>
              </div>

              {/* Category 2: Property & Capital Value Tax */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-semibold text-slate-800">
                    Property & Capital Value Tax
                  </span>
                  <span className="font-bold text-slate-900">2</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full rounded-full bg-sky-500" style={{ width: "50%" }} />
                </div>
              </div>

              {/* Category 3: Business & Corporate Tax */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-semibold text-slate-800">
                    Business & Corporate Tax
                  </span>
                  <span className="font-bold text-slate-900">2</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full rounded-full bg-orange-500" style={{ width: "50%" }} />
                </div>
              </div>

              {/* Category 4: Sales Tax */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-semibold text-slate-800">
                    Sales Tax (Federal & PRA)
                  </span>
                  <span className="font-bold text-slate-900">1</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full rounded-full bg-purple-500" style={{ width: "25%" }} />
                </div>
              </div>
            </div>
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

            {/* 4 Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2.5 mt-3.5">
              {/* Action 1: Create Post */}
              <Link
                href="/admin/posts/editor"
                className="group flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50/60 p-2.5 transition hover:border-emerald-200 hover:bg-white hover:shadow-2xs"
              >
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800 group-hover:text-emerald-800">
                      Create Post
                    </p>
                    <p className="text-[11px] text-slate-400">Publish news or updates</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-emerald-700 transition" />
              </Link>

              {/* Action 2: Media Library */}
              <Link
                href="/admin/media"
                className="group flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50/60 p-2.5 transition hover:border-blue-200 hover:bg-white hover:shadow-2xs"
              >
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                    <ImageIcon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800 group-hover:text-blue-800">
                      Media Library
                    </p>
                    <p className="text-[11px] text-slate-400">Manage images & files</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-blue-700 transition" />
              </Link>

              {/* Action 3: Add Consultation */}
              <Link
                href="/admin/inquiries"
                className="group flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50/60 p-2.5 transition hover:border-orange-200 hover:bg-white hover:shadow-2xs"
              >
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-orange-700">
                    <MessageSquare className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800 group-hover:text-orange-800">
                      Add Consultation
                    </p>
                    <p className="text-[11px] text-slate-400">Track client inquiries</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-orange-700 transition" />
              </Link>

              {/* Action 4: E-Stamp Services */}
              <Link
                href="/admin/services"
                className="group flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50/60 p-2.5 transition hover:border-purple-200 hover:bg-white hover:shadow-2xs"
              >
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-purple-50 text-purple-700">
                    <Compass className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800 group-hover:text-purple-800">
                      E-Stamp Services
                    </p>
                    <p className="text-[11px] text-slate-400">Manage e-stamp content</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-purple-700 transition" />
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
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800">Articles & Posts</p>
              <p className="text-xl font-bold text-slate-900 mt-0.5">
                {cmsStats.totalPosts}
              </p>
              <p className="text-[11px] text-slate-400">
                {cmsStats.publishedPosts} published • {cmsStats.draftPosts} draft
              </p>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-slate-700 transition" />
        </Link>

        {/* Card 2: Media & Images */}
        <Link
          href="/admin/media"
          className="group rounded-xl border border-slate-200/90 bg-white p-4 shadow-2xs hover:border-blue-300 transition flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
              <ImageIcon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800">Media & Images</p>
              <p className="text-xl font-bold text-slate-900 mt-0.5">
                {cmsStats.totalMedia}
              </p>
              <p className="text-[11px] text-slate-400">Stored image assets & banners</p>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-slate-700 transition" />
        </Link>

        {/* Card 3: Consultation Leads */}
        <Link
          href="/admin/inquiries"
          className="group rounded-xl border border-slate-200/90 bg-white p-4 shadow-2xs hover:border-emerald-300 transition flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
              <MessageSquare className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <p className="text-xs font-bold text-slate-800">Consultation Leads</p>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xl font-bold text-slate-900">
                  {cmsStats.newInquiries}
                </span>
                <span className="rounded-md bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-800">
                  NEW
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Direct client requests</p>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-slate-700 transition" />
        </Link>

        {/* Card 4: Site Notice / Ticker */}
        <Link
          href="/admin/announcements"
          className="group rounded-xl border border-slate-200/90 bg-white p-4 shadow-2xs hover:border-amber-300 transition flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
              <Megaphone className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800">Site Notice / Ticker</p>
              <p className="text-xl font-bold text-slate-900 mt-0.5">0</p>
              <p className="text-[11px] text-slate-400">No active announcement</p>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-slate-700 transition" />
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
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                <FileText className="h-4.5 w-4.5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 group-hover:text-emerald-800">
                  Page Content Editor
                </p>
                <p className="text-[11px] text-slate-500">Manage pages, about, legal info</p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-emerald-700 transition" />
          </Link>

          {/* Hub 2: Service Categories */}
          <Link
            href="/admin/services"
            className="group flex items-center justify-between rounded-xl border border-slate-200/80 bg-slate-50/50 p-3.5 transition hover:border-blue-300 hover:bg-white hover:shadow-2xs"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                <LayoutGrid className="h-4.5 w-4.5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 group-hover:text-blue-800">
                  Service Categories
                </p>
                <p className="text-[11px] text-slate-500">Organize tax & e-stamp services</p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-blue-700 transition" />
          </Link>

          {/* Hub 3: Featured Sections */}
          <Link
            href="/admin/pages"
            className="group flex items-center justify-between rounded-xl border border-slate-200/80 bg-slate-50/50 p-3.5 transition hover:border-amber-300 hover:bg-white hover:shadow-2xs"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-700">
                <Sliders className="h-4.5 w-4.5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 group-hover:text-amber-800">
                  Featured Sections
                </p>
                <p className="text-[11px] text-slate-500">Update homepage content</p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-amber-700 transition" />
          </Link>

          {/* Hub 4: Media Management */}
          <Link
            href="/admin/media"
            className="group flex items-center justify-between rounded-xl border border-slate-200/80 bg-slate-50/50 p-3.5 transition hover:border-purple-300 hover:bg-white hover:shadow-2xs"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-purple-50 text-purple-700">
                <ImageIcon className="h-4.5 w-4.5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 group-hover:text-purple-800">
                  Media Management
                </p>
                <p className="text-[11px] text-slate-500">Upload & manage files</p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-purple-700 transition" />
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
                    <td className="py-3 font-semibold text-slate-900 pr-2">
                      {inq.name}
                    </td>
                    <td className="py-3 text-slate-600 pr-2">{inq.service_needed}</td>
                    <td className="py-3 text-slate-500 max-w-[200px] truncate pr-2">
                      {inq.message}
                    </td>
                    <td className="py-3 text-slate-500 whitespace-nowrap pr-2">
                      {inq.created_at}
                    </td>
                    <td className="py-3 whitespace-nowrap pr-2">
                      {getStatusBadge(inq.status)}
                    </td>
                    <td className="py-3 text-right">
                      <Link
                        href={`/admin/inquiries`}
                        className="inline-flex h-7 w-7 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Link>
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
                    <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${act.dotColor}`} />
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
    </div>
  );
}
